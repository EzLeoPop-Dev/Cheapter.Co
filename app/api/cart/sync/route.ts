import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/src/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

async function requireUser() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? session.user : null;
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const guestCartItems = body.items || [];

    if (guestCartItems.length === 0) {
      return NextResponse.json({ success: true, message: "Empty guest cart" });
    }

    // Process each item
    for (const item of guestCartItems) {
      const bookId = Number(item.bookId);
      const quantity = Math.max(1, Number(item.quantity) || 1);

      if (!Number.isInteger(bookId)) continue;

      const book = await prisma.book.findUnique({ where: { id: bookId } });
      if (!book) continue;

      // Skip EBooks if they are already owned
      if (book.bookType === "EBook") {
        const owned = await prisma.userLibrary.findFirst({
          where: { userId: user.id, bookId: bookId }
        });
        if (owned) continue;
      }
      
      // Stock check for physical books
      if (book.bookType !== "EBook" && book.stock <= 0) {
        continue;
      }

      const finalQty = book.bookType === "EBook" ? 1 : Math.min(quantity, book.stock);

      await prisma.cartItem.upsert({
        where: { userId_bookId: { userId: user.id, bookId: bookId } },
        create: { userId: user.id, bookId: bookId, quantity: finalQty },
        update: { 
           // For E-Book, we keep quantity to 1. For physical, we add but cap at stock.
           quantity: book.bookType === "EBook" ? 1 : { increment: finalQty }
        },
      });
      
      if (book.bookType !== "EBook") {
         const currentCartItem = await prisma.cartItem.findUnique({
           where: { userId_bookId: { userId: user.id, bookId: bookId } }
         });
         if (currentCartItem && currentCartItem.quantity > book.stock) {
           await prisma.cartItem.update({
             where: { id: currentCartItem.id },
             data: { quantity: book.stock }
           });
         }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart sync error:", error);
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/src/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

async function requireUser() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? session.user : null;
}

function serializeCartItem(item: any) {
  const isPack = item.book.bookType === "Pack";
  return {
    id: item.id,
    bookId: item.bookId,
    title: item.book.title,
    author: item.book.author,
    price: Number(item.book.price),
    quantity: item.quantity,
    imageUrl: item.book.image,
    stock: item.book.stock,
    bookType: item.book.bookType,
    isPack,
    packItems: isPack
      ? (item.book.packItems ?? []).map((pi: any) => ({
          id: pi.id,
          quantity: pi.quantity,
          book: {
            title: pi.book.title,
            author: pi.book.author,
            cover: pi.book.image ?? null,
          },
        }))
      : undefined,
  };
}

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      book: {
        include: {
          packItems: {
            include: { book: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items: items.map(serializeCartItem) });
}


export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookId, quantity = 1 } = await req.json();
  const parsedBookId = Number(bookId);
  const parsedQuantity = Math.max(1, Number(quantity) || 1);

  if (!Number.isInteger(parsedBookId)) {
    return NextResponse.json({ error: "Invalid bookId" }, { status: 400 });
  }

  const book = await prisma.book.findUnique({ where: { id: parsedBookId } });
  if (!book || (book.bookType !== "EBook" && book.stock <= 0)) {
    return NextResponse.json({ error: "Book is unavailable" }, { status: 400 });
  }

  if (book.bookType === "EBook") {
    const owned = await prisma.userLibrary.findFirst({
      where: { userId: user.id, bookId: parsedBookId }
    });
    if (owned) {
      return NextResponse.json({ error: "คุณมีหนังสือ E-Book เล่มนี้ในคลังแล้ว" }, { status: 400 });
    }
    
    // For EBook, quantity is always 1. If it exists in cart, don't increment.
    await prisma.cartItem.upsert({
      where: { userId_bookId: { userId: user.id, bookId: parsedBookId } },
      create: { userId: user.id, bookId: parsedBookId, quantity: 1 },
      update: { quantity: 1 },
    });
  } else {
    const finalQty = Math.min(parsedQuantity, book.stock);
    await prisma.cartItem.upsert({
      where: { userId_bookId: { userId: user.id, bookId: parsedBookId } },
      create: { userId: user.id, bookId: parsedBookId, quantity: finalQty },
      update: { quantity: { increment: parsedQuantity } },
    });
    
    // Optional: cap again if increment exceeded stock
    const currentItem = await prisma.cartItem.findUnique({
      where: { userId_bookId: { userId: user.id, bookId: parsedBookId } }
    });
    if (currentItem && currentItem.quantity > book.stock) {
      await prisma.cartItem.update({
        where: { id: currentItem.id },
        data: { quantity: book.stock }
      });
    }
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { book: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items: items.map(serializeCartItem) });
}

export async function PATCH(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId, quantity } = await req.json();
  const parsedItemId = Number(itemId);
  const parsedQuantity = Math.max(1, Number(quantity) || 1);

  const item = await prisma.cartItem.findFirst({
    where: { id: parsedItemId, userId: user.id },
    include: { book: true },
  });

  if (!item) return NextResponse.json({ error: "Cart item not found" }, { status: 404 });

  const finalQty = item.book.bookType === "EBook" ? 1 : Math.min(parsedQuantity, item.book.stock);

  await prisma.cartItem.update({
    where: { id: parsedItemId },
    data: { quantity: finalQty },
  });

  return GET();
}

export async function DELETE(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const itemId = Number(searchParams.get("itemId"));

  await prisma.cartItem.deleteMany({ where: { id: itemId, userId: user.id } });
  return GET();
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pack = await prisma.book.findUnique({
      where: {
        id: Number(id),
        bookType: 'Pack'
      },
      include: {
        packItems: {
          include: {
            book: true
          }
        }
      }
    });

    if (!pack) {
      return NextResponse.json({ error: "Book pack not found" }, { status: 404 });
    }

    return NextResponse.json(pack);
  } catch (error) {
    console.error("Error fetching book pack:", error);
    return NextResponse.json({ error: "Failed to fetch book pack" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, price, stock, stockStatus, image, packItems } = body;

    // First delete all existing items
    await prisma.bookPackItem.deleteMany({
      where: { packId: Number(id) }
    });

    // Then update the pack and add new items
    const updatedPack = await prisma.book.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        price,
        stock: Number(stock),
        stockStatus,
        image,
        packItems: {
          create: packItems.map((item: any) => ({
            bookId: Number(item.bookId),
            quantity: Number(item.quantity) || 1
          }))
        }
      },
      include: {
        packItems: true
      }
    });

    return NextResponse.json(updatedPack);
  } catch (error) {
    console.error("Error updating book pack:", error);
    return NextResponse.json({ error: "Failed to update book pack" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.book.delete({
      where: { 
        id: Number(id),
        bookType: 'Pack' 
      }
    });

    return NextResponse.json({ message: "Book pack deleted successfully" });
  } catch (error) {
    console.error("Error deleting book pack:", error);
    return NextResponse.json({ error: "Failed to delete book pack" }, { status: 500 });
  }
}

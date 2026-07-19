import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    // Fetch all books where bookType is Pack
    const packs = await prisma.book.findMany({
      where: {
        bookType: 'Pack',
        title: {
          contains: search,
          mode: 'insensitive'
        }
      },
      include: {
        packItems: {
          include: {
            book: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(packs);
  } catch (error) {
    console.error("Error fetching book packs:", error);
    return NextResponse.json({ error: "Failed to fetch book packs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, price, stock, stockStatus, image, packItems } = body;

    if (!title || price == null) {
      return NextResponse.json({ error: "Title and price are required" }, { status: 400 });
    }

    const pack = await prisma.book.create({
      data: {
        title,
        author: "Various", // Or default
        description,
        price,
        stock: Number(stock),
        stockStatus: stockStatus || "InStock",
        image,
        bookType: 'Pack',
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

    return NextResponse.json(pack, { status: 201 });
  } catch (error) {
    console.error("Error creating book pack:", error);
    return NextResponse.json({ error: "Failed to create book pack" }, { status: 500 });
  }
}

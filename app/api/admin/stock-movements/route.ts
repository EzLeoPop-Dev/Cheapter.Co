import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');
    const type = searchParams.get('type');
    const limit = Number(searchParams.get('limit')) || 50;

    const where: any = {};
    if (bookId) where.bookId = Number(bookId);
    if (type) where.type = type;

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        book: {
          select: { id: true, title: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    return NextResponse.json({ error: "Failed to fetch stock movements" }, { status: 500 });
  }
}

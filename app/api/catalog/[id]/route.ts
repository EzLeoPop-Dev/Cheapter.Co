import { NextRequest } from "next/server";

import { prisma } from "@/src/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const parsedId = Number(id);
    if (!Number.isInteger(parsedId)) {
      return Response.json({ message: "Invalid book id" }, { status: 400 });
    }

    const dbBook = await prisma.book.findUnique({
      where: { id: parsedId },
      include: {
        category: {
          select: { name: true },
        },
      },
    });

    if (dbBook) {
      return Response.json({
        source: "database",
        book: {
          id: dbBook.id,
          title: dbBook.title,
          author: dbBook.author,
          description: dbBook.description,
          imageUrl: dbBook.image,
          price: Number(dbBook.price),
          category: dbBook.category?.name ?? null,
          format: dbBook.bookType,
          quantity: dbBook.stock,
          rating: dbBook.rating ? Number(dbBook.rating) : null,
          reviewCount: dbBook.reviewCount,
          createdAt: dbBook.createdAt,
        },
      });
    }

    return Response.json({ message: "Book not found" }, { status: 404 });
  } catch (error) {
    console.error("GET /api/catalog/[id] failed", error);
    return Response.json({ message: "Unable to load book" }, { status: 500 });
  }
}

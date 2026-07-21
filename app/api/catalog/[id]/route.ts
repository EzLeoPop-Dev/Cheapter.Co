import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

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
        publisher: {
          select: { name: true },
        },
      },
    });

    if (dbBook) {
      let quote = null;
      if (dbBook.sampleData && typeof dbBook.sampleData === "object" && !Array.isArray(dbBook.sampleData)) {
        const sd = dbBook.sampleData as Record<string, any>;
        if (typeof sd.quote === "string") {
          quote = sd.quote;
        }
      }

      let isOwned = false;
      if (dbBook.bookType === "EBook") {
        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
          const owned = await prisma.userLibrary.findFirst({
            where: { userId: session.user.id, bookId: dbBook.id }
          });
          if (owned) isOwned = true;
        }
      }

      return NextResponse.json({
        source: "database",
        book: {
          id: dbBook.id,
          title: dbBook.title,
          author: dbBook.author,
          description: dbBook.description,
          imageUrl: dbBook.image,
          price: Number(dbBook.price),
          category: dbBook.category?.name ?? null,
          publisher: dbBook.publisher?.name ?? null,
          isbn: dbBook.isbn ?? null,
          pages: dbBook.pages ?? null,
          language: "Thai", // Default to Thai if null
          publishDate: dbBook.publishDate ?? null,
          format: dbBook.bookType,
          quantity: dbBook.stock,
          rating: dbBook.rating ? Number(dbBook.rating) : null,
          reviewCount: dbBook.reviewCount,
          createdAt: dbBook.createdAt,
          ebookFile: dbBook.ebookFile,
          sampleLimit: dbBook.sampleLimit,
          quote: quote,
          isOwned: isOwned,
        },
      });
    }

    return Response.json({ message: "Book not found" }, { status: 404 });
  } catch (error) {
    console.error("GET /api/catalog/[id] failed", error);
    return Response.json({ message: "Unable to load book" }, { status: 500 });
  }
}

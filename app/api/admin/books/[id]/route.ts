import { NextRequest } from "next/server";

import { prisma } from "@/src/lib/prisma";

type PatchBody = {
  title?: string;
  author?: string;
  description?: string | null;
  price?: number;
  image?: string | null;
  bookType?: "Hardcover" | "EBook" | "Manga";
  publisherName?: string;
};

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

    const book = await prisma.book.findUnique({
      where: { id: parsedId },
      include: {
        publisher: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!book) {
      return Response.json({ message: "Book not found" }, { status: 404 });
    }

    return Response.json({
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        price: Number(book.price),
        image: book.image,
        stock: book.stock,
        stockStatus: book.stockStatus,
        bookType: book.bookType,
        publisherName: book.publisher?.name ?? "",
      },
    });
  } catch (error) {
    console.error("GET /api/admin/books/[id] failed", error);
    return Response.json({ message: "Unable to load book" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId)) {
      return Response.json({ message: "Invalid book id" }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as PatchBody | null;
    if (!body) {
      return Response.json({ message: "Invalid request body" }, { status: 400 });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const author = typeof body.author === "string" ? body.author.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : null;
    const image = typeof body.image === "string" ? body.image.trim() : null;
    const price = Number(body.price);
    const publisherName = typeof body.publisherName === "string" ? body.publisherName.trim() : "";

    if (!title || !author || Number.isNaN(price) || price < 0) {
      return Response.json({ message: "Invalid book data" }, { status: 400 });
    }

    const bookType =
      body.bookType === "Hardcover" || body.bookType === "EBook" || body.bookType === "Manga"
        ? body.bookType
        : "Hardcover";

    const updated = await prisma.book.update({
      where: { id: parsedId },
      data: {
        title,
        author,
        description,
        image,
        price,
        bookType,
        publisher: publisherName
          ? {
              connectOrCreate: {
                where: { name: publisherName },
                create: { name: publisherName },
              },
            }
          : {
              disconnect: true,
            },
      },
      include: {
        publisher: {
          select: {
            name: true,
          },
        },
      },
    });

    return Response.json({
      book: {
        id: updated.id,
        title: updated.title,
        author: updated.author,
        description: updated.description,
        price: Number(updated.price),
        image: updated.image,
        stock: updated.stock,
        stockStatus: updated.stockStatus,
        bookType: updated.bookType,
        publisherName: updated.publisher?.name ?? "",
      },
    });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;

    if (code === "P2025") {
      return Response.json({ message: "Book not found" }, { status: 404 });
    }

    console.error("PATCH /api/admin/books/[id] failed", error);
    return Response.json({ message: "Unable to update book" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId)) {
      return Response.json({ message: "Invalid book id" }, { status: 400 });
    }

    await prisma.book.delete({ where: { id: parsedId } });

    return Response.json({ success: true });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;

    if (code === "P2025") {
      return Response.json({ message: "Book not found" }, { status: 404 });
    }

    console.error("DELETE /api/admin/books/[id] failed", error);
    return Response.json({ message: "Unable to delete book" }, { status: 500 });
  }
}

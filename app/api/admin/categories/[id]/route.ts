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
      return Response.json({ message: "Invalid category id" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id: parsedId },
      include: {
        books: {
          select: {
            id: true,
            title: true,
            author: true,
            price: true,
            stock: true,
            bookType: true,
            image: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!category) {
      return Response.json({ message: "Category not found" }, { status: 404 });
    }

    return Response.json({
      category: {
        id: category.id,
        name: category.name,
        books: category.books.map((book) => ({
          id: book.id,
          title: book.title,
          author: book.author,
          price: Number(book.price),
          stock: book.stock,
          bookType: book.bookType,
          image: book.image,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/categories/[id] failed", error);
    return Response.json({ message: "Unable to load category detail" }, { status: 500 });
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
      return Response.json({ message: "Invalid category id" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const addBookIds = Array.isArray(body?.addBookIds)
      ? body.addBookIds
          .map((id: unknown) => Number(id))
          .filter((id: number) => Number.isInteger(id))
      : [];
    const removeBookIds = Array.isArray(body?.removeBookIds)
      ? body.removeBookIds
          .map((id: unknown) => Number(id))
          .filter((id: number) => Number.isInteger(id))
      : [];

    if (!name && addBookIds.length === 0 && removeBookIds.length === 0) {
      return Response.json(
        { message: "At least one of name, addBookIds, removeBookIds is required" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      if (name) {
        await tx.category.update({
          where: { id: parsedId },
          data: { name },
        });
      }

      if (addBookIds.length > 0) {
        await tx.book.updateMany({
          where: {
            id: { in: addBookIds },
          },
          data: {
            categoryId: parsedId,
          },
        });
      }

      if (removeBookIds.length > 0) {
        await tx.book.updateMany({
          where: {
            id: { in: removeBookIds },
            categoryId: parsedId,
          },
          data: {
            categoryId: null,
          },
        });
      }
    });

    const category = await prisma.category.findUnique({
      where: { id: parsedId },
      include: {
        _count: {
          select: { books: true },
        },
      },
    });

    if (!category) {
      return Response.json({ message: "Category not found" }, { status: 404 });
    }

    return Response.json({
      category: { id: category.id, name: category.name, count: category._count.books },
    });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;

    if (code === "P2002") {
      return Response.json({ message: "Category name already exists" }, { status: 409 });
    }
    if (code === "P2025") {
      return Response.json({ message: "Category not found" }, { status: 404 });
    }

    console.error("PATCH /api/admin/categories/[id] failed", error);
    return Response.json({ message: "Unable to update category" }, { status: 500 });
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
      return Response.json({ message: "Invalid category id" }, { status: 400 });
    }

    await prisma.category.delete({ where: { id: parsedId } });

    return Response.json({ success: true });
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;

    if (code === "P2025") {
      return Response.json({ message: "Category not found" }, { status: 404 });
    }

    console.error("DELETE /api/admin/categories/[id] failed", error);
    return Response.json({ message: "Unable to delete category" }, { status: 500 });
  }
}

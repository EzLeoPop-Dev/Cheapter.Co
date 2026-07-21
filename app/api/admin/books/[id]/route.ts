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
  categoryId?: number | string | null;
  status?: "draft" | "active" | "discontinued";
  ebookFile?: string | null;
  sampleLimit?: number | null;
  chapters?: any[];
};

function resolveAdminStatus(sampleData: unknown, stock: number): "draft" | "active" | "discontinued" {
  if (sampleData && typeof sampleData === "object" && !Array.isArray(sampleData)) {
    const status = (sampleData as Record<string, unknown>).adminStatus;
    if (status === "draft" || status === "active" || status === "discontinued") {
      return status;
    }
  }

  return stock > 0 ? "active" : "draft";
}

function toObjectSampleData(sampleData: unknown): Record<string, unknown> {
  if (sampleData && typeof sampleData === "object" && !Array.isArray(sampleData)) {
    return sampleData as Record<string, unknown>;
  }

  return {};
}

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
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        episodes: {
          orderBy: { orderIndex: 'asc' }
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
        ebookFile: book.ebookFile,
        sampleLimit: book.sampleLimit,
        status: resolveAdminStatus(book.sampleData, book.stock),
        categoryId: book.category?.id ?? null,
        categoryName: book.category?.name ?? null,
        publisherName: book.publisher?.name ?? "",
        episodes: book.episodes || [],
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

    const ebookFile = typeof body.ebookFile === "string" ? body.ebookFile.trim() : undefined;
    const sampleLimit = typeof body.sampleLimit === "number" ? body.sampleLimit : undefined;

    if (!title || !author || Number.isNaN(price) || price < 0) {
      return Response.json({ message: "Invalid book data" }, { status: 400 });
    }

    const bookType =
      body.bookType === "Hardcover" || body.bookType === "EBook" || body.bookType === "Manga"
        ? body.bookType
        : "Hardcover";
    const status =
      body.status === "draft" || body.status === "active" || body.status === "discontinued"
        ? body.status
        : undefined;

    const chapters = Array.isArray(body.chapters) ? body.chapters : undefined;
    const hasCategoryId = Object.prototype.hasOwnProperty.call(body, "categoryId");
    let categoryId: number | null | undefined = undefined;
    if (hasCategoryId) {
      if (body.categoryId === null || body.categoryId === "") {
        categoryId = null;
      } else {
        const parsedCategoryId = Number(body.categoryId);
        if (!Number.isInteger(parsedCategoryId)) {
          return Response.json({ message: "Invalid category id" }, { status: 400 });
        }
        categoryId = parsedCategoryId;
      }
    }

    const existingBook = await prisma.book.findUnique({
      where: { id: parsedId },
      select: { sampleData: true },
    });

    if (!existingBook) {
      return Response.json({ message: "Book not found" }, { status: 404 });
    }

    const currentSampleData = toObjectSampleData(existingBook.sampleData);

    const updated = await prisma.book.update({
      where: { id: parsedId },
      data: {
        title,
        author,
        description,
        image,
        price,
        bookType,
        ...(ebookFile !== undefined ? { ebookFile } : {}),
        ...(sampleLimit !== undefined ? { sampleLimit } : {}),
        ...(status
          ? {
            sampleData: {
              ...currentSampleData,
              adminStatus: status,
            },
          }
          : {}),
        ...(categoryId !== undefined
          ? {
            category:
              categoryId === null
                ? { disconnect: true }
                : { connect: { id: categoryId } },
          }
          : {}),
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
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        episodes: true,
      },
    });

    if (chapters && updated.bookType === "Manga") {
      // Upsert chapters
      const existingEpisodes = updated.episodes || [];
      const incomingIds = chapters.map((ch: any) => ch.id).filter((id: any) => typeof id === 'number');

      // Delete episodes that are removed
      const episodesToDelete = existingEpisodes.filter(ep => !incomingIds.includes(ep.id));
      if (episodesToDelete.length > 0) {
        await prisma.bookEpisode.deleteMany({
          where: { id: { in: episodesToDelete.map(ep => ep.id) } }
        });
      }

      // Upsert
      for (const ch of chapters) {
        if (typeof ch.id === 'number') {
          await prisma.bookEpisode.update({
            where: { id: ch.id },
            data: {
              title: ch.title,
              isFree: Number(ch.price) === 0,
              pdfUrl: ch.pdfUrl || null,
              orderIndex: Number(ch.chapterNumber) || 1
            }
          });
        } else {
          await prisma.bookEpisode.create({
            data: {
              bookId: updated.id,
              title: ch.title,
              isFree: Number(ch.price) === 0,
              pdfUrl: ch.pdfUrl || null,
              orderIndex: Number(ch.chapterNumber) || 1
            }
          });
        }
      }
    }

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
        ebookFile: updated.ebookFile,
        sampleLimit: updated.sampleLimit,
        status: resolveAdminStatus(updated.sampleData, updated.stock),
        categoryId: updated.category?.id ?? null,
        categoryName: updated.category?.name ?? null,
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
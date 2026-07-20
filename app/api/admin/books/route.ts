import { NextRequest } from "next/server";

import { prisma } from "@/src/lib/prisma";

function resolveAdminStatus(sampleData: unknown, stock: number): "draft" | "active" | "discontinued" {
  if (sampleData && typeof sampleData === "object" && !Array.isArray(sampleData)) {
    const status = (sampleData as Record<string, unknown>).adminStatus;
    if (status === "draft" || status === "active" || status === "discontinued") {
      return status;
    }
  }

  return stock > 0 ? "active" : "draft";
}

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      where: {
        bookType: { not: "Pack" }
      },
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      image: book.image,
      price: Number(book.price),
      stock: book.stock,
      stockStatus: book.stockStatus,
      bookType: book.bookType,
      status: resolveAdminStatus(book.sampleData, book.stock),
      categoryId: book.categoryId ?? null,
      categoryName: book.category?.name ?? null,
      createdAt: book.createdAt,
    }));

    return Response.json({ books: data });
  } catch (error) {
    console.error("GET /api/admin/books failed", error);
    return Response.json({ message: "Unable to load books" }, { status: 500 });
  }
}

type PostBody = {
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
  quote?: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as PostBody | null;

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const author = typeof body?.author === "string" ? body.author.trim() : "";
    const description =
      typeof body?.description === "string" ? body.description.trim() : body?.description ?? null;
    const price = Number(body?.price);
    const image = typeof body?.image === "string" ? body.image.trim() : body?.image ?? null;
    const publisherName =
      typeof body?.publisherName === "string" ? body.publisherName.trim() : "";
    const bookType =
      body?.bookType === "Hardcover" || body?.bookType === "EBook" || body?.bookType === "Manga"
        ? body.bookType
        : "Hardcover";
    const status =
      body?.status === "draft" || body?.status === "active" || body?.status === "discontinued"
        ? body.status
        : "draft";

    const ebookFile = typeof body?.ebookFile === "string" ? body.ebookFile.trim() : null;
    const sampleLimit = typeof body?.sampleLimit === "number" ? body.sampleLimit : null;
    const quote = typeof body?.quote === "string" ? body.quote.trim() : null;

    if (!title) {
      return Response.json({ message: "Title is required" }, { status: 400 });
    }
    if (!author) {
      return Response.json({ message: "Author is required" }, { status: 400 });
    }
    if (!Number.isFinite(price) || price < 0) {
      return Response.json({ message: "Price must be a non-negative number" }, { status: 400 });
    }

    let categoryId: number | null = null;
    if (body && Object.prototype.hasOwnProperty.call(body, "categoryId")) {
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

    const sampleData = {
      adminStatus: status,
      ...(quote ? { quote } : {}),
    } as any;

    const created = await prisma.book.create({
      data: {
        title,
        author,
        description,
        price,
        image,
        bookType,
        stock: 0,
        stockStatus: "OutOfStock",
        sampleData,
        ebookFile,
        sampleLimit,
        ...(publisherName
          ? {
              publisher: {
                connectOrCreate: {
                  where: { name: publisherName },
                  create: { name: publisherName },
                },
              },
            }
          : {}),
        ...(categoryId !== null
          ? {
              category: {
                connect: { id: categoryId },
              },
            }
          : {}),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return Response.json(
      {
        book: {
          id: created.id,
          title: created.title,
          author: created.author,
          price: Number(created.price),
          bookType: created.bookType,
          status: resolveAdminStatus(created.sampleData, created.stock),
          categoryId: created.categoryId ?? null,
          categoryName: (created as any).category?.name ?? null,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;

    if (code === "P2025") {
      return Response.json({ message: "Category or related entity not found" }, { status: 404 });
    }

    console.error("POST /api/admin/books failed", error);
    return Response.json({ message: "Unable to create book" }, { status: 500 });
  }
}
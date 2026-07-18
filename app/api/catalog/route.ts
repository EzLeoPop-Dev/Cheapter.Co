import { NextRequest } from "next/server";
import type { Prisma, BookType } from "@prisma/client";

import { prisma } from "@/src/lib/prisma";

type SortBy = "newest" | "price_asc" | "price_desc" | "title_asc" | "rating_desc";

const DEFAULT_SORT: SortBy = "newest";

function parseSortBy(value: string | null): SortBy {
  if (
    value === "newest" ||
    value === "price_asc" ||
    value === "price_desc" ||
    value === "title_asc" ||
    value === "rating_desc"
  ) {
    return value;
  }

  return DEFAULT_SORT;
}

function parseFormats(value: string | null): BookType[] {
  if (!value) {
    return [];
  }

  const rawFormats = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return rawFormats.filter(
    (format): format is BookType =>
      format === "Hardcover" || format === "EBook" || format === "Manga" || format === "Pack",
  );
}

function parsePrice(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function parseLimit(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return Math.min(parsed, 20);
}

function parsePage(value: string | null): number {
  if (!value) {
    return 1;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function sortToOrderBy(sortBy: SortBy): Prisma.BookOrderByWithRelationInput[] {
  switch (sortBy) {
    case "price_asc":
      return [{ price: "asc" }, { createdAt: "desc" }];
    case "price_desc":
      return [{ price: "desc" }, { createdAt: "desc" }];
    case "title_asc":
      return [{ title: "asc" }, { createdAt: "desc" }];
    case "rating_desc":
      return [{ rating: "desc" }, { reviewCount: "desc" }, { createdAt: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const category = searchParams.get("category")?.trim() ?? "";
    const formats = parseFormats(searchParams.get("formats"));
    const minPrice = parsePrice(searchParams.get("minPrice"));
    const maxPrice = parsePrice(searchParams.get("maxPrice"));
    const sortBy = parseSortBy(searchParams.get("sortBy"));
    const query = searchParams.get("q")?.trim() ?? "";
    const pageSize = parseLimit(searchParams.get("limit")) ?? 12;
    const requestedPage = parsePage(searchParams.get("page"));

    const where: Prisma.BookWhereInput = {};

    if (category) {
      where.category = {
        is: {
          name: {
            equals: category,
            mode: "insensitive",
          },
        },
      };
    }

    if (formats.length > 0) {
      where.bookType = {
        in: formats,
      };
    }

    if (minPrice !== null || maxPrice !== null) {
      where.price = {
        ...(minPrice !== null ? { gte: minPrice } : {}),
        ...(maxPrice !== null ? { lte: maxPrice } : {}),
      };
    }

    if (query) {
      where.OR = [
        {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          author: {
            contains: query,
            mode: "insensitive",
          },
        },
      ];
    }

    const totalCount = await prisma.book.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const page = Math.min(requestedPage, totalPages);

    const [books, categories, formatFacets, priceStats] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: sortToOrderBy(sortBy),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.category.findMany({
        orderBy: {
          name: "asc",
        },
      }),
      prisma.book.groupBy({
        by: ["bookType"],
      }),
      prisma.book.aggregate({
        _min: {
          price: true,
        },
        _max: {
          price: true,
        },
      }),
    ]);

    const mappedBooks = books.map((book: {
      id: number;
      title: string;
      author: string;
      description: string | null;
      image: string | null;
      price: Prisma.Decimal;
      category: { name: string } | null;
      bookType: BookType;
      stock: number;
      rating: Prisma.Decimal | null;
      reviewCount: number;
      createdAt: Date;
    }) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      imageUrl: book.image,
      price: Number(book.price),
      category: book.category?.name ?? null,
      format: book.bookType,
      quantity: book.stock,
      rating: book.rating ? Number(book.rating) : null,
      reviewCount: book.reviewCount,
      createdAt: book.createdAt,
    }));

    const responseCategories = categories.map((item: { name: string }) => item.name);

    const responseFormats = formatFacets.map((item: { bookType: BookType }) => item.bookType);

    const minPriceFromDb = priceStats._min.price ? Number(priceStats._min.price) : 0;
    const maxPriceFromDb = priceStats._max.price ? Number(priceStats._max.price) : 0;

    return Response.json({
      books: mappedBooks,
      facets: {
        categories: responseCategories,
        formats: responseFormats,
        priceRange: {
          min: minPriceFromDb,
          max: maxPriceFromDb,
        },
      },
      appliedFilters: {
        category: category || null,
        formats,
        minPrice,
        maxPrice,
        query: query || null,
        sortBy,
        source: "database",
      },
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/catalog failed", error);

    return Response.json(
      {
        message: "Unable to load catalog",
      },
      {
        status: 500,
      },
    );
  }
}

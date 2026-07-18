import { NextRequest } from "next/server";

import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { books: true },
        },
      },
    });

    const data = categories.map((category) => ({
      id: category.id,
      name: category.name,
      count: category._count.books,
    }));

    return Response.json({ categories: data });
  } catch (error) {
    console.error("GET /api/admin/categories failed", error);
    return Response.json({ message: "Unable to load categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name) {
      return Response.json({ message: "Category name is required" }, { status: 400 });
    }

    const category = await prisma.category.create({ data: { name } });

    return Response.json(
      { category: { id: category.id, name: category.name, count: 0 } },
      { status: 201 },
    );
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;

    if (code === "P2002") {
      return Response.json({ message: "Category name already exists" }, { status: 409 });
    }

    console.error("POST /api/admin/categories failed", error);
    return Response.json({ message: "Unable to create category" }, { status: 500 });
  }
}

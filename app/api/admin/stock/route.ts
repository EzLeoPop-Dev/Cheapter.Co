import { NextRequest } from "next/server";

import { prisma } from "@/src/lib/prisma";

type AdjustMode = "add" | "remove" | "set";

type PatchBody = {
  bookId?: number;
  quantity?: number;
  mode?: AdjustMode;
  reason?: string;
};

function getReorderPoint(bookType: "Hardcover" | "EBook" | "Manga" | "Pack") {
  if (bookType === "EBook") {
    return 0;
  }

  if (bookType === "Pack") {
    return 5;
  }

  return 10;
}

function getStockStatus(stock: number, reorderPoint: number) {
  if (stock <= 0) {
    return "OutOfStock" as const;
  }

  if (stock <= reorderPoint) {
    return "LowStock" as const;
  }

  return "InStock" as const;
}

function toStockItem(book: {
  id: number;
  title: string;
  price: { toString(): string } | number;
  stock: number;
  stockStatus: "InStock" | "LowStock" | "OutOfStock";
  bookType: "Hardcover" | "EBook" | "Manga" | "Pack";
  category: { name: string } | null;
  updatedAt: Date;
  orderItems?: { quantity: number }[];
}) {
  const reorderPoint = getReorderPoint(book.bookType);
  const status = getStockStatus(book.stock, reorderPoint) ?? book.stockStatus;

  return {
    id: book.id,
    name: book.title,
    category: book.category?.name ?? "Uncategorized",
    price: Number(book.price),
    current: book.stock,
    sold: book.orderItems ? book.orderItems.reduce((acc, item) => acc + item.quantity, 0) : 0,
    reserved: 0,
    available: book.stock,
    reorderPoint,
    status,
    logs: [
      {
        id: `init-${book.id}`,
        qty: 0,
        balance: book.stock,
        ref: "Current inventory snapshot",
        date: book.updatedAt.toISOString(),
      },
    ],
  };
}

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      include: {
        category: {
          select: { name: true },
        },
        orderItems: {
          where: {
            order: {
              status: { notIn: ["CANCELLED", "REFUNDED"] }
            }
          },
          select: { quantity: true }
        }
      },
      orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
    });

    return Response.json(books.map(toStockItem));
  } catch (error) {
    console.error("GET /api/admin/stock failed", error);
    return Response.json({ error: "Unable to load stock" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as PatchBody | null;

    if (!body) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const bookId = Number(body.bookId);
    const quantity = Number(body.quantity);
    const mode: AdjustMode = body.mode === "remove" || body.mode === "set" ? body.mode : "add";
    const reason = typeof body.reason === "string" ? body.reason.trim() : "Manual stock adjustment";

    if (!Number.isInteger(bookId) || !Number.isInteger(quantity) || quantity < 0) {
      return Response.json({ error: "Invalid stock adjustment" }, { status: 400 });
    }

    const existing = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        stock: true,
        title: true,
        bookType: true,
        category: {
          select: {
            name: true,
          },
        },
        price: true,
      },
    });

    if (!existing) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    let nextStock = existing.stock;

    if (mode === "add") {
      nextStock = existing.stock + quantity;
    } else if (mode === "remove") {
      nextStock = existing.stock - quantity;
    } else {
      nextStock = quantity;
    }

    if (nextStock < 0) {
      return Response.json({ error: "Stock cannot be negative" }, { status: 400 });
    }

    const reorderPoint = getReorderPoint(existing.bookType);
    const stockStatus = getStockStatus(nextStock, reorderPoint);

    const updated = await prisma.book.update({
      where: { id: bookId },
      data: {
        stock: nextStock,
        stockStatus,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const signedQuantity = mode === "remove" ? -quantity : mode === "set" ? nextStock - existing.stock : quantity;

    const movement = await prisma.stockMovement.create({
      data: {
        type: 'ADJUST',
        quantity: signedQuantity,
        bookId: bookId,
        note: reason,
        balanceAfter: nextStock,
        performedBy: 'Admin'
      }
    });

    return Response.json({
      ...toStockItem(updated),
      log: {
        id: movement.id,
        qty: movement.quantity,
        balance: movement.balanceAfter,
        ref: movement.note || 'ADJUST',
        date: movement.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/stock failed", error);
    return Response.json({ error: "Unable to update stock" }, { status: 500 });
  }
}
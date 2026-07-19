import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // --- Low Stock Notifications ---
    const lowStockBooks = await prisma.book.findMany({
      where: {
        stock: { lte: 5 },
      },
      select: {
        id: true,
        title: true,
        stock: true,
        image: true,
        sampleData: true
      },
      orderBy: { stock: 'asc' }
    });

    const activeLowStock = lowStockBooks.filter(book => {
      if (book.sampleData && typeof book.sampleData === 'object' && !Array.isArray(book.sampleData)) {
        const data = book.sampleData as any;
        if (data.adminStatus === 'draft' || data.adminStatus === 'discontinued') {
          return false;
        }
      }
      return true;
    });

    // --- Stock In Notifications (last 24 hours) ---
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentStockIns = await prisma.stockMovement.findMany({
      where: {
        type: 'IN',
        createdAt: { gte: twentyFourHoursAgo }
      },
      include: {
        book: {
          select: { id: true, title: true, image: true, stock: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({
      lowStock: {
        count: activeLowStock.length,
        items: activeLowStock
      },
      stockIn: {
        count: recentStockIns.length,
        items: recentStockIns.map(m => ({
          id: m.id,
          bookId: m.bookId,
          title: m.book.title,
          image: m.book.image,
          quantity: m.quantity,
          reference: m.reference,
          performedBy: m.performedBy,
          createdAt: m.createdAt,
          currentStock: m.book.stock
        }))
      }
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

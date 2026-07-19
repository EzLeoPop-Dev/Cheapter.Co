import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { supplier: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status && status !== 'all') {
      where.status = status.charAt(0).toUpperCase() + status.slice(1); // "pending" -> "Pending"
    }

    const pos = await prisma.purchaseOrder.findMany({
      where,
      include: {
        items: {
          include: {
            book: {
              select: { id: true, title: true, image: true, stock: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(pos);
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return NextResponse.json({ error: "Failed to fetch purchase orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supplier, expectedDate, items, createdBy, note } = body;

    if (!supplier || !items || items.length === 0) {
      return NextResponse.json({ error: "Supplier and at least one item are required" }, { status: 400 });
    }

    // Generate PO ID: PO-YYMM-NNN
    const now = new Date();
    const prefix = `PO-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const existing = await prisma.purchaseOrder.count({
      where: { id: { startsWith: prefix } }
    });
    const poId = `${prefix}-${String(existing + 1).padStart(3, '0')}`;

    const po = await prisma.purchaseOrder.create({
      data: {
        id: poId,
        supplier,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        createdBy: createdBy || 'Admin',
        note: note || null,
        items: {
          create: items.map((item: any) => ({
            bookId: Number(item.bookId),
            ordered: Number(item.ordered),
            unitCost: Number(item.unitCost),
          }))
        }
      },
      include: {
        items: {
          include: {
            book: { select: { id: true, title: true, image: true } }
          }
        }
      }
    });

    return NextResponse.json(po, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 });
  }
}

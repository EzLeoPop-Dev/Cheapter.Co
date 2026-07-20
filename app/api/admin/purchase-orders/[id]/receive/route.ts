import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: poId } = await params;
    const body = await req.json();
    const { receivedItems, performedBy } = body;
    // receivedItems: [{ bookId, goodQty, damagedQty, note }]

    if (!receivedItems || receivedItems.length === 0) {
      return NextResponse.json({ error: "No items to receive" }, { status: 400 });
    }

    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true }
    });

    if (!po) {
      return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    }

    const admin = performedBy || 'Admin';

    // Validate each received item first
    for (const item of receivedItems) {
      const bookId = Number(item.bookId);
      const goodQty = Number(item.goodQty) || 0;
      const damagedQty = Number(item.damagedQty) || 0;
      const totalReceived = goodQty + damagedQty;

      if (totalReceived <= 0) continue;

      const poItem = po.items.find(i => i.bookId === bookId);
      if (!poItem) {
        return NextResponse.json({ error: `ไม่พบหนังสือ ID ${bookId} ในใบสั่งซื้อนี้` }, { status: 400 });
      }

      if (poItem.received + totalReceived > poItem.ordered) {
        return NextResponse.json({ 
          error: `จำนวนรับเข้าเกินจำนวนที่สั่งซื้อ (หนังสือ ID ${bookId})` 
        }, { status: 400 });
      }
    }

    // Process each received item
    for (const item of receivedItems) {
      const bookId = Number(item.bookId);
      const goodQty = Number(item.goodQty) || 0;
      const damagedQty = Number(item.damagedQty) || 0;
      const totalReceived = goodQty + damagedQty;

      if (totalReceived <= 0) continue;

      // Update PO item received count
      const poItem = po.items.find(i => i.bookId === bookId);
      if (poItem) {
        await prisma.purchaseOrderItem.update({
          where: { id: poItem.id },
          data: { received: poItem.received + totalReceived }
        });
      }

      // Update book stock (only good items)
      if (goodQty > 0) {
        const book = await prisma.book.update({
          where: { id: bookId },
          data: { stock: { increment: goodQty } }
        });

        // Log stock movement - IN
        await prisma.stockMovement.create({
          data: {
            type: 'IN',
            quantity: goodQty,
            reference: poId,
            performedBy: admin,
            note: item.note || null,
            balanceAfter: book.stock,
            bookId
          }
        });
      }

      // Log damaged items
      if (damagedQty > 0) {
        const book = await prisma.book.findUnique({ where: { id: bookId } });
        await prisma.stockMovement.create({
          data: {
            type: 'DAMAGED',
            quantity: damagedQty,
            reference: poId,
            performedBy: admin,
            note: `Damaged: ${item.note || 'No note'}`,
            balanceAfter: book?.stock || 0,
            bookId
          }
        });
      }
    }

    // Refresh PO to check completion status
    const updatedPO = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true }
    });

    let allComplete = true;
    let anyReceived = false;
    if (updatedPO) {
      for (const item of updatedPO.items) {
        if (item.received > 0) anyReceived = true;
        if (item.received < item.ordered) allComplete = false;
      }
    }

    const newStatus = allComplete ? 'Completed' : anyReceived ? 'Partial' : 'Pending';
    const finalPO = await prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status: newStatus as any },
      include: {
        items: {
          include: {
            book: { select: { id: true, title: true, image: true, stock: true } }
          }
        }
      }
    });

    return NextResponse.json(finalPO);
  } catch (error) {
    console.error("Error receiving stock:", error);
    return NextResponse.json({ error: "Failed to receive stock" }, { status: 500 });
  }
}

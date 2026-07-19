import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function serializeOrder(order: any) {
  return {
    id: order.id,
    status: order.status,
    shippingMethod: order.shippingMethod,
    paymentMethod: order.paymentMethod,
    recipientName: order.recipientName,
    recipientPhone: order.recipientPhone,
    shippingAddress: order.shippingAddress,
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    discountAmount: Number(order.discountAmount),
    taxAmount: Number(order.taxAmount),
    totalAmount: Number(order.totalAmount),
    trackingNumber: order.trackingNumber,
    paymentTime: order.paymentTime,
    createdAt: order.createdAt,
    items: order.items.map((item: any) => ({
      id: item.id,
      bookId: item.bookId,
      title: item.bookTitle,
      imageUrl: item.bookImage,
      bookType: item.bookType,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
  };
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json({ order: serializeOrder(order) });
}

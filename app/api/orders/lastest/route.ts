import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/src/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findFirst({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  if (!order) return NextResponse.json({ order: null });

  return NextResponse.json({
    order: {
      id: order.id,
      status: order.status,
      shippingMethod: order.shippingMethod,
      paymentMethod: order.paymentMethod,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      shippingAddress: order.shippingAddress,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      taxAmount: Number(order.taxAmount),
      totalAmount: Number(order.totalAmount),
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        title: item.bookTitle,
        imageUrl: item.bookImage,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
    },
  });
}

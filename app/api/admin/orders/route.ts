import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/src/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "รอชำระเงิน",
  VERIFYING: "ตรวจสอบชำระเงิน",
  PREPARING: "รอแพ็ค",
  SHIPPING: "รอจัดส่ง",
  COMPLETED: "จัดส่งแล้ว",
  CANCELLED: "ยกเลิก",
  REFUNDED: "คืนเงิน",
};

const labelToStatus: Record<string, OrderStatus> = {
  รอชำระเงิน: "PENDING",
  ตรวจสอบชำระเงิน: "VERIFYING",
  รอแพ็ค: "PREPARING",
  เตรียมการจัดส่ง: "PREPARING",
  รอจัดส่ง: "SHIPPING",
  อยู่ระหว่างการจัดส่ง: "SHIPPING",
  จัดส่งแล้ว: "COMPLETED",
  สำเร็จ: "COMPLETED",
  ยกเลิก: "CANCELLED",
  คืนเงิน: "REFUNDED",
};

async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) return null;
  return session.user;
}

function serialize(order: any) {
  return {
    id: order.id,
    customer: order.recipientName,
    customerPhone: order.recipientPhone,
    date: new Date(order.createdAt).toLocaleDateString("th-TH"),
    amount: Number(order.totalAmount),
    status: statusLabels[order.status as OrderStatus],
    statusCode: order.status,
    address: order.shippingAddress,
    shippingMethod: order.shippingMethod,
    trackingNumber: order.trackingNumber,
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    discount: Number(order.discountAmount),
    promo: "-",
    paymentMethod: order.paymentMethod,
    paymentTime: order.paymentTime ? new Date(order.paymentTime).toLocaleString("th-TH") : "-",
    slipUrl: order.slipUrl,
    items: order.items.map((item: any) => ({
      name: item.bookTitle,
      price: Number(item.unitPrice),
      qty: item.quantity,
    })),
  };
}

export async function GET() {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders: orders.map(serialize) });
}

export async function PATCH(req: Request) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status, trackingNumber } = await req.json();
  const nextStatus = labelToStatus[String(status)] ?? status;

  if (!Object.values(OrderStatus).includes(nextStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: String(id) },
    data: {
      status: nextStatus,
      trackingNumber: trackingNumber || undefined,
    },
    include: { items: true },
  });

  return NextResponse.json({ order: serialize(order) });
}

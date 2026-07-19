import { NextResponse } from "next/server";
import { Prisma, OrderStatus, PaymentMethod, ShippingMethod } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/src/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

const paymentMap: Record<string, PaymentMethod> = {
  card: "credit_card",
  promptpay: "promptpay",
  cod: "cod",
};

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
    taxAmount: Number(order.taxAmount),
    totalAmount: Number(order.totalAmount),
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt,
    items: order.items.map((item: any) => ({
      title: item.bookTitle,
      imageUrl: item.bookImage,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
  };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const items = Array.isArray(body.items) ? body.items : [];
  const address = body.address;

  if (items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  if (!address?.name || !address?.streetAddress || !address?.city || !address?.zipCode) {
    return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
  }

  const shippingMethod: ShippingMethod = body.shippingMethod === "express" ? "express" : "standard";
  const paymentMethod = paymentMap[String(body.paymentMethod)] ?? "promptpay";
  const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => {
    return sum + Number(item.price) * Number(item.quantity);
  }, 0);
  const shippingFee = shippingMethod === "express" ? 12 : 0;
  const taxAmount = Number((subtotal * 0.08).toFixed(2));
  const totalAmount = Number((subtotal + shippingFee + taxAmount).toFixed(2));
  const status: OrderStatus = "VERIFYING";

  const order = await prisma.order.create({
    data: {
      userId: session?.user?.id ?? null,
      status,
      shippingMethod,
      paymentMethod,
      recipientName: address.name,
      recipientPhone: address.phone ?? null,
      shippingAddress: `${address.streetAddress}\n${address.city}, ${address.zipCode}`,
      subtotal: new Prisma.Decimal(subtotal),
      shippingFee: new Prisma.Decimal(shippingFee),
      taxAmount: new Prisma.Decimal(taxAmount),
      discountAmount: new Prisma.Decimal(0),
      totalAmount: new Prisma.Decimal(totalAmount),
      paymentTime: new Date(),
      items: {
        create: items.map((item: any) => ({
          quantity: Number(item.quantity) || 1,
          unitPrice: new Prisma.Decimal(Number(item.price) || 0),
          bookTitle: String(item.title),
          bookImage: item.imageUrl ?? null,
          bookType: "Hardcover",
          bookId: item.bookId ? Number(item.bookId) : null,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json({ order: serializeOrder(order) });
}

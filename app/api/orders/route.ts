import { NextResponse } from "next/server";
import { Prisma, OrderStatus, PaymentMethod, ShippingMethod } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/src/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders: orders.map(serializeOrder) });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const shippingMethod: ShippingMethod = body.shippingMethod === "express" ? "express" : "standard";
  const paymentMethod = paymentMap[String(body.paymentMethod)] ?? "promptpay";

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { book: true },
    orderBy: { createdAt: "asc" },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const selectedAddress = body.addressId
    ? await prisma.address.findFirst({ where: { id: Number(body.addressId), userId: session.user.id } })
    : null;

  const address = selectedAddress ?? body.address;
  if (!address?.name || !address?.streetAddress || !address?.city || !address?.zipCode) {
    return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
  }

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.book.price) * item.quantity, 0);
  const shippingFee = shippingMethod === "express" ? 12 : 0;
  const taxAmount = Number((subtotal * 0.08).toFixed(2));
  const totalAmount = Number((subtotal + shippingFee + taxAmount).toFixed(2));
  const status: OrderStatus = "VERIFYING";

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: session.user.id,
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
          create: cartItems.map((item) => ({
            quantity: item.quantity,
            unitPrice: item.book.price,
            bookTitle: item.book.title,
            bookImage: item.book.image,
            bookType: item.book.bookType,
            bookId: item.bookId,
          })),
        },
      },
      include: { items: true },
    });

    await tx.cartItem.deleteMany({ where: { userId: session.user.id } });
    return created;
  });

  return NextResponse.json({ order: serializeOrder(order) });
}

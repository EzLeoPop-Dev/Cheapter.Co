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

  // Validate coupon on backend
  let discountAmount = 0;
  let isFreeShipping = false;
  let promotionId: number | null = null;
  const couponCode = body.couponCode?.toUpperCase().trim();

  if (couponCode) {
    const promotion = await prisma.promotion.findUnique({
      where: { code: couponCode },
    });

    if (promotion && promotion.status === "Active") {
      const isExpired = promotion.endDate && new Date(promotion.endDate) < new Date();
      const meetMinPurchase = subtotal >= Number(promotion.minPurchase);

      if (!isExpired && meetMinPurchase) {
        // Check per-user usage: 1 coupon per user ID
        const alreadyUsed = await prisma.userCoupon.findFirst({
          where: {
            userId: session.user.id,
            promotionId: promotion.id,
            isUsed: true,
          },
        });

        if (alreadyUsed) {
          return NextResponse.json({ error: "คุณได้ใช้คูปองนี้ไปแล้ว (1 สิทธิ์ต่อ 1 บัญชี)" }, { status: 400 });
        }

        promotionId = promotion.id;
        if (promotion.discountType === "percent") {
          discountAmount = Number((subtotal * (Number(promotion.value) / 100)).toFixed(2));
        } else if (promotion.discountType === "fixed") {
          discountAmount = Number(promotion.value);
        } else if (promotion.discountType === "freeship") {
          isFreeShipping = true;
        }
      }
    }
  }

  const shippingFee = isFreeShipping ? 0 : (shippingMethod === "express" ? 12 : 0);
  const taxAmount = Number((Math.max(0, subtotal - discountAmount) * 0.08).toFixed(2));
  const totalAmount = Number((Math.max(0, subtotal - discountAmount) + shippingFee + taxAmount).toFixed(2));
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
        discountAmount: new Prisma.Decimal(discountAmount),
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
        ...(couponCode && promotionId ? {
          coupons: {
            create: {
              couponCode,
              discountAmt: new Prisma.Decimal(discountAmount),
              promotionId,
            }
          }
        } : {}),
      },
      include: { items: true },
    });

    if (couponCode && promotionId) {
      // Increment global usage count
      await tx.promotion.update({
        where: { id: promotionId },
        data: { usedCount: { increment: 1 } }
      });

      // Mark as used for this user (upsert: create if not exists, update if exists)
      await tx.userCoupon.upsert({
        where: {
          userId_promotionId: {
            userId: session.user.id,
            promotionId,
          },
        },
        update: {
          isUsed: true,
          usedAt: new Date(),
        },
        create: {
          userId: session.user.id,
          promotionId,
          isUsed: true,
          usedAt: new Date(),
        },
      });
    }

    await tx.cartItem.deleteMany({ where: { userId: session.user.id } });
    return created;
  });

  return NextResponse.json({ order: serializeOrder(order) });
}

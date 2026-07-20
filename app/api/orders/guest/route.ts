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

  // Validate coupon on backend (for guest checkout)
  let discountAmount = 0;
  let isFreeShipping = false;
  let promotionId: number | null = null;
  const couponCode = body.couponCode?.toUpperCase().trim();

  if (couponCode) {
    const promotion = await prisma.promotion.findUnique({
      where: { code: couponCode },
    });

    if (!promotion) {
      return NextResponse.json({ error: "ไม่พบรหัสคูปองนี้" }, { status: 400 });
    }

    if (promotion.status !== "Active") {
      return NextResponse.json({ error: "คูปองนี้หมดอายุหรือถูกระงับแล้ว" }, { status: 400 });
    }

    const isExpired = promotion.endDate && new Date(promotion.endDate) < new Date();
    if (isExpired) {
      return NextResponse.json({ error: "คูปองนี้หมดอายุแล้ว" }, { status: 400 });
    }

    const meetMinPurchase = subtotal >= Number(promotion.minPurchase);
    if (!meetMinPurchase) {
      return NextResponse.json({ error: `ยอดซื้อขั้นต่ำไม่ถึง ฿${Number(promotion.minPurchase)}` }, { status: 400 });
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

  const shippingFee = isFreeShipping ? 0 : (shippingMethod === "express" ? 12 : 0);
  const taxAmount = Number((Math.max(0, subtotal - discountAmount) * 0.08).toFixed(2));
  const totalAmount = Number((Math.max(0, subtotal - discountAmount) + shippingFee + taxAmount).toFixed(2));
  const status: OrderStatus = "VERIFYING";

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
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
        discountAmount: new Prisma.Decimal(discountAmount),
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
    }

    return created;
  });

  return NextResponse.json({ order: serializeOrder(order) });
}

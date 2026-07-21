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
    hasActiveTicket: order.tickets?.some((t: any) => t.status !== 'CLOSED') || false
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true, tickets: true },
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

  const isDigitalOnly = cartItems.length > 0 && cartItems.every(item => item.book.bookType === "EBook");

  const selectedAddress = body.addressId
    ? await prisma.address.findFirst({ where: { id: Number(body.addressId), userId: session.user.id } })
    : null;

  const address = selectedAddress ?? body.address;
  if (!isDigitalOnly && (!address?.name || !address?.streetAddress || !address?.city || !address?.zipCode)) {
    return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
  }

  const finalAddress = isDigitalOnly
    ? { name: session.user.name || "Customer", phone: "", streetAddress: "Digital Delivery", city: "", zipCode: "" }
    : address;

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

  const shippingFee = (isFreeShipping || isDigitalOnly) ? 0 : (shippingMethod === "express" ? 12 : 0);
  const taxAmount = Number((Math.max(0, subtotal - discountAmount) * 0.08).toFixed(2));
  const totalAmount = Number((Math.max(0, subtotal - discountAmount) + shippingFee + taxAmount).toFixed(2));
  const status: OrderStatus = "VERIFYING";

  const order = await prisma.$transaction(async (tx) => {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, ""); // e.g., 20260721
    const startOfDay = new Date(today.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setUTCHours(23, 59, 59, 999));
    
    const countToday = await tx.order.count({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay }
      }
    });
    const customOrderId = `ORD-${datePrefix}-${String(countToday + 1).padStart(4, '0')}`;

    const created = await tx.order.create({
      data: {
        id: customOrderId,
        userId: session.user.id,
        status,
        shippingMethod: isDigitalOnly ? "digital" : shippingMethod,
        paymentMethod,
        recipientName: finalAddress.name,
        recipientPhone: finalAddress.phone ?? null,
        shippingAddress: isDigitalOnly ? "Digital Delivery" : `${finalAddress.streetAddress}\n${finalAddress.city}, ${finalAddress.zipCode}`,
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

    for (const item of cartItems) {
      if (!item.bookId) continue;
      const book = await tx.book.update({
        where: { id: item.bookId },
        data: { stock: { decrement: item.quantity } }
      });
      await tx.stockMovement.create({
        data: {
          type: 'OUT',
          quantity: item.quantity,
          reference: `Order ${created.id}`,
          performedBy: session.user.id,
          bookId: item.bookId,
          balanceAfter: book.stock
        }
      });
    }

    await tx.cartItem.deleteMany({ where: { userId: session.user.id } });
    return created;
  });

  return NextResponse.json({ order: serializeOrder(order) });
}

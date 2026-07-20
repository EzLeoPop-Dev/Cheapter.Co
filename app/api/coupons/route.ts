import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.toUpperCase().trim();

    if (!code) {
      // Return all active promotions
      const promotions = await prisma.promotion.findMany({
        where: { status: "Active" },
        orderBy: { createdAt: "desc" },
      });

      // Also return which coupon IDs the current user has already used
      const session = await getServerSession(authOptions);
      let usedIds: number[] = [];
      if (session?.user?.id) {
        const usedCoupons = await prisma.userCoupon.findMany({
          where: { userId: session.user.id, isUsed: true },
          select: { promotionId: true },
        });
        usedIds = usedCoupons.map((uc) => uc.promotionId);
      }

      return NextResponse.json({ promotions, usedIds });
    }

    const promotion = await prisma.promotion.findUnique({
      where: { code },
    });

    if (!promotion) {
      return NextResponse.json({ message: "ไม่พบรหัสคูปองนี้" }, { status: 444 });
    }

    if (promotion.status !== "Active") {
      return NextResponse.json({ message: "คูปองนี้หมดอายุหรือถูกระงับแล้ว" }, { status: 400 });
    }

    if (promotion.endDate && new Date(promotion.endDate) < new Date()) {
      return NextResponse.json({ message: "คูปองนี้หมดอายุแล้ว" }, { status: 400 });
    }

    // Check per-user usage limit (1 coupon per user ID)
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const alreadyUsed = await prisma.userCoupon.findFirst({
        where: {
          userId: session.user.id,
          promotionId: promotion.id,
          isUsed: true,
        },
      });
      if (alreadyUsed) {
        return NextResponse.json({ message: "คุณได้ใช้คูปองนี้ไปแล้ว (1 สิทธิ์ต่อ 1 บัญชี)" }, { status: 400 });
      }
    }

    return NextResponse.json(promotion);
  } catch (error) {
    console.error("GET /api/coupons failed", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

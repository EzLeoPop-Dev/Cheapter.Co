import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { DiscountType, PromotionStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) return null;
  return session.user;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name, code, discount, end_date, status, type, minPurchase: minPurchaseRaw } = body;

    // Map UI type values to DB DiscountType enum
    let discountType: DiscountType = "percent";
    if (type === "freeship") {
      discountType = "freeship";
    } else if (type === "fixed") {
      discountType = "fixed";
    } else {
      discountType = "percent";
    }

    // Extract numeric value
    const parsedValue = discountType !== "freeship"
      ? parseFloat(String(discount).replace(/[^0-9.]/g, "")) || 0
      : 0;

    // minPurchase
    let minPurchase = 0;
    if (minPurchaseRaw !== undefined && minPurchaseRaw !== "") {
      minPurchase = parseFloat(String(minPurchaseRaw)) || 0;
    } else if (discountType === "freeship") {
      const matches = name.match(/\d+/);
      minPurchase = matches ? parseInt(matches[0], 10) : 0;
    }

    const promotion = await prisma.promotion.update({
      where: { id },
      data: {
        name,
        code: code.toUpperCase().trim(),
        discountType,
        value: parsedValue,
        status: status as PromotionStatus,
        endDate: end_date ? new Date(end_date) : null,
        minPurchase,
      },
    });

    return NextResponse.json(promotion);
  } catch (error) {
    console.error("PATCH /api/admin/promotions/[id] failed", error);
    return NextResponse.json({ message: "Unable to update promotion" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    await prisma.promotion.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/promotions/[id] failed", error);
    return NextResponse.json({ message: "Unable to delete promotion" }, { status: 500 });
  }
}

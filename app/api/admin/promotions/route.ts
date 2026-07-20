import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { DiscountType, PromotionStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) return null;
  return session.user;
}

export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
    });

    const data = promotions.map((p) => {
      // Format to match the frontend expectations
      let discountVal = "";
      if (p.discountType === "percent") {
        discountVal = `${p.value}%`;
      } else if (p.discountType === "fixed") {
        discountVal = `${p.value} บาท`;
      } else {
        discountVal = `ค่าส่ง 0 บาท`;
      }

      return {
        id: p.id,
        name: p.name,
        code: p.code,
        discount: discountVal,
        value: Number(p.value),
        status: p.status,
        end_date: p.endDate ? p.endDate.toISOString().split("T")[0] : "",
        type: p.discountType,
        minPurchase: Number(p.minPurchase),
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/admin/promotions failed", error);
    return NextResponse.json({ message: "Unable to load promotions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, code, discount, end_date, status, type, minPurchase: minPurchaseRaw } = body;

    if (!name || !code || !discount) {
      return NextResponse.json({ message: "Name, code and discount are required" }, { status: 400 });
    }

    // Map UI type values to DB DiscountType enum
    // UI sends: 'percent', 'fixed', 'freeship', or legacy 'discount'
    let discountType: DiscountType = "percent";
    if (type === "freeship") {
      discountType = "freeship";
    } else if (type === "fixed") {
      discountType = "fixed";
    } else {
      // 'percent' or legacy 'discount' both map to percent
      discountType = "percent";
    }

    // Extract numeric value from discount string (e.g. "10%" -> 10, "50 บาท" -> 50)
    const parsedValue = discountType !== "freeship"
      ? parseFloat(String(discount).replace(/[^0-9.]/g, "")) || 0
      : 0;

    // minPurchase: take from body if provided, else try to parse from name for freeship
    let minPurchase = 0;
    if (minPurchaseRaw !== undefined && minPurchaseRaw !== "") {
      minPurchase = parseFloat(String(minPurchaseRaw)) || 0;
    } else if (discountType === "freeship") {
      const matches = name.match(/\d+/);
      minPurchase = matches ? parseInt(matches[0], 10) : 0;
    }

    const promotion = await prisma.promotion.create({
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

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/promotions failed", error);
    return NextResponse.json({ message: "Unable to create promotion" }, { status: 500 });
  }
}

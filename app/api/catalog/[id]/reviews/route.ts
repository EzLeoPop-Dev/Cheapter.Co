import { NextRequest } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId)) {
      return Response.json({ message: "Invalid book id" }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const ratingFilterStr = searchParams.get("rating");
    const ratingFilter = ratingFilterStr ? Number(ratingFilterStr) : null;

    // ดึงรีวิวเฉพาะของหนังสือเล่มนี้ และ **ต้องไม่ถูกซ่อน**
    const allReviews = await prisma.review.findMany({
      where: { 
        bookId: parsedId,
        status: { not: "hidden" }
      },
      include: {
        user: { select: { id: true, name: true, profileImage: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 🌟 1. ดึง ID ของผู้ใช้งานที่เขียนรีวิวทั้งหมด
    const userIds = allReviews
      .map((r) => r.userId)
      .filter((uId): uId is number => Boolean(uId));

    // 🌟 2. คำนวณหาจำนวนที่ซื้อของแต่ละ User สำหรับหนังสือเล่มนี้
    const purchaseMap = new Map<number, number>();

    if (userIds.length > 0) {
      try {
        const orderItems = await prisma.orderItem.findMany({
          where: {
            bookId: parsedId,
            order: {
              userId: { in: userIds },
              // สามารถใส่เงื่อนไขสถานะออเดอร์เพิ่มได้ เช่น status: "COMPLETED"
            },
          },
          select: {
            quantity: true,
            order: {
              select: { userId: true },
            },
          },
        });

        // รวบรวมผลรวมจำนวนหนังสือที่ซื้อแยกราย User
        orderItems.forEach((item) => {
          if (item.order?.userId) {
            const currentQty = purchaseMap.get(item.order.userId) || 0;
            purchaseMap.set(item.order.userId, currentQty + item.quantity);
          }
        });
      } catch (e) {
        console.error("Failed to query purchase quantities", e);
      }
    }

    const totalReviews = allReviews.length;
    const ratingStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalStars = 0;

    allReviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingStats[review.rating as keyof typeof ratingStats]++;
        totalStars += review.rating;
      }
    });

    const averageRating = totalReviews > 0 ? (totalStars / totalReviews) : 0;

    const filteredReviews = ratingFilter 
      ? allReviews.filter(review => review.rating === ratingFilter)
      : allReviews;

    const formattedReviews = filteredReviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      // 🌟 3. แนบค่า purchasedQuantity กลับไปด้วย
      purchasedQuantity: review.userId ? (purchaseMap.get(review.userId) || 0) : 0,
      user: review.user ? {
        name: review.user.name,
        avatar: review.user.profileImage
      } : {
        name: "Anonymous User",
        avatar: null
      }
    }));

    return Response.json({
      reviews: formattedReviews,
      stats: {
        totalReviews,
        averageRating,
        ratingCounts: ratingStats
      }
    });

  } catch (error) {
    console.error("GET /api/catalog/[id]/reviews failed", error);
    return Response.json({ message: "Unable to load reviews" }, { status: 500 });
  }
}
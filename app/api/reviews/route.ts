import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/src/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  
  try {
    const { bookId, rating, comment } = await req.json();

    if (!bookId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const parsedBookId = Number(bookId);

    // Verify if user bought this book and the order is COMPLETED
    const validOrder = await prisma.orderItem.findFirst({
      where: {
        bookId: parsedBookId,
        order: {
          userId: userId,
          status: "COMPLETED"
        }
      }
    });

    if (!validOrder) {
      return NextResponse.json({ error: "คุณต้องสั่งซื้อสินค้านี้และสถานะจัดส่งสำเร็จแล้วจึงจะสามารถรีวิวได้" }, { status: 403 });
    }

    // Upsert review (allows editing)
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: userId,
        bookId: parsedBookId,
      }
    });

    let newReview;
    if (existingReview) {
      newReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment: comment || ""
        }
      });
    } else {
      newReview = await prisma.review.create({
        data: {
          rating,
          comment: comment || "",
          userId: userId,
          bookId: parsedBookId,
        }
      });
    }

    // Update book aggregate data
    const allReviews = await prisma.review.findMany({
      where: { bookId: parsedBookId }
    });
    
    const totalReviews = allReviews.length;
    const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = totalReviews > 0 ? (totalRating / totalReviews) : 0;

    await prisma.book.update({
      where: { id: parsedBookId },
      data: {
        rating: averageRating,
        reviewCount: totalReviews
      }
    });

    return NextResponse.json({ success: true, review: newReview });
  } catch (error) {
    console.error("Failed to submit review", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

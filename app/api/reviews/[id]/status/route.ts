import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { status } = await request.json();
    const resolvedParams = await params;
    const reviewId = parseInt(resolvedParams.id);

    if (isNaN(reviewId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { status: status },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Error updating review status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
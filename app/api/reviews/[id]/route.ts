import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/src/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

// ==========================================
// 1. ฟังก์ชันสำหรับ ลบรีวิวถาวร (DELETE)
// ==========================================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'STAFF') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const reviewId = Number(id);

    await prisma.review.delete({
      where: { id: reviewId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ==========================================
// 2. ฟังก์ชันสำหรับเปลี่ยนสถานะ ซ่อน/แสดง (PATCH)
// ==========================================
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'STAFF') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const reviewId = Number(id);
    const { status } = await req.json();

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { status }
    });

    return NextResponse.json({ success: true, review: updatedReview });
  } catch (error) {
    console.error("Error updating review status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
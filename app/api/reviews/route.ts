import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/src/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ดึงข้อมูลรีวิว (พนักงานเห็นทั้งหมดรวมถึงที่ซ่อน / ลูกค้าเห็นแค่ของตัวเองและต้องไม่ถูกซ่อน)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // เช็ค Role ของผู้ใช้ปัจจุบันจากฐานข้อมูล
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    // ถ้าเป็น STAFF หรือ ADMIN ให้ดึงข้อมูลทั้งหมด
    // แต่ถ้าเป็น CUSTOMER ให้ดึงเฉพาะรีวิวของตัวเอง ที่ไม่ได้ถูกซ่อน
    const isStaffOrAdmin = currentUser?.role === 'STAFF' || currentUser?.role === 'ADMIN';
    const whereCondition = isStaffOrAdmin 
      ? {} 
      : { 
          userId: session.user.id,
          status: { not: "hidden" } 
        };

    // ดึงข้อมูลรีวิว
    const reviews = await prisma.review.findMany({
      where: whereCondition,
      include: {
        user: { select: { name: true } },
        book: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 🌟 2. ส่งข้อมูลกลับเป็น Array ตรงๆ เพื่อให้หน้า Admin เอาไปโชว์ได้เลย
    // หมายเหตุ: Prisma จะส่ง orderId มาด้วยอัตโนมัติอยู่แล้วถ้าไม่ได้จำกัด select
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// สร้างรีวิวใหม่
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 🌟 รับค่า orderId จากหน้าบ้านเพิ่มเข้ามาด้วย
    const { bookId, orderId, rating, comment } = await req.json();
    if (!bookId || !rating) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // 🌟 เช็คว่า User เคยรีวิวสินค้านี้ใน Order นี้ไปหรือยัง
    if (orderId) {
      const existingReview = await prisma.review.findFirst({
        where: {
          userId: session.user.id,
          orderId: orderId, // 📌 หมายเหตุ: ถ้าใน Schema orderId เป็น Int ให้ใช้ Number(orderId) แทน
          bookId: Number(bookId),
        },
      });

      // ถ้าเจอรีวิวเดิมอยู่แล้ว ให้รีเทิร์น Error 400 กลับไป
      if (existingReview) {
        return NextResponse.json(
          { error: "คุณได้รีวิวสินค้านี้ในคำสั่งซื้อนี้ไปแล้ว" },
          { status: 400 } 
        );
      }
    }

    // 🌟 ถ้ายังไม่มี ค่อยสร้างรีวิวใหม่ และบันทึก orderId ลงฐานข้อมูล
    const newReview = await prisma.review.create({
      data: {
        bookId: Number(bookId),
        orderId: orderId || null, 
        userId: session.user.id,
        rating: Number(rating),
        comment: comment || "",
      },
    });

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// แก้ไขรีวิวเดิม
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reviewId, rating, comment } = await req.json();
    if (!reviewId || !rating) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const updatedReview = await prisma.review.update({
      where: { 
        id: Number(reviewId),
        userId: session.user.id 
      },
      data: {
        rating: Number(rating),
        comment: comment || "",
      },
    });

    return NextResponse.json({ success: true, review: updatedReview });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
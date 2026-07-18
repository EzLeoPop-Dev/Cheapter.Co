import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/src/lib/prisma";

// ดึงข้อมูล
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { addresses: true }, // ดึงที่อยู่มาด้วย
  });

  return NextResponse.json(user);
}

// อัปเดตข้อมูลส่วนตัว & รูปภาพ
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, phone, profileImage } = body;

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, phone, profileImage },
  });

  return NextResponse.json(updatedUser);
}
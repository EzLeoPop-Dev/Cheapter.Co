import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

// ดึงข้อมูลผู้ใช้ทั้งหมด
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      profileImage: true,
    }
  });

  return NextResponse.json(users);
}

// เพิ่มผู้ใช้ใหม่
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only Admin can add users" }, { status: 403 });
  }

  const { name, email, password, role } = await req.json();
  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      role: role || "CUSTOMER",
    }
  });

  return NextResponse.json(newUser);
}

// อัปเดตสถานะ หรือ Role
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id, role, status } = await req.json();
  
  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role, status },
  });

  return NextResponse.json(updatedUser);
}

// ลบผู้ใช้
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  await prisma.user.delete({ where: { id: String(id) } });
  return NextResponse.json({ success: true });
}
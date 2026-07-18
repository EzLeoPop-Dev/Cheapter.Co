import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ message: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // บันทึกผู้ใช้ใหม่
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: "CUSTOMER",
        status: "Active"
      }
    });

    return NextResponse.json(
      { message: "สมัครสมาชิกสำเร็จ", user: { id: newUser.id, email: newUser.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" }, { status: 500 });
  }
}
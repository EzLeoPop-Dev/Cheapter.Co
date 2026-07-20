import { NextResponse } from "next/server";

// Endpoint สำหรับล้าง session cookie เก่าที่ decode ไม่ได้
// ใช้เมื่อเกิด JWEDecryptionFailed หลังจากเปลี่ยน NEXTAUTH_SECRET
export async function GET() {
  const response = NextResponse.redirect(
    new URL("/auth/login", process.env.NEXTAUTH_URL ?? "http://localhost:3000")
  );

  // ลบ NextAuth cookies ทั้งหมด
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0, // expire ทันที
  };

  response.cookies.set("next-auth.session-token", "", cookieOptions);
  response.cookies.set("next-auth.csrf-token", "", cookieOptions);
  response.cookies.set("next-auth.callback-url", "", cookieOptions);
  response.cookies.set("__Secure-next-auth.session-token", "", { ...cookieOptions, secure: true });
  response.cookies.set("__Host-next-auth.csrf-token", "", { ...cookieOptions, secure: true });

  return response;
}

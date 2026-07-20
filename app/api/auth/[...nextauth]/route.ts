import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/src/lib/prisma";

export const authOptions: NextAuthOptions = {
  // ใช้ JWT เพื่อไม่ต้องเก็บ Session ลง Database ให้หนักเครื่อง
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        }

        // 1. หา User จาก Database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error("ไม่พบบัญชีผู้ใช้นี้");
        }

        // 2. เช็คสถานะการโดนแบน
        if (user.status === "Banned") {
          throw new Error("บัญชีของคุณถูกระงับการใช้งาน");
        }

        // 3. ตรวจสอบรหัสผ่าน
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isPasswordValid) {
          throw new Error("รหัสผ่านไม่ถูกต้อง");
        }

        // 4. คืนค่า User (ข้อมูลเหล่านี้จะถูกส่งไปที่ jwt callback)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // นำข้อมูลจาก authorize มาใส่ใน Token
    // ถ้า token เดิม decrypt ไม่ได้ (JWEDecryptionFailed) NextAuth จะส่ง token ว่างมา
    // → user จะถูก redirect ไป login แทนที่จะ error loop
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // ส่งข้อมูลจาก Token ไปยัง Client Session (ฝั่งหน้าบ้าน)
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
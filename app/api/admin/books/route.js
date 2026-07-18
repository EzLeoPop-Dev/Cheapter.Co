import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const books = await prisma.book.findMany({
      where: {
        bookType: {
          not: 'Pack'
        }
      },
      select: {
        id: true,
        title: true,
        price: true,
        stock: true,
        image: true
      },
      orderBy: {
        title: 'asc'
      }
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

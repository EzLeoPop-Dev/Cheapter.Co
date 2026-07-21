import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/src/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId, pageNumber, progressPercent } = await req.json();

    if (!bookId || typeof pageNumber !== "number" || typeof progressPercent !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Verify user owns this book in library
    const libraryEntry = await prisma.userLibrary.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: Number(bookId),
        },
      },
    });

    if (!libraryEntry) {
      return NextResponse.json({ error: "Book not found in library" }, { status: 404 });
    }

    const progress = await prisma.ebookProgress.upsert({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: Number(bookId),
        },
      },
      update: {
        currentChapter: pageNumber, // We use currentChapter to store the page number
        progressPercent: progressPercent,
        lastReadAt: new Date(),
      },
      create: {
        userId: session.user.id,
        bookId: Number(bookId),
        currentChapter: pageNumber,
        progressPercent: progressPercent,
        lastReadAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Failed to update progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

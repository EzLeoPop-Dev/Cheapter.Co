import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";
import EbookReaderClient from "./EbookReaderClient";

export default async function ReaderPage({ params }: { params: Promise<{ bookId: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const resolvedParams = await params;
  const bookId = Number(resolvedParams.bookId);

  // Check if book exists and user owns it
  const libraryEntry = await prisma.userLibrary.findUnique({
    where: {
      userId_bookId: {
        userId: session.user.id,
        bookId: bookId,
      },
    },
    include: {
      book: true,
    },
  });

  if (!libraryEntry) {
    redirect("/profile/ebooks");
  }

  // Fetch current progress
  const progress = await prisma.ebookProgress.findUnique({
    where: {
      userId_bookId: {
        userId: session.user.id,
        bookId: bookId,
      },
    },
  });

  const initialPage = progress?.currentChapter || 1;
  const pdfUrl = libraryEntry.book.ebookFile || "/sample.pdf"; // Fallback if missing

  return (
    <EbookReaderClient 
      bookId={bookId}
      title={libraryEntry.book.title}
      pdfUrl={pdfUrl}
      initialPage={initialPage}
    />
  );
}

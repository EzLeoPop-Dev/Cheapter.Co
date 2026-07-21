import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/src/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ReadEpisodePage({
  params,
}: {
  params: Promise<{ bookId: string; episodeId: string }>;
}) {
  const { bookId, episodeId } = await params;
  const parsedBookId = Number(bookId);
  const parsedEpisodeId = Number(episodeId);

  if (!Number.isInteger(parsedBookId) || !Number.isInteger(parsedEpisodeId)) {
    notFound();
  }

  const episode = await prisma.bookEpisode.findUnique({
    where: { id: parsedEpisodeId },
    include: {
      book: {
        select: { title: true, id: true }
      }
    }
  });

  if (!episode || episode.bookId !== parsedBookId) {
    notFound();
  }

  // Check access rights
  if (!episode.isFree) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      redirect(`/auth/login?callbackUrl=/books/${parsedBookId}`);
    }

    const owned = await prisma.userLibrary.findFirst({
      where: { userId: session.user.id, bookId: parsedBookId }
    });

    if (!owned) {
      // Not owned, redirect back to book detail
      redirect(`/books/${parsedBookId}?error=not_owned`);
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfaf8] text-stone-800 selection:bg-[#b46b45]/20 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link 
          href={`/books/${parsedBookId}`}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-[#b46b45] transition-colors mb-8 text-sm font-medium uppercase tracking-wider"
        >
          <ChevronLeft size={16} />
          กลับไปที่ {episode.book.title}
        </Link>

        <header className="mb-12 text-center">
          <div className="text-[#b46b45] font-bold tracking-widest text-xs uppercase mb-4">
            ตอนที่ {episode.orderIndex}
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 leading-tight">
            {episode.title}
          </h1>
        </header>

        <article className="prose prose-stone prose-lg max-w-none font-serif leading-relaxed text-stone-700 w-full flex flex-col items-center">
          {episode.pdfUrl ? (
            <div className="w-full h-[80vh] min-h-[600px] mt-4 flex flex-col items-center">
              <iframe 
                src={`${episode.pdfUrl}#toolbar=0`} 
                className="w-full h-full rounded-xl shadow-lg border border-stone-200"
                title={`PDF Viewer - ${episode.title}`}
              />
              <a 
                href={episode.pdfUrl} 
                target="_blank" 
                rel="noreferrer"
                className="mt-6 px-6 py-2 bg-stone-800 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#b46b45] transition-colors"
              >
                ดาวน์โหลด / เปิดในหน้าใหม่ (Open in new tab)
              </a>
            </div>
          ) : episode.content ? (
            <div dangerouslySetInnerHTML={{ __html: episode.content.replace(/\n/g, '<br/>') }} className="w-full" />
          ) : (
            <div className="text-center text-stone-400 italic py-20 bg-stone-100 rounded-2xl w-full">
              ยังไม่มีเนื้อหาสำหรับตอนนี้ (No content available)
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

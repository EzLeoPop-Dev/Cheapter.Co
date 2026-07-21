import React from 'react';
import { BookOpen, Download, Smartphone } from 'lucide-react';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EbooksPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const libraryItems = await prisma.userLibrary.findMany({
    where: { userId: session.user.id },
    include: {
      book: true,
    },
    orderBy: { purchaseAt: "desc" },
  });

  const progressItems = await prisma.ebookProgress.findMany({
    where: { userId: session.user.id },
  });

  const progressMap = new Map(progressItems.map(p => [p.bookId, p]));

  const ebooks = libraryItems.map((item) => {
    const progress = progressMap.get(item.bookId);
    const lastReadStr = progress?.lastReadAt 
      ? new Date(progress.lastReadAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })
      : "ยังไม่ได้เริ่มอ่าน";

    return {
      id: item.bookId,
      title: item.book.title,
      author: item.book.author,
      progress: progress?.progressPercent || 0,
      lastRead: lastReadStr,
      image: item.book.image || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop",
      fileUrl: item.book.ebookFile,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#fefdfb] p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <BookOpen className="h-6 w-6 text-[#bc876e]" />
            คลัง E-book ของฉัน
          </h2>
          <p className="text-sm text-gray-500">คุณมี E-book ทั้งหมด {ebooks.length} เล่มในคลัง</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ebooks.map((book) => (
          <div key={book.id} className="bg-[#fefdfb] rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="flex p-4 gap-4">
              <div className="w-24 h-32 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden shadow-sm">
                <img 
                  src={book.image} 
                  alt={book.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col flex-1">
                <h3 className="font-semibold text-gray-800 line-clamp-2 leading-tight mb-1">{book.title}</h3>
                <p className="text-xs text-gray-500 mb-auto">{book.author}</p>
                
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>อ่านแล้ว {book.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                    <div 
                      className="bg-[#bc876e] h-1.5 rounded-full" 
                      style={{ width: `${book.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-400">อ่านล่าสุด: {book.lastRead}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-100 px-4 py-3 flex gap-2">
              <Link href={`/reader/${book.id}`} className="flex-1 bg-[#bc876e] hover:bg-[#a8745d] text-white py-2 rounded-lg text-sm font-medium transition-colors text-center block">
                อ่านต่อ
              </Link>
              {book.fileUrl && (
                <a href={book.fileUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors flex items-center justify-center">
                  <Download className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}

        {ebooks.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-[#fefdfb] rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-gray-900 font-bold mb-2">ยังไม่มี E-book ในคลัง</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">เลือกซื้อ E-book เล่มใหม่ที่คุณสนใจ เพื่อเริ่มต้นการอ่านได้เลยทันทีไม่ต้องรอจัดส่ง</p>
            <Link href="/catalog" className="px-6 py-2.5 bg-[#8b5a45] hover:bg-[#724a38] text-white font-bold rounded-lg text-sm transition-colors shadow-sm">
              ไปหน้าแคตตาล็อกหนังสือ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { BookOpen, Download, Smartphone } from 'lucide-react';

export default function EbooksPage() {
  const ebooks = [
    {
      id: 1,
      title: 'Digital Minimalism',
      author: 'Cal Newport',
      progress: 45,
      lastRead: '2 วันที่แล้ว',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      progress: 100,
      lastRead: '1 สัปดาห์ที่แล้ว',
      image: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 3,
      title: 'Deep Work',
      author: 'Cal Newport',
      progress: 12,
      lastRead: 'เมื่อวานนี้',
      image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    }
  ];

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
              <button className="flex-1 bg-[#bc876e] hover:bg-[#a8745d] text-white py-2 rounded-lg text-sm font-medium transition-colors">
                อ่านต่อ
              </button>
              <button className="px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

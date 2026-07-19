// @ts-nocheck
"use client";
import React, { useState } from 'react';

export default function StaffReviewsPage() {
  const [reviews, setReviews] = useState([
    { id: 1, bookTitle: 'ปรมาจารย์ลัทธิมาร เล่ม 1', user: 'Somchai', rating: 5, comment: 'สนุกมากครับ จัดส่งรวดเร็ว', status: 'visible', date: '14 ก.ค. 2026' },
    { id: 2, bookTitle: 'แฮร์รี่ พอตเตอร์', user: 'Naree', rating: 1, comment: 'หนังสือยับมาก แย่สุดๆ', status: 'visible', date: '13 ก.ค. 2026' },
    { id: 3, bookTitle: 'คิดแบบยิว', user: 'Bot_99', rating: 5, comment: 'ลิงก์เว็บพนันคลิกเลย: bit.ly/xxx', status: 'hidden', date: '12 ก.ค. 2026' },
  ]);

  const handleHide = (id) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: r.status === 'visible' ? 'hidden' : 'visible' } : r));
  };

  const handleDelete = (id) => {
    if (confirm('คุณต้องการลบรีวิวนี้ถาวรหรือไม่?')) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">จัดการรีวิว (Reviews)</h2>
        <p className="text-[#a09c92]">ตรวจสอบ, ซ่อน หรือลบรีวิวที่ไม่เหมาะสมจากลูกค้า</p>
      </div>

      {/* Reviews List */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e6e5e0]">
                <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap">วันที่</th>
                <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap">หนังสือ</th>
                <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap">ผู้ใช้</th>
                <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap">คะแนน</th>
                <th className="pb-3 px-4 font-bold text-[#a09c92] w-1/3">ความเห็น</th>
                <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap text-center">สถานะ</th>
                <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e5e0]">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-white/50 transition-colors">
                  <td className="py-4 px-4 text-sm whitespace-nowrap">{review.date}</td>
                  <td className="py-4 px-4 font-medium text-[#1A1A1A]">{review.bookTitle}</td>
                  <td className="py-4 px-4 text-sm">{review.user}</td>
                  <td className="py-4 px-4">
                    <div className="flex text-[#C8861A]">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#555]">{review.comment}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      review.status === 'visible' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {review.status === 'visible' ? 'แสดงผล' : 'ซ่อน'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                    <button 
                      onClick={() => handleHide(review.id)}
                      className="px-3 py-1.5 text-xs font-bold bg-[#F2EEE7] hover:bg-gray-200 text-[#1A1A1A] rounded-lg transition-colors"
                    >
                      {review.status === 'visible' ? 'ซ่อน' : 'แสดง'}
                    </button>
                    <button 
                      onClick={() => handleDelete(review.id)}
                      className="px-3 py-1.5 text-xs font-bold bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reviews.length === 0 && (
            <div className="text-center py-12 text-[#a09c92]">ไม่มีรีวิวในระบบ</div>
          )}
        </div>
      </div>
    </div>
  );
}

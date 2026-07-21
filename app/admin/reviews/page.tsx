// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';

export default function StaffReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State สำหรับจัดการขยาย/พับเก็บรูปภาพ { reviewId: boolean }
  const [expandedReviewImages, setExpandedReviewImages] = useState({});

  // ฟังก์ชันสกัดข้อความ และ URL รูปภาพจาก Review Comment
  const parseReviewComment = (comment) => {
    if (!comment) return { cleanComment: "", extractedImages: [] };
    let extractedImages = [];
    
    // Regex ดึงข้อความใน [รูปภาพรีวิว: ...] รองรับทั้ง Enter และ Whitespace
    const regex = /\[รูปภาพรีวิว:\s*([\s\S]*?)\]/g;
    
    const cleanComment = comment.replace(regex, (match, urlsString) => {
      const urls = urlsString.split(/\s+/).filter((u) => u.startsWith("http"));
      extractedImages = [...extractedImages, ...urls];
      return "";
    }).trim();
    
    return { cleanComment, extractedImages };
  };

  // ดึงข้อมูล
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reviews'); 
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setReviews(data);
      } else if (data && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else if (data && Array.isArray(data.data)) {
        setReviews(data.data);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // ซ่อน/แสดง
  const handleHide = async (id, currentStatus) => {
    const safeStatus = currentStatus || 'visible';
    const newStatus = safeStatus === 'visible' ? 'hidden' : 'visible';
    
    try {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));

      const response = await fetch(`/api/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update');
    } catch (error) {
      console.error('Error updating status:', error);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: safeStatus } : r));
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  // ลบ
  const handleDelete = async (id) => {
    if (confirm('คุณต้องการลบรีวิวนี้ถาวรหรือไม่?')) {
      try {
        const response = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete');
        
        setReviews(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('เกิดข้อผิดพลาดในการลบรีวิว หรือยังไม่มี API สำหรับลบ');
      }
    }
  };

  // ฟังก์ชันสลับสถานะขยายรูปภาพ
  const toggleReviewImages = (reviewId) => {
    setExpandedReviewImages(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">จัดการรีวิว (Reviews)</h2>
        <p className="text-[#a09c92]">ตรวจสอบ, ซ่อน หรือลบรีวิวที่ไม่เหมาะสมจากลูกค้า</p>
      </div>

      <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-sm">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A1A1A] mx-auto mb-4"></div>
              <p className="text-[#a09c92]">กำลังโหลดข้อมูลรีวิว...</p>
            </div>
          ) : (
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
                {Array.isArray(reviews) && reviews.map((review) => {
                  const currentStatus = review.status || 'visible'; 
                  const { cleanComment, extractedImages } = parseReviewComment(review.comment);

                  // ปรับค่า MAX_VISIBLE_IMAGES เป็น 2
                  const MAX_VISIBLE_IMAGES = 2;
                  const isImagesExpanded = expandedReviewImages[review.id];
                  const visibleImages = isImagesExpanded ? extractedImages : extractedImages.slice(0, MAX_VISIBLE_IMAGES);
                  const remainingCount = extractedImages.length - MAX_VISIBLE_IMAGES;

                  return (
                    <tr key={review.id} className="hover:bg-white/50 transition-colors">
                      <td className="py-4 px-4 text-sm whitespace-nowrap">
                        {review.createdAt 
                          ? new Date(review.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
                          : '-'}
                      </td>
                      <td className="py-4 px-4 font-medium text-[#1A1A1A]">
                        {review.book?.title || '-'}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {review.user?.name || '-'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex text-[#C8861A]">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < (review.rating || 0) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </td>
                      
                      <td className="py-4 px-4 text-sm text-[#555]">
                        {cleanComment && <div className="mb-2">{cleanComment}</div>}
                        
                        {extractedImages.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1 items-center">
                            {visibleImages.map((imgUrl, idx) => {
                              // เช็คว่าเป็นรูปที่ 2 (รูปสุดท้ายที่ให้โชว์) และยังไม่ได้กางออก และยังมีรูปเหลืออยู่
                              const isLastVisible = !isImagesExpanded && idx === MAX_VISIBLE_IMAGES - 1 && remainingCount > 0;

                              return (
                                <div 
                                  key={idx} 
                                  className="relative w-12 h-12 cursor-pointer group"
                                  onClick={() => {
                                    if (isLastVisible) {
                                      toggleReviewImages(review.id);
                                    } else {
                                      window.open(imgUrl, "_blank", "noopener,noreferrer");
                                    }
                                  }}
                                  title={isLastVisible ? "คลิกเพื่อดูรูปทั้งหมด" : "คลิกเพื่อดูรูปขนาดเต็ม"}
                                >
                                  <img
                                    src={imgUrl}
                                    alt={`Review attachment ${idx + 1}`}
                                    className={`w-full h-full object-cover rounded-lg border border-gray-200 transition-opacity ${isLastVisible ? 'opacity-70' : 'hover:opacity-80'}`}
                                  />
                                  {isLastVisible && (
                                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center text-white text-xs font-bold backdrop-blur-[1px] hover:bg-black/60 transition-colors">
                                      +{remainingCount}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            
                            {/* ปุ่มสำหรับพับเก็บ (จะแสดงเมื่อกางออกและมีรูปมากกว่า 2 รูป) */}
                            {isImagesExpanded && extractedImages.length > MAX_VISIBLE_IMAGES && (
                              <button
                                onClick={() => toggleReviewImages(review.id)}
                                className="w-12 h-12 flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-200 text-gray-600 text-xs font-bold transition-colors cursor-pointer"
                                title="ย่อรูปภาพ"
                              >
                                ย่อ
                              </button>
                            )}
                          </div>
                        )}

                        {!cleanComment && extractedImages.length === 0 && '-'}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          currentStatus === 'visible' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {currentStatus === 'visible' ? 'แสดงผล' : 'ซ่อน'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => handleHide(review.id, currentStatus)}
                          className="px-3 py-1.5 text-xs font-bold bg-[#F2EEE7] hover:bg-gray-200 text-[#1A1A1A] rounded-lg transition-colors cursor-pointer"
                        >
                          {currentStatus === 'visible' ? 'ซ่อน' : 'แสดง'}
                        </button>
                        <button 
                          onClick={() => handleDelete(review.id)}
                          className="px-3 py-1.5 text-xs font-bold bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          
          {!isLoading && (!Array.isArray(reviews) || reviews.length === 0) && (
            <div className="text-center py-12 text-[#a09c92]">ไม่มีรีวิวในระบบ</div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Package, Search, Calendar, ChevronRight, FileText, LogIn, Star, X, MessageSquare, BookOpen, ImagePlus, Loader2, MessageSquareHeart, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TABS = ["ทั้งหมด", "PENDING", "VERIFYING", "PREPARING", "SHIPPING", "COMPLETED", "CANCELLED", "REFUNDED"];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "รอชำระเงิน",
  VERIFYING: "ตรวจสอบชำระเงิน",
  PREPARING: "กำลังแพ็คสินค้า",
  SHIPPING: "จัดส่งบริษัทขนส่ง",
  COMPLETED: "สำเร็จ",
  CANCELLED: "ถูกยกเลิก",
  REFUNDED: "คืนเงิน/คืนสินค้า",
};

function mapOrder(order: any) {
  return {
    id: order.id,
    date: new Date(order.createdAt).toLocaleDateString("th-TH"),
    total: Number(order.totalAmount).toFixed(2),
    status: order.status,
    trackingNumber: order.trackingNumber,
    hasActiveTicket: order.hasActiveTicket,
    statusColor:
      order.status === "COMPLETED" ? "text-green-600 bg-green-50 border-green-200" :
      order.status === "SHIPPING" ? "text-blue-600 bg-blue-50 border-blue-200" :
      order.status === "CANCELLED" ? "text-red-600 bg-red-50 border-red-200" :
      order.status === "REFUNDED" ? "text-purple-600 bg-purple-50 border-purple-200" :
      "text-amber-600 bg-amber-50 border-amber-200",
    items: (order.items || []).map((item: any) => ({
      bookId: item.bookId,
      title: item.title || item.bookTitle,
      qty: item.quantity,
      price: (Number(item.unitPrice) * Number(item.quantity)).toFixed(2),
    })),
  };
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);


  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    orderId: string;
    bookId: string | number;
    bookTitle: string;
    reviewId: number | null;
  }>({ isOpen: false, orderId: "", bookId: "", bookTitle: "", reviewId: null });

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setAuthError(false);

      try {
        const response = await fetch("/api/orders", { cache: "no-store" });
        if (response.status === 401) {
          setAuthError(true);
          setIsLoading(false);
          return;
        }
        if (response.ok) {
          const data = await response.json();
          const fetched = Array.isArray(data.orders) ? data.orders : [];
          setOrders(fetched.map(mapOrder));
        }

        const reviewsRes = await fetch("/api/reviews", { cache: "no-store" });
        if (reviewsRes.ok) {
          const reviewData = await reviewsRes.json();
          // 🌟 [แก้ไขจุดที่ 1] รองรับทั้งแบบส่งกลับมาเป็น Array ตรงๆ หรือ { reviews: [...] }
          const reviewsList = Array.isArray(reviewData) ? reviewData : (reviewData.reviews || []);
          setUserReviews(reviewsList);
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const filteredOrders = useMemo(() => {
    let result = activeTab === "ทั้งหมด" ? orders : orders.filter((o) => o.status === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((o) => o.id.toLowerCase().includes(q));
    }
    return result;
  }, [activeTab, orders, searchQuery]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`ไฟล์ ${file.name} มีขนาดเกิน 5MB และจะไม่ถูกเพิ่ม`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const closeModal = () => {
    setReviewModal({ isOpen: false, orderId: "", bookId: "", bookTitle: "", reviewId: null });
    setRating(5);
    setComment("");
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
  };

  const handleSubmitReview = async () => {
    if (!rating) return alert("กรุณาให้คะแนน");
    setIsSubmitting(true);
    
    let uploadedImageUrls: string[] = [];

    try {
      if (images.length > 0) {
        const uploadPromises = images.map(async (img) => {
          const fileExt = img.file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error } = await supabase.storage
            .from('review-images') 
            .upload(fileName, img.file, { upsert: false });

          if (error) {
            throw error;
          }

          const { data: publicUrlData } = supabase.storage
            .from('review-images')
            .getPublicUrl(fileName);
            
          return publicUrlData.publicUrl;
        });

        uploadedImageUrls = await Promise.all(uploadPromises);
      }

      const finalComment = uploadedImageUrls.length > 0 
        ? `${comment}\n\n[รูปภาพรีวิว:\n${uploadedImageUrls.join('\n')}]` 
        : comment;

      const isEditing = !!reviewModal.reviewId;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch("/api/reviews", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: reviewModal.reviewId,
          orderId: reviewModal.orderId,
          bookId: reviewModal.bookId,
          rating: rating,
          comment: finalComment,
          imageUrls: uploadedImageUrls
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(isEditing ? "อัปเดตรีวิวสำเร็จ!" : "ขอบคุณสำหรับรีวิวครับ!");
        
        if (isEditing) {
          setUserReviews(userReviews.map(r => r.id === reviewModal.reviewId ? data.review : r));
        } else {
          setUserReviews([...userReviews, data.review]);
        }
        closeModal();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "เกิดข้อผิดพลาดในการส่งรีวิว");
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ หรืออัปโหลดรูปภาพไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">ประวัติการสั่งซื้อ</h2>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาหมายเลขคำสั่งซื้อ..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#bc876e] focus:border-transparent text-sm"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {authError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-amber-800 text-sm">Session หมดอายุหรือไม่ถูกต้อง</p>
            <p className="text-amber-600 text-xs mt-0.5">กรุณา login ใหม่เพื่อดูประวัติการสั่งซื้อ</p>
          </div>
          <a href="/api/auth/clear-session" className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors shrink-0">
            <LogIn className="w-4 h-4" />
            Login ใหม่
          </a>
        </div>
      )}

      <div className="bg-[#fefdfb] rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-100 bg-white">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-[#bc876e] text-[#bc876e]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {STATUS_LABELS[tab] || tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-4 border-[#bc876e]/30 border-t-[#bc876e] rounded-full animate-spin" />
              <span className="text-sm text-gray-500">กำลังโหลดคำสั่งซื้อ...</span>
            </div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div>
            {filteredOrders.map((order, index) => (
              <div key={order.id} className={`p-6 ${index !== filteredOrders.length - 1 ? "border-b border-gray-100" : ""}`}>
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-5 w-5 text-[#bc876e]" />
                      <span className="font-medium text-gray-800">คำสั่งซื้อ {order.id}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>สั่งซื้อเมื่อ {order.date}</span>
                    </div>
                    {order.trackingNumber && (
                      <p className="text-xs text-gray-500 mt-1">Tracking: {order.trackingNumber}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium border ${order.statusColor}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                    <div className="mt-2 text-lg font-semibold text-gray-800">฿{order.total}</div>
                  </div>
                </div>

                <div className="bg-[#f9f8f6] rounded-lg p-4 mt-4">
                  <h4 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">
                    รายการสินค้า ({order.items.length} รายการ)
                  </h4>
                  <ul className="space-y-3">
                    {order.items.map((item: any, idx: number) => {
                      // 🌟 [แก้ไขจุดที่ 2] แปลงค่าเป็น String() ทั้งคู่ ป้องกันปัญหา Mismatch ของ Type (เช่น Int vs String)
                      const existingReview = userReviews.find(
                        (r) => String(r.bookId) === String(item.bookId) && String(r.orderId) === String(order.id)
                      );

                      return (
                        <li key={idx} className="flex justify-between items-center text-sm">
                          <div className="flex flex-col">
                            <span className="text-gray-700 font-medium">
                              {item.title} <span className="text-gray-400 font-normal">x{item.qty}</span>
                            </span>
                            <span className="font-medium text-gray-500 text-xs mt-0.5">฿{item.price}</span>
                          </div>

                          {order.status === "COMPLETED" && item.bookId && (
                            <button 
                              onClick={() => {
                                setReviewModal({ 
                                  isOpen: true, 
                                  orderId: order.id,
                                  bookId: item.bookId, 
                                  bookTitle: item.title,
                                  reviewId: existingReview ? existingReview.id : null 
                                });
                                setRating(existingReview ? existingReview.rating : 5);
                                setComment(existingReview ? existingReview.comment : "");
                                setImages([]);
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                                existingReview 
                                  ? "text-blue-600 border-blue-600/30 bg-blue-50 hover:bg-blue-600 hover:text-white" 
                                  : "text-[#bc876e] border-[#bc876e]/30 bg-white hover:bg-[#bc876e] hover:text-white"
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              {existingReview ? "แก้ไขรีวิว" : "รีวิวสินค้า"}
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="mt-4 flex justify-end items-center gap-4">
                  {order.hasActiveTicket ? (
                    <span className="flex items-center text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg cursor-not-allowed">
                      <AlertCircle className="h-4 w-4 mr-1.5" />
                      แจ้งปัญหาแล้ว
                    </span>
                  ) : (
                    <Link
                      href={`/profile/support?orderId=${order.id}`}
                      className="flex items-center text-sm font-medium text-red-600 hover:text-red-800 transition-colors bg-red-50 px-3 py-1.5 rounded-lg"
                    >
                      <AlertCircle className="h-4 w-4 mr-1.5" />
                      แจ้งปัญหาคำสั่งซื้อ
                    </Link>
                  )}
                  <Link
                    href="/tracking"
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors bg-gray-50 px-3 py-1.5 rounded-lg"
                  >
                    ดูรายละเอียดการจัดส่ง <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-gray-50/50">
            <div className="w-16 h-16 bg-[#fae8df] rounded-full flex items-center justify-center mb-4">
              <FileText className="h-7 w-7 text-[#bc876e]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {authError ? "กรุณา Login เพื่อดูประวัติ" : "ยังไม่มีคำสั่งซื้อในสถานะนี้"}
            </h3>
            <p className="text-sm text-gray-500">
              {authError ? "กดปุ่ม Login ใหม่ด้านบน" : "เมื่อคุณสั่งซื้อสินค้า รายการจะแสดงที่นี่"}
            </p>
          </div>
        )}
      </div>


      {/* Modal เขียน/แก้ไขรีวิว */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm z-[100]">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-semibold text-lg text-gray-800">
                {reviewModal.reviewId ? "แก้ไขคะแนนสินค้า" : "ให้คะแนนสินค้า"}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-orange-100 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-[#bc876e]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#bc876e] mb-1">สินค้าที่คุณกำลังรีวิว</p>
                  <p className="font-semibold text-gray-800 leading-snug">{reviewModal.bookTitle}</p>
                </div>
              </div>

              {/* เลือกดาว */}
              <div className="flex flex-col items-center justify-center gap-2 pt-2">
                <p className="text-sm font-medium text-gray-700">คุณภาพสินค้าเป็นอย่างไร?</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setRating(star)}
                      className="focus:outline-none transform transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star 
                        size={32} 
                        className={star <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* พิมพ์คอมเมนต์ และ อัปโหลดรูป */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เขียนรีวิว (ตัวเลือก)</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="แบ่งปันความประทับใจของคุณเกี่ยวกับหนังสือเล่มนี้..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#bc876e]/50 focus:border-[#bc876e] mb-3"
                ></textarea>

                <div className="mt-2">
                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-3">
                      {images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={img.preview} 
                            alt={`Preview ${index}`} 
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label htmlFor="review-image-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <ImagePlus className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">เพิ่มรูปภาพรีวิว</span>
                  </label>
                  <input 
                    id="review-image-upload" 
                    type="file" 
                    accept="image/*"
                    multiple 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={closeModal}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-bold text-white bg-[#bc876e] rounded-lg hover:bg-[#a6755c] disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {reviewModal.reviewId ? "บันทึกการแก้ไข" : "ส่งรีวิว"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
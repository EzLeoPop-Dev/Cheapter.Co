"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Package, Search, Calendar, ChevronRight, FileText, LogIn, Star, X, MessageSquareHeart, AlertCircle } from "lucide-react";
import Link from "next/link";

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
      title: item.title,
      qty: item.quantity,
      price: (Number(item.unitPrice) * Number(item.quantity)).toFixed(2),
    })),
  };
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<{bookId: number, title: string} | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const openReviewModal = (bookId: number, title: string) => {
    setSelectedReviewItem({bookId, title});
    setReviewRating(0);
    setReviewHoverRating(0);
    setReviewComment("");
    setReviewModalOpen(true);
  };

  const submitReview = async () => {
    if (!selectedReviewItem || reviewRating === 0) {
      alert("กรุณาให้คะแนนดาว");
      return;
    }
    
    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: selectedReviewItem.bookId,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("ขอบคุณสำหรับรีวิวของคุณ!");
        setReviewModalOpen(false);
      } else {
        alert(data.error || "ไม่สามารถส่งรีวิวได้");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      setAuthError(false);

      try {
        const response = await fetch("/api/orders", { cache: "no-store" });

        if (response.status === 401) {
          // Session ไม่ถูกต้อง → แจ้ง user ให้ล้าง cookie แล้ว login ใหม่
          setAuthError(true);
          setIsLoading(false);
          return;
        }

        if (response.ok) {
          const data = await response.json();
          const fetched = Array.isArray(data.orders) ? data.orders : [];
          setOrders(fetched.map(mapOrder));
        }
      } catch {
        // network error — แสดงเปล่า
      }

      setIsLoading(false);
    }

    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    let result = activeTab === "ทั้งหมด" ? orders : orders.filter((o) => o.status === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((o) => o.id.toLowerCase().includes(q));
    }
    return result;
  }, [activeTab, orders, searchQuery]);

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

      {/* Auth error banner */}
      {authError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-amber-800 text-sm">Session หมดอายุหรือไม่ถูกต้อง</p>
            <p className="text-amber-600 text-xs mt-0.5">กรุณา login ใหม่เพื่อดูประวัติการสั่งซื้อ</p>
          </div>
          <a
            href="/api/auth/clear-session"
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
          >
            <LogIn className="w-4 h-4" />
            Login ใหม่
          </a>
        </div>
      )}

      <div className="bg-[#fefdfb] rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {/* Tabs */}
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
              <div
                key={order.id}
                className={`p-6 ${index !== filteredOrders.length - 1 ? "border-b border-gray-100" : ""}`}
              >
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
                  <ul className="space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="flex flex-col">
                          <span className="text-gray-700 font-medium">
                            {item.title} <span className="text-gray-400 font-normal ml-1">x{item.qty}</span>
                          </span>
                          {order.status === "COMPLETED" && (
                            <button 
                              onClick={() => openReviewModal(item.bookId, item.title)}
                              className="text-xs text-[#b46b45] hover:text-[#8b5a45] mt-1 font-semibold flex items-center gap-1 w-fit transition-colors"
                            >
                              <MessageSquareHeart size={12} /> เขียนรีวิว
                            </button>
                          )}
                        </div>
                        <span className="font-medium text-gray-600">฿{item.price}</span>
                      </li>
                    ))}
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

      {/* Review Modal */}
      {reviewModalOpen && selectedReviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 font-serif">เขียนรีวิว</h3>
              <button 
                onClick={() => setReviewModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-2">ให้คะแนนสินค้า</p>
            <p className="text-base font-bold text-gray-800 mb-6">{selectedReviewItem.title}</p>
            
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  onMouseEnter={() => setReviewHoverRating(star)}
                  onMouseLeave={() => setReviewHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    size={36} 
                    className={`transition-colors ${(reviewHoverRating || reviewRating) >= star ? "fill-[#b46b45] text-[#b46b45]" : "fill-gray-100 text-gray-200"}`} 
                  />
                </button>
              ))}
            </div>

            <div className="text-left mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียดรีวิว (ไม่บังคับ)</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="เล่าประสบการณ์ของคุณที่มีต่อหนังสือเล่มนี้..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b46b45]/30 focus:border-[#b46b45] transition-all resize-none"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => setReviewModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors text-sm"
              >
                ยกเลิก
              </button>
              <button 
                onClick={submitReview}
                disabled={isSubmittingReview || reviewRating === 0}
                className="flex-1 py-3 bg-[#b46b45] hover:bg-[#8b5a45] text-white rounded-xl font-bold transition-all text-sm disabled:opacity-50 shadow-md shadow-[#b46b45]/20"
              >
                {isSubmittingReview ? "กำลังส่ง..." : "ส่งรีวิว"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

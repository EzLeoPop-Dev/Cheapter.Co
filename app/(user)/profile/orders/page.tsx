"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Package, Search, Calendar, ChevronRight, FileText, LogIn } from "lucide-react";
import Link from "next/link";

const TABS = ["ทั้งหมด", "PENDING", "VERIFYING", "PREPARING", "SHIPPING", "COMPLETED", "CANCELLED", "REFUNDED"];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "รอชำระเงิน",
  VERIFYING: "ตรวจสอบชำระเงิน",
  PREPARING: "เตรียมการจัดส่ง",
  SHIPPING: "อยู่ระหว่างการจัดส่ง",
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
    statusColor:
      order.status === "COMPLETED" ? "text-green-600 bg-green-50 border-green-200" :
      order.status === "SHIPPING" ? "text-blue-600 bg-blue-50 border-blue-200" :
      order.status === "CANCELLED" ? "text-red-600 bg-red-50 border-red-200" :
      order.status === "REFUNDED" ? "text-purple-600 bg-purple-50 border-purple-200" :
      "text-amber-600 bg-amber-50 border-amber-200",
    items: (order.items || []).map((item: any) => ({
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
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.title} <span className="text-gray-400">x{item.qty}</span>
                        </span>
                        <span className="font-medium text-gray-600">฿{item.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex justify-end items-center gap-4">
                  <Link
                    href="/tracking"
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
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
    </div>
  );
}

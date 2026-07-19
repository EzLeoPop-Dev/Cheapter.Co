"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Package, Search, Calendar, ChevronRight, FileText } from "lucide-react";

const LATEST_ORDER_KEY = "cheapterLatestOrder";
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
      order.status === "COMPLETED" ? "text-green-600 bg-green-50" :
      order.status === "SHIPPING" ? "text-blue-600 bg-blue-50" :
      order.status === "CANCELLED" ? "text-red-600 bg-red-50" :
      "text-amber-600 bg-amber-50",
    items: (order.items || []).map((item: any) => ({
      title: item.title,
      qty: item.quantity,
      price: (Number(item.unitPrice) * Number(item.quantity)).toFixed(2),
    })),
  };
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const nextOrders: any[] = [];

      try {
        const response = await fetch("/api/orders", { cache: "no-store", credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          nextOrders.push(...(data.orders || []));
        }
      } catch {
        // Keep fallback path below available.
      }

      const rawLatestOrder = localStorage.getItem(LATEST_ORDER_KEY);
      const latestOrder = rawLatestOrder ? JSON.parse(rawLatestOrder) : null;
      if (latestOrder?.id && !nextOrders.some((order) => order.id === latestOrder.id)) {
        try {
          const response = await fetch(`/api/orders/${latestOrder.id}`, { cache: "no-store" });
          if (response.ok) {
            const data = await response.json();
            nextOrders.unshift(data.order);
            localStorage.setItem(LATEST_ORDER_KEY, JSON.stringify(data.order));
          } else {
            nextOrders.unshift(latestOrder);
          }
        } catch {
          nextOrders.unshift(latestOrder);
        }
      }

      setOrders(nextOrders.map(mapOrder));
      setIsLoading(false);
    }

    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return activeTab === "ทั้งหมด" ? orders : orders.filter((order) => order.status === activeTab);
  }, [activeTab, orders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">ประวัติการสั่งซื้อ</h2>
        <div className="relative w-full sm:w-64">
          <input type="text" placeholder="ค้นหาหมายเลขคำสั่งซื้อ..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#bc876e] focus:border-transparent text-sm" />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="bg-[#fefdfb] rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-100 bg-white">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? "border-[#bc876e] text-[#bc876e]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
              {STATUS_LABELS[tab] || tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-sm text-gray-500">Loading orders...</div>
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
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${order.statusColor}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                    <div className="mt-2 text-lg font-semibold text-gray-800">฿{order.total}</div>
                  </div>
                </div>

                <div className="bg-[#f9f8f6] rounded-lg p-4 mt-4">
                  <h4 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">รายการสินค้า</h4>
                  <ul className="space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.title} <span className="text-gray-400">x{item.qty}</span></span>
                        <span className="font-medium text-gray-600">฿{item.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex justify-end items-center gap-4">
                  <a href="/tracking" className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    ดูรายละเอียด <ChevronRight className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-gray-50/50">
            <div className="w-16 h-16 bg-[#fae8df] rounded-full flex items-center justify-center mb-4">
              <FileText className="h-7 w-7 text-[#bc876e]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">ยังไม่มีคำสั่งซื้อในสถานะนี้</h3>
            <p className="text-sm text-gray-500">เมื่อคุณสั่งซื้อสินค้า รายการจะแสดงที่นี่</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, ExternalLink, PackageCheck, CreditCard, Box, Truck, CheckCircle2, Users } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const STATUS_OPTIONS = [
  { value: "ตรวจสอบชำระเงิน", label: "ตรวจสอบชำระเงิน", key: "verify" },
  { value: "รอแพ็ค", label: "รอแพ็ค", key: "processing" },
  { value: "รอจัดส่ง", label: "รอจัดส่ง", key: "ready" },
  { value: "จัดส่งแล้ว", label: "จัดส่งแล้ว", key: "shipped" },
  { value: "ยกเลิก", label: "ยกเลิก", key: "cancelled" },
];

function statusClass(status) {
  if (status === "ตรวจสอบชำระเงิน") return "bg-yellow-50 text-yellow-700 border-yellow-200";
  if (status === "รอแพ็ค") return "bg-orange-50 text-orange-700 border-orange-200";
  if (status === "รอจัดส่ง") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "จัดส่งแล้ว") return "bg-green-50 text-green-700 border-green-200";
  if (status === "ยกเลิก") return "bg-red-50 text-red-700 border-red-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function statusIcon(status) {
  if (status === "ตรวจสอบชำระเงิน") return <CreditCard className="w-3.5 h-3.5" />;
  if (status === "รอแพ็ค") return <Box className="w-3.5 h-3.5" />;
  if (status === "รอจัดส่ง") return <Truck className="w-3.5 h-3.5" />;
  if (status === "จัดส่งแล้ว") return <CheckCircle2 className="w-3.5 h-3.5" />;
  return null;
}

export default function AdminOrdersPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadOrders = async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/orders", { cache: "no-store", credentials: "include" });
    const data = await response.json();
    setOrders(Array.isArray(data.orders) ? data.orders : []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, status, trackingNumber) => {
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, status, trackingNumber }),
    });

    if (!response.ok) return;

    const data = await response.json();
    setOrders((current) => current.map((order) => order.id === id ? data.order : order));
    if (selectedOrder?.id === id) setSelectedOrder(data.order);
  };

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (activeTab !== "all") {
      result = result.filter((order) => order.status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((order) =>
        order.id.toLowerCase().includes(q) ||
        order.customer.toLowerCase().includes(q) ||
        String(order.customerPhone || "").includes(q)
      );
    }

    return result;
  }, [activeTab, orders, searchQuery]);

  return (
    <div>
      <div className="print:hidden space-y-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900">{t("order.title") || "Orders"}</h2>
            <p className="text-gray-500 mt-1">จัดการคำสั่งซื้อและเปลี่ยนสถานะที่ user เห็นใน profile/orders และ tracking</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder={t("order.search") || "Search orders..."} className="pl-9 pr-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg outline-none focus:border-gray-900 font-medium shadow-sm w-64" />
            </div>
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {t("order.filter") || "Filter"}
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide bg-gray-50/50 px-2 pt-2">
            {[{ value: "all", label: "ทั้งหมด" }, ...STATUS_OPTIONS].map((tab) => (
              <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${activeTab === tab.value ? "border-gray-900 text-gray-900 bg-white rounded-t-xl" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-t-xl"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
                  <div className="text-gray-500 font-medium text-sm tracking-wide">Loading orders...</div>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-white">
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("order.col.id") || "Order ID"}</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("order.col.date") || "Date"}</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("order.col.customer") || "Customer"}</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t("order.col.total") || "Total"}</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("order.col.status") || "Status"}</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t("order.col.actions") || "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group bg-white">
                      <td className="py-4 px-6 font-bold text-gray-900">{order.id}</td>
                      <td className="py-4 px-6 text-sm text-gray-500 font-medium">{order.date}</td>
                      <td className="py-4 px-6 font-semibold text-gray-700">
                        <div>{order.customer}</div>
                        <div className="text-xs text-gray-400 font-normal">{order.customerPhone || "-"}</div>
                      </td>
                      <td className="py-4 px-6 text-sm font-black text-gray-900 text-right">฿{order.amount.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value, order.trackingNumber)} className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-md border outline-none ${statusClass(order.status)}`}>
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end items-center gap-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md border ${statusClass(order.status)}`}>
                            {statusIcon(order.status)}
                            {order.status}
                          </span>
                          <button onClick={() => { setSelectedOrder(order); setTrackingInput(order.trackingNumber || ""); }} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!isLoading && filteredOrders.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <PackageCheck className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">{t("order.empty") || "No Orders Found"}</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{t("order.detail.title") || "Order Details"}</h3>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded-md border ${statusClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-mono font-medium">{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-gray-100">x</button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-[#f8f9fa]">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-3 h-3" /> {t("order.detail.customer") || "Customer"}
                  </h4>
                  <p className="font-bold text-gray-900 text-lg mb-1">{selectedOrder.customer}</p>
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{selectedOrder.address}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                    <Truck className="w-3 h-3" /> {t("order.detail.shipMethod") || "Shipping"}
                  </h4>
                  <p className="font-bold text-gray-900">{selectedOrder.shippingMethod}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{selectedOrder.date}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Tracking Number</span>
                    <input type="text" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} placeholder="e.g. TH12345678" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-gray-900 focus:bg-white transition-colors" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                  <Box className="w-3 h-3" /> {t("order.detail.items") || "Order Items"}
                </h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-600 text-sm">{item.qty}x</div>
                        <span className="font-semibold text-gray-900">{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">฿{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end gap-3 sticky bottom-0">
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-colors text-sm">ปิด</button>
              <button onClick={() => { updateStatus(selectedOrder.id, "จัดส่งแล้ว", trackingInput); setSelectedOrder(null); }} disabled={!trackingInput.trim()} className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-colors text-sm shadow-md disabled:opacity-50 flex items-center gap-2">
                <PackageCheck className="w-4 h-4" />
                บันทึกและจัดส่งแล้ว
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

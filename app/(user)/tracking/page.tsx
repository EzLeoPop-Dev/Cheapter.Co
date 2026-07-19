"use client";

import { motion } from "framer-motion";
import { Navbar } from "../../components/Navbar";
import { Package, Truck, CheckCircle2, MapPin, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TrackingOrder = {
  id: string;
  status: string;
  paymentMethod: string;
  recipientName: string;
  recipientPhone: string | null;
  shippingAddress: string;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  trackingNumber: string | null;
  createdAt: string;
  items: { title: string; imageUrl: string | null; quantity: number; unitPrice: number }[];
};

const LATEST_ORDER_KEY = "cheapterLatestOrder";

export default function TrackingPage() {
  const [order, setOrder] = useState<TrackingOrder | null>(null);

  useEffect(() => {
    fetch("/api/orders/latest", { cache: "no-store" })
      .then((res) => res.json())
      .then(async (data) => {
        if (data.order) {
          setOrder(data.order);
          localStorage.setItem(LATEST_ORDER_KEY, JSON.stringify(data.order));
          return;
        }

        const rawOrder = localStorage.getItem(LATEST_ORDER_KEY);
        const storedOrder = rawOrder ? JSON.parse(rawOrder) : null;
        if (storedOrder?.id) {
          const response = await fetch(`/api/orders/${storedOrder.id}`, { cache: "no-store" });
          if (response.ok) {
            const fresh = await response.json();
            setOrder(fresh.order);
            localStorage.setItem(LATEST_ORDER_KEY, JSON.stringify(fresh.order));
            return;
          }
        }
        setOrder(storedOrder);
      })
      .catch(() => {
        const rawOrder = localStorage.getItem(LATEST_ORDER_KEY);
        setOrder(rawOrder ? JSON.parse(rawOrder) : null);
      });
  }, []);

  const currentStep = useMemo(() => {
    switch (order?.status) {
      case "VERIFYING": return 0;
      case "PREPARING": return 1;
      case "SHIPPING": return 2;
      case "COMPLETED": return 3;
      case "PENDING": return 0;
      default: return 0;
    }
  }, [order?.status]);

  const steps = [
    { title: "ตรวจสอบการชำระเงิน", date: order ? new Date(order.createdAt).toLocaleString() : "-", icon: <CreditCard size={20} /> },
    { title: "เตรียมการจัดส่ง", date: order?.status === "PREPARING" ? "Packing your books" : "-", icon: <Package size={20} /> },
    { title: "อยู่ระหว่างการจัดส่ง", date: order?.trackingNumber || "-", icon: <Truck size={20} /> },
    { title: "สำเร็จ", date: order?.status === "COMPLETED" ? "Completed" : "Waiting update", icon: <CheckCircle2 size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col font-sans text-stone-800">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-12 flex flex-col gap-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Link href="/" className="text-sm font-bold text-stone-400 hover:text-stone-800 transition-colors flex items-center gap-1 w-fit mb-2">
              <ChevronRight size={14} className="rotate-180" /> Back to Home
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900">
                Track Order
              </h1>
              <span className="bg-[#e6dbcc]/50 text-amber-900 px-3 py-1 rounded-md text-base md:text-lg font-bold tracking-wider border border-[#d5c3aa] w-fit">
                #{order?.id || "Loading..."}
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-1">Expected Delivery</p>
            <p className="text-xl md:text-2xl font-bold text-[#b46b45]">{order?.trackingNumber || "Pending update"}</p>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-xl p-6 sm:p-10 border border-stone-100 shadow-sm">
          <div className="relative flex flex-col md:flex-row justify-between">
            {/* Connecting Line (Mobile & Desktop) */}
            <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-stone-100 md:left-0 md:right-0 md:top-[23px] md:bottom-auto md:h-0.5 md:w-full z-0"></div>

            {/* Active Line (Mobile & Desktop) */}
            <div className="absolute left-[23px] top-0 w-0.5 bg-[#8b5a45] z-0 transition-all duration-1000 ease-in-out md:hidden" style={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
            <div className="absolute left-0 top-[23px] h-0.5 bg-[#8b5a45] z-0 transition-all duration-1000 ease-in-out hidden md:block" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>

            {steps.map((step, index) => {
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;

              return (
                <div key={index} className="flex md:flex-col items-start md:items-center relative z-10 gap-4 md:gap-3 mb-8 md:mb-0 w-full md:w-1/5">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 ${isCurrent
                        ? "bg-[#8b5a45] border-[#e6dbcc] text-white shadow-md"
                        : isCompleted
                          ? "bg-[#8b5a45] border-white text-white"
                          : "bg-white border-stone-200 text-stone-300"
                      }`}
                  >
                    {step.icon}
                  </motion.div>

                  <div className="flex flex-col md:text-center mt-1 md:mt-0">
                    <span className={`font-bold text-sm ${isCompleted ? 'text-stone-800' : 'text-stone-400'}`}>
                      {step.title}
                    </span>
                    <span className={`text-xs ${isCurrent ? 'text-[#b46b45] font-semibold' : 'text-stone-500'}`}>
                      {step.date}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-stone-800">Order Items</h2>
            <div className="bg-white rounded-xl p-6 border border-stone-100 shadow-sm flex flex-col gap-6">
              {order?.items.map((item, index) => (
                <div key={`${item.title}-${index}`} className="flex gap-4">
                  <div className="w-20 h-28 bg-stone-200 rounded shrink-0 overflow-hidden shadow-sm">
                    <img src={item.imageUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop"} alt="Book" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col flex-1 justify-center">
                    <h3 className="font-bold text-stone-800 text-base md:text-lg">{item.title}</h3>
                    <p className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded w-fit mb-auto">Qty: {item.quantity}</p>
                    <p className="font-bold text-[#b46b45] mt-2">฿{(item.unitPrice * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Details */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-stone-800">Order Details</h2>

            <div className="bg-[#fcfbf9] rounded-xl p-6 border border-stone-100 shadow-sm flex flex-col gap-6 h-full">

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-stone-800 font-bold text-sm">
                  <MapPin size={16} className="text-stone-400" />
                  Shipping Address
                </div>
                <div className="pl-6 text-sm text-stone-600 flex flex-col">
                  <span>{order?.recipientName} {order?.recipientPhone ? `(${order.recipientPhone})` : ""}</span>
                  <span className="whitespace-pre-line">{order?.shippingAddress}</span>
                </div>
              </div>

              <div className="w-full h-px bg-stone-200/60"></div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-stone-800 font-bold text-sm">
                  <CreditCard size={16} className="text-stone-400" />
                  Payment Method
                </div>
                <div className="pl-6 text-sm text-stone-600 flex flex-col">
                  <span>{order?.paymentMethod || "-"}</span>
                </div>
              </div>

              <div className="w-full h-px bg-stone-200/60"></div>

              <div className="flex flex-col gap-3 mt-auto pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="text-stone-800 font-medium">฿{(order?.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Shipping</span>
                  <span className="text-stone-800 font-medium">฿{(order?.shippingFee || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Taxes</span>
                  <span className="text-stone-800 font-medium">฿{(order?.taxAmount || 0).toFixed(2)}</span>
                </div>
                <div className="w-full h-px bg-stone-200/60 my-1"></div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800">Total</span>
                  <span className="font-bold text-[#b46b45] text-lg">฿{(order?.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

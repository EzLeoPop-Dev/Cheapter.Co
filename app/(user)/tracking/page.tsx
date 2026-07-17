"use client";

import { motion } from "framer-motion";
import { Navbar } from "../../components/Navbar";
import { Package, Truck, CheckCircle2, MapPin, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function TrackingPage() {
  const currentStep = 3; // 0: Ordered, 1: Processing, 2: Shipped, 3: Out for Delivery, 4: Delivered

  const steps = [
    { title: "Order Placed", date: "July 15, 09:30 AM", icon: <Package size={20} /> },
    { title: "Processing", date: "July 15, 02:15 PM", icon: <CheckCircle2 size={20} /> },
    { title: "Shipped", date: "July 16, 10:45 AM", icon: <Truck size={20} /> },
    { title: "Out for Delivery", date: "July 17, 08:00 AM", icon: <MapPin size={20} /> },
    { title: "Delivered", date: "Expected by 08:00 PM", icon: <CheckCircle2 size={20} /> },
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
                #CH-100234-TH
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-1">Expected Delivery</p>
            <p className="text-xl md:text-2xl font-bold text-[#b46b45]">Today, July 17</p>
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
              {/* Item 1 */}
              <div className="flex gap-4">
                <div className="w-20 h-28 bg-stone-200 rounded shrink-0 overflow-hidden shadow-sm">
                  <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop" alt="Book" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col flex-1 justify-center">
                  <h3 className="font-bold text-stone-800 text-base md:text-lg">The Architecture of Silence</h3>
                  <p className="text-sm text-stone-500 font-serif italic mb-2">Elena Rostova</p>
                  <p className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded w-fit mb-auto">Qty: 1</p>
                  <p className="font-bold text-[#b46b45] mt-2">$24.00</p>
                </div>
              </div>

              <div className="w-full h-px bg-stone-100"></div>

              {/* Item 2 */}
              <div className="flex gap-4">
                <div className="w-20 h-28 bg-stone-200 rounded shrink-0 overflow-hidden shadow-sm">
                  <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=200&auto=format&fit=crop" alt="Book" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col flex-1 justify-center">
                  <h3 className="font-bold text-stone-800 text-base md:text-lg">Notes on Wabi-Sabi</h3>
                  <p className="text-sm text-stone-500 font-serif italic mb-2">Kenji Sato</p>
                  <p className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded w-fit mb-auto">Qty: 1</p>
                  <p className="font-bold text-[#b46b45] mt-2">$18.50</p>
                </div>
              </div>
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
                  <span>Jane Doe (081-234-5678)</span>
                  <span>123 Paper St, Apt 4B</span>
                  <span>Portland, 97204</span>
                </div>
              </div>

              <div className="w-full h-px bg-stone-200/60"></div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-stone-800 font-bold text-sm">
                  <CreditCard size={16} className="text-stone-400" />
                  Payment Method
                </div>
                <div className="pl-6 text-sm text-stone-600 flex flex-col">
                  <span>Credit Card ending in **34</span>
                </div>
              </div>

              <div className="w-full h-px bg-stone-200/60"></div>

              <div className="flex flex-col gap-3 mt-auto pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="text-stone-800 font-medium">$42.50</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Shipping</span>
                  <span className="text-stone-800 font-medium">Free</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Taxes</span>
                  <span className="text-stone-800 font-medium">$3.40</span>
                </div>
                <div className="w-full h-px bg-stone-200/60 my-1"></div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800">Total</span>
                  <span className="font-bold text-[#b46b45] text-lg">$45.90</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Tag, X, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Discount = {
  code: string;
  desc: string;
  detail: string;
};

export function DiscountMarquee() {
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [isClaimed, setIsClaimed] = useState(false);

  const discounts: Discount[] = [
    { 
      code: "READ20", 
      desc: "ลด 20% เมื่อซื้อครบ 500.-",
      detail: "ส่วนลด 20% สำหรับยอดสั่งซื้อ 500 บาทขึ้นไป (ลดสูงสุด 200 บาท) สามารถใช้ได้กับหนังสือทุกหมวดหมู่ ยกเว้นสินค้าราคาพิเศษ" 
    },
    { 
      code: "NEWBOOK", 
      desc: "ส่งฟรี! สำหรับหนังสือออกใหม่",
      detail: "รับสิทธิ์ส่งฟรีทันที เมื่อมีหนังสือออกใหม่ (New Arrival) อย่างน้อย 1 เล่มในตะกร้า ไม่มีขั้นต่ำ"
    },
    { 
      code: "PAPER10", 
      desc: "ลดเพิ่ม 10% ทุกออเดอร์",
      detail: "ลดทันที 10% ไม่มีขั้นต่ำ สามารถใช้ร่วมกับโค้ดส่งฟรีได้ (จำกัด 1 สิทธิ์ต่อผู้ใช้)"
    },
    { 
      code: "WEEKEND", 
      desc: "ซื้อ 3 เล่ม แถม 1 เล่ม (เฉพาะ ส.-อา.)",
      detail: "โปรโมชั่นพิเศษสำหรับวันหยุดสุดสัปดาห์ หยิบหนังสือ 4 เล่มลงตะกร้า ระบบจะหักราคาเล่มที่ถูกที่สุดออกอัตโนมัติ"
    },
    { 
      code: "WELCOME", 
      desc: "โค้ดสำหรับสมาชิกใหม่ ลด 50.-",
      detail: "ต้อนรับนักอ่านหน้าใหม่! รับส่วนลดทันที 50 บาท สำหรับการสั่งซื้อครั้งแรกเมื่อมียอดครบ 300 บาท"
    },
  ];

  // Duplicate items to ensure smooth infinite scroll
  const items = [...discounts, ...discounts, ...discounts, ...discounts];

  const handleOpenModal = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsClaimed(false);
  };

  const handleCloseModal = () => {
    setSelectedDiscount(null);
    setTimeout(() => setIsClaimed(false), 50000);
  };

  const handleClaim = () => {
    setIsClaimed(true);
    // You could also add actual logic to save the code to the user's account here
  };

  return (
    <>
      <div className="w-full overflow-hidden py-2 mt-[-2rem] relative max-w-7xl mx-auto px-4">
        {/* Fade edges to blend with background */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#faf8f4] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#faf8f4] to-transparent z-10 pointer-events-none" />
        
        {/* Marquee container */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {items.map((item, i) => (
            <div 
              key={i} 
              onClick={() => handleOpenModal(item)}
              className="flex items-center gap-3 px-5 py-3 mx-3 bg-white/70 backdrop-blur-md border border-amber-900/10 rounded-xl shadow-[0_2px_10px_rgba(139,90,69,0.05)] hover:shadow-[0_8px_25px_rgba(139,90,69,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="bg-amber-100/80 p-2 rounded-full text-amber-700 group-hover:scale-110 group-hover:bg-amber-200 transition-all duration-300">
                <Tag size={16} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-amber-900/90 text-sm">{item.code}</span>
                <span className="text-stone-500 text-[11px] font-medium">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="w-full flex justify-center mb-12 mt-4 relative z-10">
        <Link href="/coupons">
          <button className="text-sm font-medium text-amber-900 border border-amber-900/30 px-6 py-2 rounded-full hover:bg-[#8b5a45] hover:border-[#8b5a45] hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 flex items-center gap-2">
            ดูโค้ดส่วนลดทั้งหมด <ArrowRight size={16} />
          </button>
        </Link>
      </div>

      {/* Popup Modal */}
      <AnimatePresence>
        {selectedDiscount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-[#faf8f4] w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="bg-[#e6dbcc]/60 px-6 py-4 flex items-center justify-between border-b border-stone-200/60">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <Tag size={18} />
                  <span>รายละเอียดโค้ดส่วนลด</span>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="text-stone-500 hover:text-stone-800 transition-colors bg-white/50 hover:bg-white rounded-full p-1"
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-block bg-white border border-amber-900/20 px-6 py-3 rounded-lg shadow-sm mb-3">
                    <span className="font-sans font-bold text-2xl tracking-wider text-amber-900">
                      {selectedDiscount.code}
                    </span>
                  </div>
                  <h3 className="font-medium text-stone-800 text-lg mb-2">{selectedDiscount.desc}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    {selectedDiscount.detail}
                  </p>
                </div>
                
                {/* Action Button */}
                <button 
                  onClick={handleClaim}
                  disabled={isClaimed}
                  className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                    isClaimed 
                      ? "bg-stone-200 text-stone-500 cursor-not-allowed" 
                      : "bg-[#8b5a45] hover:bg-[#724a38] text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {isClaimed ? (
                    <>
                      <CheckCircle2 size={18} />
                      เก็บโค้ดแล้ว
                    </>
                  ) : (
                    "เก็บโค้ดส่วนลด"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

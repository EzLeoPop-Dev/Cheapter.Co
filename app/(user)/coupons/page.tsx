"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, CheckCircle2, Copy, Gift, Clock, ShoppingBag, Truck } from "lucide-react";
import { Navbar } from "@/app/components/Navbar";

// Helper Component for Coupon Card
const CouponCard = ({ coupon, collected, copiedCode, handleCollect, index, isUsedByMe }: any) => {
  const isCollected = collected.includes(coupon.id);
  const isCopied = copiedCode === coupon.code;
  
  // Dynamic Color Themes based on discount type
  const themes = {
    percent: {
      leftBg: "bg-[#fdf5e6]",
      borderDashed: "border-[#d2bba0]",
      innerBorder: "border-[#b3884b]/15",
      mainText: "text-[#8b5a45]",
      btnBg: "bg-[#8b5a45]",
      btnHover: "hover:bg-[#724a38]",
      tagText: "text-white",
      codeBg: "bg-[#fdf5e6]",
      codeBorder: "border-[#e6d5c3]",
      collectedBorder: "border-[#b3884b]",
      collectedText: "text-[#b3884b]"
    },
    fixed: {
      leftBg: "bg-[#fdf0f0]",
      borderDashed: "border-[#e6caca]",
      innerBorder: "border-[#9e4747]/15",
      mainText: "text-[#9e4747]",
      btnBg: "bg-[#9e4747]",
      btnHover: "hover:bg-[#803838]",
      tagText: "text-white",
      codeBg: "bg-[#fdf0f0]",
      codeBorder: "border-[#ecd0d0]",
      collectedBorder: "border-[#9e4747]",
      collectedText: "text-[#9e4747]"
    },
    freeship: {
      leftBg: "bg-[#f0f7f4]",
      borderDashed: "border-[#cce0d5]",
      innerBorder: "border-[#4a7c59]/15",
      mainText: "text-[#4a7c59]",
      btnBg: "bg-[#4a7c59]",
      btnHover: "hover:bg-[#396345]",
      tagText: "text-white",
      codeBg: "bg-[#f0f7f4]",
      codeBorder: "border-[#cce0d5]",
      collectedBorder: "border-[#4a7c59]",
      collectedText: "text-[#4a7c59]"
    }
  };
  
  const theme = themes[coupon.discountType as 'percent' | 'fixed' | 'freeship'] || themes.percent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={isUsedByMe ? {} : { y: -3, scale: 1.01 }}
      className={`relative bg-white rounded-xl shadow-sm border flex flex-col sm:flex-row group transition-all duration-300 overflow-hidden ${isUsedByMe ? 'border-stone-200 opacity-60 grayscale-[40%]' : 'hover:shadow-md border-stone-100'}`}
    >
      {/* Used overlay badge */}
      {isUsedByMe && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-stone-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
          <CheckCircle2 size={11} />
          ใช้แล้ว
        </div>
      )}
      {/* Left Side (Ticket Graphic) */}
      <div className={`sm:w-1/3 p-5 flex flex-col justify-center items-center text-center ${theme.leftBg} relative border-b sm:border-b-0 sm:border-r border-dashed ${theme.borderDashed}`}>
        <div className={`absolute inset-1.5 border ${theme.innerBorder} rounded-lg pointer-events-none`}></div>
        <div className="hidden sm:block absolute -right-2.5 -top-2.5 w-5 h-5 bg-[#faf9f6] rounded-full z-10 border-b border-l border-stone-100 shadow-inner"></div>
        <div className="hidden sm:block absolute -right-2.5 -bottom-2.5 w-5 h-5 bg-[#faf9f6] rounded-full z-10 border-t border-l border-stone-100 shadow-inner"></div>
        
        <span className={`px-2.5 py-1 ${theme.btnBg} ${theme.tagText} rounded-[4px] text-[9px] font-extrabold mb-3 uppercase tracking-widest shadow-sm z-10`}>
          {coupon.discountType === 'percent' ? 'Discount' : coupon.discountType === 'fixed' ? 'Cashback' : 'Free Ship'}
        </span>
        <h3 className={`text-3xl md:text-4xl font-serif font-medium ${theme.mainText} tracking-tighter z-10`}>
          {coupon.discount}
        </h3>
      </div>

      {/* Right Side (Details & Action) */}
      <div className="sm:w-2/3 p-5 flex flex-col justify-between bg-white relative">
        <div className="mb-4">
          <h4 className="text-base font-bold text-[#2a1e17] mb-1.5 leading-tight">
            {coupon.title}
          </h4>
          <p className="text-stone-500 text-xs mb-4 leading-relaxed">
            {coupon.description}
          </p>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 text-[11px] text-stone-600 font-medium">
              <div className={`p-1 rounded ${theme.leftBg} ${theme.mainText}`}>
                <ShoppingBag size={12} />
              </div>
              <span>ยอดซื้อขั้นต่ำ ฿{coupon.minPurchase}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px] text-stone-600 font-medium">
              <div className={`p-1 rounded ${theme.leftBg} ${theme.mainText}`}>
                <Clock size={12} />
              </div>
              <span>หมดเขต {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'ไม่มีกำหนด'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Code</span>
            <span className={`font-mono font-semibold text-xs tracking-wider px-2 py-0.5 rounded border ${theme.mainText} ${theme.codeBg} ${theme.codeBorder}`}>{coupon.code}</span>
          </div>
          
          <button
            onClick={() => !isUsedByMe && handleCollect(coupon.id, coupon.code)}
            disabled={(isCollected && !isCopied) || isUsedByMe}
            className={`relative overflow-hidden px-4 py-2 rounded-lg font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 min-w-[120px] shadow-sm ${
              isUsedByMe
                ? "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                : isCopied
                ? "bg-green-600 text-white border border-green-600"
                : isCollected
                ? `bg-white border-2 ${theme.collectedBorder} ${theme.collectedText} cursor-default`
                : `${theme.btnBg} text-white ${theme.btnHover} hover:shadow-md transform hover:-translate-y-px`
            }`}
          >
            <AnimatePresence mode="wait">
              {isUsedByMe ? (
                <motion.div key="used" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} /><span>ใช้ไปแล้ว</span>
                </motion.div>
              ) : isCopied ? (
                <motion.div key="copied" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} /><span>คัดลอกแล้ว</span>
                </motion.div>
              ) : isCollected ? (
                <motion.div key="collected" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} /><span>เก็บคูปองแล้ว</span>
                </motion.div>
              ) : (
                <motion.div key="collect" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="flex items-center gap-1.5">
                  <Copy size={14} /><span>เก็บคูปอง</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [usedIds, setUsedIds] = useState<number[]>([]);
  const [collected, setCollected] = useState<number[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoupons() {
      try {
        const res = await fetch("/api/coupons");
        if (res.ok) {
          const data = await res.json();
          // API now returns { promotions, usedIds }
          const promotionList = data.promotions ?? data;
          const usedIdList: number[] = data.usedIds ?? [];

          const formatted = promotionList.map((p: any) => {
            let discountVal = "";
            if (p.discountType === "percent") {
              discountVal = `${Number(p.value)}%`;
            } else if (p.discountType === "fixed") {
              discountVal = `฿${Number(p.value)}`;
            } else {
              discountVal = "Free";
            }

            return {
              id: p.id,
              title: p.name,
              code: p.code,
              discount: discountVal,
              discountType: p.discountType,
              minPurchase: Number(p.minPurchase),
              endDate: p.endDate || null,
              description: p.discountType === "percent"
                ? `ลดสูงสุด ${Number(p.value)}% สำหรับทุกรายการสั่งซื้อ`
                : p.discountType === "fixed"
                ? `ส่วนลดมูลค่า ${Number(p.value)} บาท`
                : `ไม่มีค่าจัดส่งเมื่อยอดซื้อขั้นต่ำ ฿${Number(p.minPurchase)} บาท`,
            };
          });
          setCoupons(formatted);
          setUsedIds(usedIdList);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCoupons();
  }, []);

  const handleCollect = (id: number, code: string) => {
    if (!collected.includes(id)) {
      setCollected([...collected, id]);
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const discountCoupons = useMemo(() => coupons.filter(c => c.discountType === 'percent' || c.discountType === 'fixed'), [coupons]);
  const shippingCoupons = useMemo(() => coupons.filter(c => c.discountType === 'freeship'), [coupons]);

  return (
    <main className="min-h-screen bg-[#faf9f6] pb-24 font-sans">
      <Navbar />
      
      {/* Premium Hero Section */}
      <div className="relative pt-32 pb-20 px-6 overflow-hidden bg-[#2a1e17] border-b-[8px] border-[#8b5a45]">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#8b5a45] rounded-[100%] blur-[120px] opacity-30 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex justify-center mb-6">
            <div className="bg-[#fdf5e6]/10 backdrop-blur-md px-5 py-2 rounded-full inline-flex items-center gap-2 border border-[#fdf5e6]/20 shadow-[0_0_15px_rgba(253,245,230,0.05)]">
              <Gift size={16} className="text-[#b3884b]" />
              <span className="text-xs md:text-sm font-semibold tracking-[0.2em] text-[#fdf5e6] uppercase">Exclusive Offers</span>
            </div>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }} className="text-4xl md:text-5xl lg:text-7xl font-serif font-medium tracking-tight mb-6 text-white drop-shadow-sm">
            ศูนย์รวมคูปอง <span className="text-[#b3884b] italic font-light">พิเศษ</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="text-[#fdf5e6]/70 max-w-2xl mx-auto text-base md:text-lg font-light leading-relaxed">
            เก็บรวบรวมส่วนลดสุดคุ้ม เพื่อเติมเต็มชั้นหนังสือของคุณในราคาที่พิเศษกว่าใคร
          </motion.p>
        </div>
      </div>

      {/* Coupons List Section */}
      <div className="max-w-6xl mx-auto px-6 mt-12">
        
        {/* Category: Discount Coupons */}
        {discountCoupons.length > 0 && (
          <div className="mb-14">
            <div className="flex items-end justify-between mb-6 pb-2 border-b border-stone-200">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-[#2a1e17] flex items-center gap-2">
                <Ticket className="text-[#b3884b]" size={22} />
                คูปองส่วนลดหนังสือ
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <AnimatePresence>
                {discountCoupons.map((coupon, index) => (
                  <CouponCard 
                    key={coupon.id} 
                    coupon={coupon} 
                    collected={collected} 
                    copiedCode={copiedCode} 
                    handleCollect={handleCollect} 
                    index={index}
                    isUsedByMe={usedIds.includes(coupon.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Category: Free Shipping Coupons */}
        {shippingCoupons.length > 0 && (
          <div className="mb-14">
            <div className="flex items-end justify-between mb-6 pb-2 border-b border-stone-200">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-[#2a1e17] flex items-center gap-2">
                <Truck className="text-[#b3884b]" size={22} />
                คูปองส่งฟรี
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <AnimatePresence>
                {shippingCoupons.map((coupon, index) => (
                  <CouponCard 
                    key={coupon.id} 
                    coupon={coupon} 
                    collected={collected} 
                    copiedCode={copiedCode} 
                    handleCollect={handleCollect} 
                    index={index}
                    isUsedByMe={usedIds.includes(coupon.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

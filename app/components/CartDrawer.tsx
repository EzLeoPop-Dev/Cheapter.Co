"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";

export function CartDrawer() {
  const { isCartOpen, closeCart, cartItems, cartCount, removeFromCart, isLoading } = useCart();
  const { language } = useLanguage();
  const router = useRouter();
  const { status } = useSession();

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Close when pressing Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isCartOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isCartOpen, closeCart]);

  const handleCheckout = () => {
    closeCart();
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  const texts = {
    cartTitle: language === "th" ? "ตะกร้าสินค้า" : "Your Cart",
    empty: language === "th" ? "ไม่มีสินค้าในตะกร้า" : "Your cart is empty",
    total: language === "th" ? "ยอดรวม" : "Total",
    checkout: language === "th" ? "ไปที่หน้าชำระเงิน" : "Checkout",
    continueShopping: language === "th" ? "เลือกซื้อสินค้าต่อ" : "Continue Shopping",
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-[#faf8f4] shadow-2xl z-50 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-white">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-amber-900" size={20} />
                <h2 className="text-lg font-bold text-stone-800">
                  {texts.cartTitle} ({cartCount})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-stone-100 transition-colors text-stone-500 hover:text-stone-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {isLoading && cartItems.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900"></div>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-500 gap-4">
                  <ShoppingCart size={48} className="opacity-20" />
                  <p>{texts.empty}</p>
                  <button
                    onClick={closeCart}
                    className="text-amber-700 hover:text-amber-900 underline underline-offset-4"
                  >
                    {texts.continueShopping}
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-white p-3 rounded-xl shadow-sm border border-stone-100 relative group">
                    {/* Image */}
                    <div className="w-20 h-28 shrink-0 bg-stone-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <ShoppingCart className="text-stone-300 opacity-50" size={24} />
                      )}
                    </div>
                    {/* Details */}
                    <div className="flex flex-col flex-1 py-1">
                      <h3 className="font-semibold text-stone-800 line-clamp-2 text-sm leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-1">{item.author}</p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <span className="font-bold text-amber-900">฿{item.price.toLocaleString()}</span>
                        <span className="text-sm text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                          x{item.quantity}
                        </span>
                      </div>
                    </div>
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-2 right-2 p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 bg-white border-t border-stone-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-stone-600 font-medium">{texts.total}</span>
                  <span className="text-xl font-bold text-amber-900">
                    ฿{subtotal.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-amber-900 hover:bg-amber-800 text-white font-semibold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {texts.checkout}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

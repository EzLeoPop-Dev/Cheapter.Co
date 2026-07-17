"use client";

import { Navbar } from "../../components/Navbar";
import { Check, Minus, Plus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

// Mock Data matching the screenshot
const INITIAL_CART = [
  {
    id: "1",
    title: "The Silent Forest",
    author: "Haruki Murakami",
    price: 450.00,
    quantity: 1,
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Echoes of Kyoto",
    author: "Yasunari Kawabata",
    price: 380.00,
    quantity: 1,
    imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Whispers in the Bamboo",
    author: "Banana Yoshimoto",
    price: 420.00,
    quantity: 1,
    imageUrl: "https://images.unsplash.com/photo-1629196914234-a69077ee8478?q=80&w=400&auto=format&fit=crop",
  }
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(INITIAL_CART);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col font-sans text-stone-800">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-bold text-stone-900 mb-10 tracking-tight">Your Reading List</h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left Column: Cart Items */}
          <div className="flex-1 w-full flex flex-col gap-4">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-stone-100">
                <p className="text-stone-500 mb-4">Your reading list is empty.</p>
                <Link href="/catalog" className="text-[#b46b45] font-bold hover:underline">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className="bg-white rounded-xl p-5 shadow-sm border border-stone-100 flex gap-6 relative">
                  {/* Book Cover */}
                  <div className="w-[80px] shrink-0 aspect-[2/3] bg-stone-100 rounded-sm overflow-hidden relative shadow-sm">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute left-0 top-0 bottom-0 w-[8%] bg-gradient-to-r from-black/40 to-transparent"></div>
                  </div>

                  {/* Book Details */}
                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-bold text-stone-800 text-base mb-1">{item.title}</h3>
                      <p className="font-serif italic text-stone-500 text-sm">{item.author}</p>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      {/* Price */}
                      <p className="font-bold text-[#b46b45] text-sm">
                        ฿ {item.price.toFixed(2)}
                      </p>

                      {/* Controls */}
                      <div className="flex items-center gap-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center bg-[#faf8f4] border border-stone-200 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
                          >
                            <Minus size={12} strokeWidth={2.5} />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
                          >
                            <Plus size={12} strokeWidth={2.5} />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-stone-400 hover:text-stone-800 underline underline-offset-2 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Order Summary */}
          {cartItems.length > 0 && (
            <div className="w-full lg:w-[380px] shrink-0 bg-white rounded-xl shadow-sm border border-stone-100 p-8 sticky top-8">
              <h2 className="text-xl font-bold text-stone-800 mb-8 font-sans">Order Summary</h2>

              <div className="flex flex-col gap-4 text-sm mb-6">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-mono text-xs">฿ {subtotal.toFixed(2)}</span>
                </div>

                <div>
                  <div className="flex justify-between text-stone-600 mb-1">
                    <span>Shipping</span>
                    <span className="text-[#7a8c6e] font-bold">Free</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#7a8c6e]">
                    <Check size={12} strokeWidth={3} />
                    <span className="text-xs italic font-medium">You qualify for free shipping.</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-stone-200 my-6"></div>

              <div className="flex items-end justify-between mb-8">
                <span className="font-bold text-stone-800">Total</span>
                <span className="text-2xl font-bold text-[#b46b45] tracking-tight font-sans">
                  ฿ {subtotal.toFixed(2)}
                </span>
              </div>

              <button className="w-full bg-[#8b5a45] hover:bg-[#724a38] text-white py-3.5 rounded-md font-bold text-sm transition-colors shadow-sm">
                Proceed to Checkout
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

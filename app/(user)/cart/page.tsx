"use client";

import { Navbar } from "../../components/Navbar";
import { Check, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PackBook = {
  title: string;
  author: string;
  cover: string | null;
};

type PackBookItem = {
  id: number;
  quantity: number;
  book: PackBook;
};

type CartItem = {
  id: number;
  bookId?: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  isPack?: boolean;
  packItems?: PackBookItem[];
};

const GUEST_CART_KEY = "cheapterCart";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGuestCart = () => {
    const rawCart = localStorage.getItem(GUEST_CART_KEY);
    const items = rawCart ? JSON.parse(rawCart) : [];
    setCartItems(items);
    setLoading(false);
  };

  const saveGuestCart = (items: CartItem[]) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  };

  const loadCart = async () => {
    const response = await fetch("/api/cart", {
      cache: "no-store",
      credentials: "include",
    });
    if (response.status === 401) {
      loadGuestCart();
      return;
    }
    const data = await response.json();
    setCartItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCart().catch(() => setLoading(false));
  }, []);

  const updateQuantity = async (id: number, delta: number) => {
    const item = cartItems.find((cartItem) => cartItem.id === id);
    if (!item) return;
    const nextQuantity = Math.max(1, item.quantity + delta);
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          return { ...item, quantity: nextQuantity };
        }
        return item;
      })
    );
    const response = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ itemId: id, quantity: nextQuantity }),
    });
    if (response.status === 401) {
      const nextItems = cartItems.map((cartItem) => cartItem.id === id ? { ...cartItem, quantity: nextQuantity } : cartItem);
      saveGuestCart(nextItems);
      return;
    }
    const data = await response.json();
    setCartItems(data.items || []);
  };

  const removeItem = async (id: number) => {
    const nextItems = cartItems.filter(item => item.id !== id);
    setCartItems(nextItems);
    const response = await fetch(`/api/cart?itemId=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.status === 401) {
      saveGuestCart(nextItems);
      return;
    }
    const data = await response.json();
    setCartItems(data.items || []);
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
            {loading ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-stone-100">
                <p className="text-stone-500">Loading your reading list...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-stone-100">
                <p className="text-stone-500 mb-4">Your reading list is empty.</p>
                <Link href="/catalog" className="text-[#b46b45] font-bold hover:underline">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-200 ${item.isPack ? 'border-[#e8ddd3]' : 'border-stone-100'}`}>
                  <div className="flex gap-0 relative">

                    {/* Cover image */}
                    <div className={`shrink-0 ${item.isPack ? 'w-[90px]' : 'w-[72px]'} self-stretch bg-stone-100 relative overflow-hidden`}>
                      <img
                        src={item.imageUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/30 to-transparent" />
                      {item.isPack && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#8b5a45]/80 to-transparent py-1.5 px-1 text-center">
                          <span className="text-[8px] font-black text-white uppercase tracking-widest leading-none">Pack</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 p-4 flex flex-col">

                      {/* Header row */}
                      <div className="mb-2">
                        {item.isPack && (
                          <span className="inline-flex items-center gap-1 bg-[#fdf5e6] text-[#b3884b] text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full mb-1.5">
                            📦 Book Pack
                          </span>
                        )}
                        <h3 className="font-bold text-stone-900 text-sm leading-snug">{item.title}</h3>
                        {!item.isPack && (
                          <p className="font-serif italic text-stone-400 text-[11px] mt-0.5">{item.author}</p>
                        )}
                      </div>

                      {/* Pack books list */}
                      {item.isPack && item.packItems && item.packItems.length > 0 && (
                        <div className="mb-3 space-y-1">
                          <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <span className="w-2 h-px bg-stone-300 inline-block"></span>
                            Includes {item.packItems.length} books
                            <span className="w-2 h-px bg-stone-300 inline-block"></span>
                          </p>
                          {item.packItems.map((pi, idx) => (
                            <div key={pi.id} className="flex items-center gap-2 bg-[#faf8f5] rounded-lg px-2.5 py-1.5 border border-stone-100">
                              <span className="w-4 h-4 flex-shrink-0 rounded-full bg-[#e8ddd3] text-[#8b6347] text-[8px] font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <div className="w-5 h-7 flex-shrink-0 bg-stone-200 rounded overflow-hidden shadow-sm">
                                {pi.book.cover && (
                                  <img src={pi.book.cover} alt={pi.book.title} className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-bold text-stone-700 truncate leading-snug">{pi.book.title}</p>
                                <p className="text-[9px] font-serif italic text-stone-400 truncate">{pi.book.author}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Footer: price + controls */}
                      <div className="mt-auto flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-bold text-[#b46b45] text-sm leading-none">
                            ฿ {(item.price * item.quantity).toFixed(2)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-stone-400 mt-0.5">฿{item.price.toFixed(2)} × {item.quantity}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Quantity stepper */}
                          <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                            >
                              <Minus size={11} strokeWidth={2.5} />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-stone-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                            >
                              <Plus size={11} strokeWidth={2.5} />
                            </button>
                          </div>
                          {/* Remove */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[11px] text-stone-400 hover:text-red-400 transition-colors font-medium"
                          >
                            Remove
                          </button>
                        </div>
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

              <button onClick={() => router.push("/checkout")} className="w-full bg-[#8b5a45] hover:bg-[#724a38] text-white py-3.5 rounded-md font-bold text-sm transition-colors shadow-sm">
                Proceed to Checkout
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

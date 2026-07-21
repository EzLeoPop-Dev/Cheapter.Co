"use client";

import { Navbar } from "../../components/Navbar";
import { ShoppingCart, Check } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";
import { useCart, GUEST_CART_KEY } from "../../context/CartContext";

export default function BookPacksCatalogPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { refreshCart, openCart } = useCart();
  const [packs, setPacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const addToCart = async (pack: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingId(pack.id);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookId: Number(pack.id), quantity: 1 }),
      });
      if (res.status === 401) {
        const rawCart = localStorage.getItem(GUEST_CART_KEY);
        const cart = rawCart ? JSON.parse(rawCart) : [];
        const existing = cart.find((item: any) => item.bookId === Number(pack.id));
        const nextCart = existing
          ? cart.map((item: any) => item.bookId === Number(pack.id) ? { ...item, quantity: item.quantity + 1 } : item)
          : [
              ...cart,
              {
                id: Date.now(),
                bookId: Number(pack.id),
                title: pack.title,
                author: pack.curator || "Store Staff",
                price: pack.totalPrice,
                quantity: 1,
                imageUrl: pack.image,
                isPack: true,
              },
            ];
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(nextCart));
        setAddedId(pack.id);
        setTimeout(async () => {
          setAddedId(null);
          await refreshCart();
          openCart();
        }, 800);
        return;
      }
      setAddedId(pack.id);
      setTimeout(async () => {
        setAddedId(null);
        await refreshCart();
        openCart();
      }, 800);
    } catch {
      // silent
    } finally {
      setAddingId(null);
    }
  };

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/book-packs');
        if (!res.ok) throw new Error('Failed to fetch book packs');
        const data = await res.json();
        
        const formattedPacks = data.map((pack: any) => ({
          id: String(pack.id),
          title: pack.title,
          curator: pack.author || "Store Staff",
          description: pack.description || "A curated collection of books.",
          price: Number(pack.price).toLocaleString('th-TH'),
          originalPrice: (Number(pack.price) * 1.2).toLocaleString('th-TH'), // Mock original price for now
          stock: pack.stock,
          badge: pack.stockStatus === 'InStock' ? "Available" : "Limited",
          image: pack.image || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
          packItems: pack.packItems.map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            book: {
              title: item.book.title,
              author: item.book.author,
              cover: item.book.image || "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&q=80"
            }
          }))
        }));
        
        setPacks(formattedPacks);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPacks();
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col font-sans text-stone-800">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between border-b border-stone-200 pb-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 font-serif tracking-tight mb-3">{t('pack.title')}</h1>
            <p className="text-base text-stone-500 max-w-2xl">{t('pack.subtitle')}</p>
          </div>
          <span className="text-[10px] font-bold text-stone-400 tracking-widest uppercase mb-1 mt-4 sm:mt-0">
            {t('pack.showing1')} {packs.length} {t('pack.showing2')}
          </span>
        </div>

        {/* Grid */}
        <div className="w-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <div className="w-9 h-9 border-4 border-stone-200 border-t-[#a07455] rounded-full animate-spin"></div>
                <span className="text-stone-500 text-sm font-medium tracking-wide">{t('pack.loading')}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {packs.map((pack) => (
                <div
                  key={pack.id}
                  className="group bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row"
                >
                  {/* ── Left: Cover Image ── */}
                  <Link
                    href={`/book-packs/${pack.id}`}
                    className="relative sm:w-[180px] w-full shrink-0 bg-gradient-to-br from-[#f7f3ed] to-[#ede8df] flex items-center justify-center overflow-hidden"
                  >
                    <img
                      src={pack.image}
                      alt={pack.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      style={{ minHeight: '200px' }}
                    />
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
                  </Link>

                  {/* ── Right: Content ── */}
                  <div className="flex-1 flex flex-col p-5 min-w-0">

                    {/* Label + Title */}
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 bg-[#fdf5e6] text-[#b3884b] text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2">
                        📦 {t('pack.badge')}
                      </span>
                      <h2 className="text-[17px] font-bold text-stone-900 leading-snug font-serif">{pack.title}</h2>
                      <p className="text-stone-400 text-[11px] font-serif italic mt-0.5">{t('pack.curator')} {pack.curator}</p>
                    </div>

                    {/* Description */}
                    <p className="text-stone-500 text-[11px] leading-relaxed line-clamp-2 mb-3">{pack.description}</p>

                    {/* Books in pack */}
                    <div className="flex-1 mb-4">
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span className="inline-block w-3 h-px bg-stone-300"></span>
                        {t('pack.includes1')} {pack.packItems.length} {t('pack.includes2')}
                        <span className="inline-block w-3 h-px bg-stone-300"></span>
                      </p>
                      <div className="space-y-1.5 max-h-[130px] overflow-y-auto pr-0.5 custom-scrollbar">
                        {pack.packItems.map((item: any, idx: number) => (
                          <div key={item.id} className="flex items-center gap-2.5 rounded-lg bg-stone-50 border border-stone-100 px-2.5 py-1.5 hover:bg-[#fdf8f4] transition-colors">
                            <span className="w-4 h-4 flex-shrink-0 rounded-full bg-[#e8ddd3] text-[#8b6347] text-[9px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div className="w-6 h-9 bg-stone-200 rounded flex-shrink-0 overflow-hidden shadow-sm">
                              {item.book.cover && (
                                <img src={item.book.cover} alt={item.book.title} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold text-stone-800 truncate leading-snug">{item.book.title}</p>
                              <p className="text-[9px] font-serif italic text-stone-400 truncate">{item.book.author}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer: price + button */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-[#b37554] tracking-tight leading-none">
                          ฿{pack.price}
                        </span>
                        {pack.originalPrice && (
                          <span className="text-xs text-stone-400 line-through font-medium">฿{pack.originalPrice}</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => addToCart(pack, e)}
                        disabled={addingId === pack.id || addedId === pack.id}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all duration-200 active:scale-95 ${
                          addedId === pack.id
                            ? 'bg-[#7a8c6e] text-white'
                            : 'bg-[#8b5a45] hover:bg-[#7a4e3c] text-white hover:shadow-md'
                        }`}
                      >
                        {addedId === pack.id ? (
                          <><Check className="w-3.5 h-3.5" /> Added!</>
                        ) : addingId === pack.id ? (
                          <><ShoppingCart className="w-3.5 h-3.5 animate-bounce" /> Adding...</>
                        ) : (
                          <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4c9be; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #b9a898; }
      `}</style>
    </div>
  );
}

"use client";

import { Navbar } from "../../components/Navbar";
import { ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "../../context/LanguageContext";

export default function BookPacksCatalogPage() {
  const { t } = useLanguage();
  const [packs, setPacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ใช้งาน Mock Data ให้ตรงกับ Design ที่ขอมา
    const mockPacks = [
      {
        id: "pack-1",
        title: "Poetry Collection Pack",
        curator: "Sarah Chen",
        description: "A beautiful collection of modern poetry exploring space, light, and design.",
        price: "1,490",
        originalPrice: "1,660",
        stock: 10,
        badge: "Staff Pick",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
        packItems: [
          { 
            id: 1, 
            quantity: 1, 
            book: { 
              title: "The Architecture of Silence", 
              author: "M. Lin",
              cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&q=80" 
            } 
          },
          { 
            id: 2, 
            quantity: 1, 
            book: { 
              title: "Wabi Sabi", 
              author: "Leonard Koren",
              cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80"
            } 
          },
          { 
            id: 3, 
            quantity: 1, 
            book: { 
              title: "Milk and Honey", 
              author: "Rupi Kaur",
              cover: "https://images.unsplash.com/photo-1626618012641-bfbca5a5d239?w=200&q=80"
            } 
          },
          { 
            id: 4, 
            quantity: 1, 
            book: { 
              title: "Devotions", 
              author: "Mary Oliver",
              cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&q=80"
            } 
          }
        ]
      },
      {
        id: "pack-2",
        title: "Classic Literature Bundle",
        curator: "John Doe",
        description: "A collection of timeless classics from renowned authors that shaped literature.",
        price: "1,200",
        originalPrice: "1,450",
        stock: 5,
        badge: "Best Seller",
        image: "https://images.unsplash.com/photo-1476275466078-4007374efac4?w=800&q=80",
        packItems: [
          { 
            id: 5, 
            quantity: 1, 
            book: { 
              title: "Pride and Prejudice", 
              author: "Jane Austen",
              cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80"
            } 
          },
          { 
            id: 6, 
            quantity: 1, 
            book: { 
              title: "To Kill a Mockingbird", 
              author: "Harper Lee",
              cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&q=80"
            } 
          },
          { 
            id: 7, 
            quantity: 1, 
            book: { 
              title: "1984", 
              author: "George Orwell",
              cover: "https://images.unsplash.com/photo-1626618012641-bfbca5a5d239?w=200&q=80"
            } 
          }
        ]
      }
    ];

    setTimeout(() => {
      setPacks(mockPacks);
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col font-sans text-stone-800">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between border-b border-stone-200 pb-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 font-serif tracking-tight mb-4">{t('pack.title')}</h1>
            <p className="text-lg text-stone-500 max-w-2xl">{t('pack.subtitle')}</p>
          </div>
          <span className="text-[10px] font-bold text-stone-400 tracking-widest uppercase mb-1 mt-4 sm:mt-0">
            {t('pack.showing1')} {packs.length} {t('pack.showing2')}
          </span>
        </div>

        {/* Grid List */}
        <div className="w-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-stone-200 border-t-[#a07455] rounded-full animate-spin mb-4"></div>
                <div className="text-stone-500 font-medium tracking-wide">{t('pack.loading')}</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {packs.map((pack) => (
                <Link href={`/book-packs/${pack.id}`} key={pack.id} className="bg-white rounded-xl border border-stone-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                  
                  {/* Left Side (Image Area) */}
                  <div className="relative w-full sm:w-[220px] bg-[#f7f5f0] p-5 flex flex-col items-center shrink-0 border-r border-stone-100 justify-center">
                    {/* Badge */}
                    {pack.badge && (
                      <div className="absolute top-3 left-3 bg-[#a67b5b] text-white px-2.5 py-0.5 text-[10px] font-bold rounded shadow-sm z-10 uppercase tracking-wide">
                        {pack.badge}
                      </div>
                    )}
                    
                    {/* Book Stack Image */}
                    <div className="w-full aspect-[4/5] rounded-md overflow-hidden shadow-sm relative group">
                      <img src={pack.image} alt={pack.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    
                    {/* Dots */}
                    <div className="flex items-center gap-1.5 mt-4">
                      <div className="w-4 h-1.5 bg-[#a67b5b] rounded-full opacity-90"></div>
                      <div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>
                    </div>
                  </div>

                  {/* Right Side (Content Area) */}
                  <div className="flex-1 p-5 flex flex-col">
                    {/* Title & Badge */}
                    <div className="mb-2.5">
                      <span className="inline-block bg-[#fdf5e6] text-[#b3884b] text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm mb-2">
                        {t('pack.badge')}
                      </span>
                      <h2 className="text-xl font-bold text-stone-900 leading-tight mb-0.5 font-serif">{pack.title}</h2>
                      <p className="font-serif italic text-stone-400 text-xs">{t('pack.curator')} {pack.curator}</p>
                    </div>

                    <p className="text-stone-500 text-xs mb-4 leading-relaxed line-clamp-2">
                      {pack.description}
                    </p>

                    {/* Includes List */}
                    <div className="mb-5 flex-1">
                      <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 border-b border-stone-100 pb-1.5">
                        {t('pack.includes1')} {pack.packItems.length} {t('pack.includes2')}
                      </h4>
                      <div className="pr-1 max-h-[110px] overflow-y-auto custom-scrollbar space-y-2 relative">
                        {pack.packItems.map((item, idx) => (
                          <div key={item.id} className="flex items-center gap-3 bg-white rounded-md border border-stone-100 p-2 hover:bg-stone-50 transition-colors">
                            <div className="w-8 h-12 bg-stone-100 rounded-sm flex-shrink-0 overflow-hidden shadow-sm">
                              {item.book.cover && <img src={item.book.cover} className="w-full h-full object-cover" alt={item.book.title} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-stone-800 text-xs leading-snug mb-0.5 truncate">{item.book.title}</p>
                              <p className="font-serif italic text-stone-400 text-[10px] truncate">{item.book.author}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer (Price & Action) */}
                    <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-[#b37554] tracking-tight">
                          ฿{pack.price}
                        </span>
                        {pack.originalPrice && (
                          <span className="text-xs font-bold text-stone-400 line-through">
                            ฿{pack.originalPrice}
                          </span>
                        )}
                      </div>
                      <button className="bg-[#8b5a45] hover:bg-[#7a4e3c] text-white px-4 py-2 rounded-md font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 transform hover:scale-105 active:scale-95">
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                    </div>
                  </div>

                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f5f5f5;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4d4d4;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a3a3a3;
        }
      `}</style>
    </div>
  );
}

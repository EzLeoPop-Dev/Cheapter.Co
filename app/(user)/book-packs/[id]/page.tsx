"use client";

import { Navbar } from "@/app/components/Navbar";
import { ShoppingCart, ArrowLeft, BookOpen, Heart, Package } from "lucide-react";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "../../../context/LanguageContext";

// Mock Data
const MOCK_PACKS = [
  {
    id: "pack-1",
    title: "Poetry Collection Pack",
    curator: "Sarah Chen",
    description: "A beautiful collection of modern poetry exploring space, light, and design. Perfect for those who appreciate the subtle art of words and silence.",
    price: 1490,
    originalPrice: 1660,
    stock: 10,
    badge: "Staff Pick",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
    packItems: [
      { id: 1, quantity: 1, book: { id: "1", title: "The Architecture of Silence", author: "M. Lin", cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&q=80" } },
      { id: 2, quantity: 1, book: { id: "2", title: "Wabi Sabi", author: "Leonard Koren", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80" } },
      { id: 3, quantity: 1, book: { id: "3", title: "Milk and Honey", author: "Rupi Kaur", cover: "https://images.unsplash.com/photo-1626618012641-bfbca5a5d239?w=400&q=80" } },
      { id: 4, quantity: 1, book: { id: "4", title: "Devotions", author: "Mary Oliver", cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&q=80" } }
    ]
  },
  {
    id: "pack-2",
    title: "Classic Literature Bundle",
    curator: "John Doe",
    description: "A collection of timeless classics from renowned authors that shaped literature. Essential reading for any literature enthusiast.",
    price: 1200,
    originalPrice: 1450,
    stock: 5,
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1476275466078-4007374efac4?w=800&q=80",
    packItems: [
      { id: 5, quantity: 1, book: { id: "5", title: "Pride and Prejudice", author: "Jane Austen", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80" } },
      { id: 6, quantity: 1, book: { id: "6", title: "To Kill a Mockingbird", author: "Harper Lee", cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&q=80" } },
      { id: 7, quantity: 1, book: { id: "7", title: "1984", author: "George Orwell", cover: "https://images.unsplash.com/photo-1626618012641-bfbca5a5d239?w=400&q=80" } }
    ]
  }
];

export default function BookPackDetailPage() {
  const params = useParams();
  const { t } = useLanguage();
  
  const pack = useMemo(() => {
    return MOCK_PACKS.find(p => p.id === params.id) || MOCK_PACKS[0];
  }, [params.id]);

  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col font-sans text-stone-800">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-12">
        
        {/* Back Link */}
        <Link href="/book-packs" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-[#b46b45] transition-colors mb-10 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          {t('packDetail.back')}
        </Link>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left Column: Visuals */}
          <div className="w-full lg:w-[500px] xl:w-[550px] shrink-0">
            <div className="relative aspect-square w-full max-w-[500px] mx-auto bg-stone-100 rounded-sm overflow-hidden p-8 flex items-center justify-center">
              <div className="relative w-full h-full">
                <div className="absolute top-[10%] left-[20%] w-[50%] h-[75%] bg-stone-300 rounded shadow-2xl rotate-[-10deg] overflow-hidden opacity-60">
                  <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover grayscale" />
                </div>
                <div className="absolute top-[15%] right-[20%] w-[50%] h-[75%] bg-stone-400 rounded shadow-xl rotate-[15deg] overflow-hidden opacity-80">
                  <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover sepia-[0.3]" />
                </div>
                <div className="absolute top-[20%] left-[25%] w-[50%] h-[75%] bg-white rounded shadow-2xl z-10 overflow-hidden border border-stone-200">
                  <div className="w-full h-full bg-[#fdf5e6] flex flex-col items-center justify-center p-6 text-center border-4 border-double border-[#b3884b]">
                    <span className="text-[10px] font-bold text-[#b3884b] uppercase tracking-widest mb-4">
                      {t('pack.badge')}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-stone-800 leading-tight mb-2">
                      {pack.title}
                    </h3>
                    <p className="text-xs text-stone-500 font-serif italic">{t('pack.curator')} {pack.curator}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex-1 flex flex-col pt-2 lg:pt-8">
            <div className="mb-4">
              <span className="inline-block bg-[#fdf5e6] text-[#b3884b] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-sm mb-4">
                {t('pack.badge')}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {pack.stock > 0 ? (
                <button className="w-full sm:w-auto bg-[#8b5a45] hover:bg-[#724a38] text-white px-10 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                  <ShoppingCart size={18} /> Add Pack to Cart
                </button>
              ) : (
                <button className="w-full sm:w-auto bg-stone-200 text-stone-500 px-10 py-3.5 rounded-xl font-bold text-sm shadow-sm cursor-not-allowed border border-stone-300 flex items-center justify-center gap-2">
                  <Package size={18} /> Out of Stock
                </button>
              )}
              
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-stone-200 text-stone-600 hover:text-[#b46b45] hover:border-[#b46b45] hover:bg-[#fdf5e6] px-6 py-3 rounded-xl font-bold text-sm transition-all bg-white">
                <Heart size={18} />
                Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Included Books */}
        <div className="w-full pt-4">
          <div className="flex flex-col mb-8 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-stone-900 font-serif tracking-tight mb-2">What's inside this pack?</h2>
            <p className="text-stone-500 text-sm">This bundle includes {pack.packItems.length} carefully selected books.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {pack.packItems.map((item) => (
              <Link href={`/books/${item.book.id}`} key={item.id} className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all hover:-translate-y-0.5 group">
                <div className="w-20 aspect-[2/3] bg-stone-100 rounded-md shadow-sm overflow-hidden shrink-0 relative">
                  <img src={item.book.cover} alt={item.book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-0 right-0 bg-stone-800 text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-bl-md">
                    {item.quantity}x
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-stone-900 text-sm mb-1 leading-snug truncate group-hover:text-[#b46b45] transition-colors">{item.book.title}</h3>
                  <p className="font-serif italic text-stone-500 text-xs truncate">{item.book.author}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

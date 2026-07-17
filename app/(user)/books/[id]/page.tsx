"use client";

import { Navbar } from "@/app/components/Navbar";
import { Heart, ChevronDown, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useMockStore } from "../../../admin/context/MockStoreContext";

const RELATED_BOOKS = [
  { id: "2", title: "Echoes of Kyoto", author: "Mei Lin", price: "$26.50", imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop" },
  { id: "3", title: "The Paper Crane", author: "Kenji Sato", price: "$18.00", originalPrice: "$22.00", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop" },
  { id: "4", title: "Whispers in the Bamboo", author: "Aiko Yamada", price: "$22.00", imageUrl: "https://images.unsplash.com/photo-1629196914234-a69077ee8478?q=80&w=400&auto=format&fit=crop" },
];

export default function BookDetailPage() {
  const params = useParams();
  const [isReadMore, setIsReadMore] = useState(false);
  const { products } = useMockStore();

  const MOCK_BOOK = useMemo(() => {
    const found = products.find(p => p.id === params.id) || products[0];
    return {
      id: found.id,
      title: found.name,
      author: found.author || "Unknown Author",
      price: `฿${found.price.toLocaleString()}`,
      category: found.type === 'ebook' ? "E-Book" : "Physical Book",
      description: found.description || "No description available.",
      imageUrl: found.cover || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
      quote: "",
      quantity: found.quantity
    };
  }, [products, params.id]);

  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col font-sans text-stone-800">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-16">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row gap-16 lg:gap-24 mb-32">
          
          {/* Left: Book Cover */}
          <div className="w-full md:w-2/5 shrink-0 flex justify-center">
            <div className="relative w-full max-w-[300px] aspect-[2/3] bg-white rounded-md shadow-2xl p-1.5 transform rotate-[-1deg] transition-transform hover:rotate-0 duration-500">
              <div className="w-full h-full relative rounded-sm overflow-hidden shadow-inner">
                <img src={MOCK_BOOK.imageUrl} alt={MOCK_BOOK.title} className="w-full h-full object-cover" />
                {/* Spine Effect */}
                <div className="absolute left-0 top-0 bottom-0 w-[6%] bg-gradient-to-r from-black/50 to-transparent"></div>
                <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-white/30"></div>
                {/* Page edges effect on the right */}
                <div className="absolute right-0 top-0 bottom-0 w-[1%] bg-white/40"></div>
              </div>
            </div>
          </div>

          {/* Right: Book Details */}
          <div className="w-full md:w-3/5 flex flex-col pt-4 md:pl-8">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-3">
              {MOCK_BOOK.category}
            </span>
            
            <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-2 font-serif tracking-tight">
              {MOCK_BOOK.title}
            </h1>
            
            <p className="text-base text-stone-500 mb-6 font-serif italic">
              by {MOCK_BOOK.author}
            </p>
            
            <p className="text-lg font-bold text-stone-800 mb-6">
              {MOCK_BOOK.price}
            </p>
            
            <div className="text-sm text-stone-500 leading-relaxed font-sans mb-4 max-w-xl">
              <p className={isReadMore ? "" : "line-clamp-3"}>
                {MOCK_BOOK.description}
              </p>
            </div>
            
            <button 
              onClick={() => setIsReadMore(!isReadMore)}
              className="text-[#b46b45] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-stone-800 transition-colors mb-10 w-fit"
            >
              Read {isReadMore ? "less" : "more"} 
              <ChevronDown size={12} className={`transform transition-transform ${isReadMore ? "rotate-180" : ""}`} />
            </button>

            <div className="flex items-center gap-3">
              {MOCK_BOOK.quantity > 0 ? (
                <button className="bg-[#8b5a45] hover:bg-[#724a38] text-white px-8 py-2.5 rounded-md font-bold text-xs transition-all shadow-sm">
                  Add to Cart
                </button>
              ) : (
                <button className="bg-stone-200 text-stone-500 px-8 py-2.5 rounded-md font-bold text-xs shadow-sm cursor-not-allowed border border-stone-300">
                  สินค้าหมด (Out of Stock)
                </button>
              )}
              {MOCK_BOOK.quantity === 0 && (
                <button className="bg-stone-800 hover:bg-stone-900 text-white px-6 py-2.5 rounded-md font-bold text-xs transition-all shadow-sm">
                  แจ้งเตือนเมื่อมีสินค้า
                </button>
              )}
              <button className="flex items-center justify-center gap-2 border border-stone-300 text-stone-600 hover:text-[#b46b45] hover:border-[#b46b45] px-5 py-2.5 rounded-md font-bold text-xs transition-all bg-white shadow-sm">
                <Heart size={14} />
                Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Middle Section: Quote */}
        <div className="w-full max-w-3xl mx-auto py-12 mb-20 relative">
          <Quote className="absolute top-4 left-0 text-[#e6dbcc] opacity-50 rotate-180" size={36} />
          <p className="text-xl md:text-2xl text-center text-stone-700 font-serif leading-relaxed px-10 z-10 relative">
            {MOCK_BOOK.quote}
          </p>
          <Quote className="absolute bottom-4 right-0 text-[#e6dbcc] opacity-50" size={36} />
        </div>

        {/* Bottom Section: Recommendations */}
        <div className="w-full pt-10 border-t border-stone-200/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-stone-900 font-serif tracking-tight">You might also like</h2>
            <div className="flex gap-2">
              <button className="w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:border-stone-400 transition-colors bg-white">
                <ChevronLeft size={12} />
              </button>
              <button className="w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:border-stone-400 transition-colors bg-white">
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-5">
            {RELATED_BOOKS.map((book) => (
              <Link href={`/books/${book.id}`} key={book.id} className="group cursor-pointer">
                <div className="w-full aspect-[2/3] bg-[#f4f1eb] rounded-md shadow-sm mb-3 relative overflow-hidden group-hover:-translate-y-1.5 group-hover:shadow-md transition-all duration-300">
                  <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                  <div className="absolute left-0 top-0 bottom-0 w-[8%] bg-gradient-to-r from-black/40 to-transparent"></div>
                  <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-white/20"></div>
                </div>
                <h3 className="font-bold text-stone-800 text-xs mb-0.5 leading-snug group-hover:text-[#b46b45] transition-colors">{book.title}</h3>
                <p className="font-serif italic text-stone-500 text-[10px] mb-1.5">{book.author}</p>
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-stone-800 text-xs">{book.price}</span>
                  {book.originalPrice && <span className="line-through text-stone-400 text-[10px]">{book.originalPrice}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

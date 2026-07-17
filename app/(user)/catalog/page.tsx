"use client";

import { Navbar } from "../../components/Navbar";
import { ChevronDown, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useMockStore } from "../../admin/context/MockStoreContext";

const CATEGORIES = ["Fiction", "Non-Fiction", "Poetry", "Art & Design", "Essays", "Children's"];
const FORMATS = ["Hardcover", "Paperback", "E-book"];

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState("Fiction");
  const [selectedFormats, setSelectedFormats] = useState(["Hardcover", "Paperback"]);
  const { products } = useMockStore();

  const displayProducts = useMemo(() => {
    // Only show Active products on the catalog list
    return products.filter(p => p.status === 'active').map(p => ({
      id: p.id,
      title: p.name,
      author: p.author || "Unknown Author",
      price: `฿${p.price.toLocaleString()}`,
      originalPrice: null,
      tag: p.quantity === 0 ? "Out of Stock" : null,
      imageUrl: p.cover || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
      isWide: false,
      quantity: p.quantity
    }));
  }, [products]);

  const toggleFormat = (format: string) => {
    setSelectedFormats(prev =>
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col font-sans text-stone-800">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">

          {/* Sidebar */}
          <aside className="w-full lg:w-56 shrink-0 flex flex-col gap-8">
            {/* Categories */}
            <div>
              <h3 className="text-base font-bold text-stone-800 mb-3 tracking-tight">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border shadow-sm ${selectedCategory === cat
                        ? "bg-[#8b5a45] text-white border-[#8b5a45]"
                        : "bg-white text-stone-600 border-stone-200 hover:border-[#8b5a45] hover:text-[#8b5a45]"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div>
              <h3 className="text-base font-bold text-stone-800 mb-3 tracking-tight">Format</h3>
              <div className="flex flex-col gap-2.5">
                {FORMATS.map(format => (
                  <label key={format} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shadow-sm ${selectedFormats.includes(format)
                        ? "bg-[#8b5a45] border-[#8b5a45] text-white"
                        : "bg-white border-stone-300 group-hover:border-[#8b5a45]"
                      }`}>
                      {selectedFormats.includes(format) && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span className="text-xs text-stone-700 font-medium">{format}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-base font-bold text-stone-800 mb-3 tracking-tight">Price Range</h3>
              <div className="relative pt-2 pb-6 px-1">
                {/* Fake slider track */}
                <div className="w-full h-1 bg-stone-200 rounded-full"></div>
                {/* Fake filled track */}
                <div className="absolute top-2 left-0 w-1/2 h-1 bg-[#8b5a45] rounded-full"></div>
                {/* Fake thumb */}
                <div className="absolute top-1 left-[50%] w-3 h-3 bg-[#8b5a45] rounded-full shadow-md cursor-grab"></div>
                {/* Labels */}
                <div className="flex justify-between items-center mt-3 text-[9px] text-stone-500 font-bold uppercase tracking-wider">
                  <span>$0</span>
                  <span>$100+</span>
                </div>
              </div>
            </div>

            {/* Sort by */}
            <div>
              <h3 className="text-base font-bold text-stone-800 mb-3 tracking-tight">Sort by</h3>
              <div className="relative">
                <select className="w-full appearance-none bg-white border border-stone-200 shadow-sm rounded-md py-2 pl-3 pr-8 text-xs font-medium text-stone-700 outline-none focus:border-[#8b5a45] cursor-pointer">
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Popularity</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-stone-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4">
              <h1 className="text-3xl font-bold text-stone-800 tracking-tight font-serif">All Books</h1>
              <span className="text-[10px] font-bold text-stone-400 tracking-widest uppercase mb-1">
                Showing {displayProducts.length} books
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {displayProducts.map((book) => (
                <Link
                  href={`/books/${book.id}`}
                  key={book.id}
                  className={`bg-[#fdfcfb] rounded-xl p-4 border border-stone-100 shadow-sm flex flex-col group cursor-pointer hover:shadow-md transition-all block ${book.isWide ? 'col-span-2 md:flex-row gap-4 items-center' : ''}`}
                >
                  {/* Book Image Container */}
                  <div className={`relative shrink-0 ${book.isWide ? 'w-[120px] md:w-[150px]' : 'w-full aspect-[4/5] flex items-center justify-center bg-[#f4f1eb] rounded-lg mb-3'}`}>
                    {book.tag && (
                      <div className={`absolute -top-3 -left-2 ${book.tag === 'Out of Stock' ? 'bg-red-500' : 'bg-[#7a8c6e]'} text-white px-2 py-0.5 rounded-md font-bold text-[9px] tracking-wider shadow-sm z-20`}>
                        {book.tag}
                      </div>
                    )}
                    <div className={`${book.isWide ? 'w-full aspect-[2/3]' : 'w-[110px] aspect-[2/3]'} rounded-sm shadow-md overflow-hidden relative group-hover:-translate-y-1 transition-transform`}>
                      <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                      <div className="absolute left-0 top-0 bottom-0 w-[8%] bg-gradient-to-r from-black/40 to-transparent"></div>
                      <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-white/20"></div>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className={`flex flex-col flex-1 ${book.isWide ? 'pt-2' : ''}`}>
                    <h3 className="text-base font-bold text-stone-800 mb-1 leading-snug">{book.title}</h3>
                    <p className="font-serif italic text-stone-400 text-xs mb-3">{book.author}</p>

                    {book.isWide && book.description && (
                      <p className="text-stone-500 text-xs leading-relaxed mb-4 font-sans line-clamp-3">
                        {book.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-auto pt-2">
                      <p className="font-sans font-bold text-stone-800 text-xs">{book.price}</p>
                      {book.originalPrice && (
                        <p className="line-through text-stone-400 text-[10px]">{book.originalPrice}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-16 pb-8">
              <button className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-800 transition-colors cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 rounded-md bg-[#8b5a45] text-white font-bold text-sm flex items-center justify-center shadow-sm">
                1
              </button>
              <button className="w-8 h-8 rounded-md bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium text-sm flex items-center justify-center transition-colors shadow-sm">
                2
              </button>
              <button className="w-8 h-8 rounded-md bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium text-sm flex items-center justify-center transition-colors shadow-sm">
                3
              </button>
              <span className="text-stone-400 px-1">...</span>
              <button className="w-8 h-8 rounded-md bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium text-sm flex items-center justify-center transition-colors shadow-sm">
                7
              </button>
              <button className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-800 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

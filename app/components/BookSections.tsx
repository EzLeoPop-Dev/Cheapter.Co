"use client";

import { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, ChevronLeft, ChevronRight, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";

type Book = {
  id: string | number;
  title: string;
  author: string;
  price: string;
  rating?: number;
  reviews?: string;
  colorClass?: string;
  imageUrl?: string;
  stock?: number;
};

const mockBooks: Book[] = [
  { id: "1", title: "The Architecture of Silence", author: "M. Lin", price: "$520", rating: 4.9, reviews: "2.1k", imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop" },
  { id: "2", title: "Wabi Sabi", author: "Leonard Koren", price: "$380", rating: 4.7, reviews: "850", imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop" },
  { id: "3", title: "Kitchen", author: "Banana Yoshimoto", price: "$410", rating: 4.8, reviews: "1.5k", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop" },
  { id: "4", title: "In Praise of Shadows", author: "Junichiro Tanizaki", price: "$350", rating: 4.6, reviews: "920", imageUrl: "https://images.unsplash.com/photo-1629196914234-a69077ee8478?q=80&w=400&auto=format&fit=crop" },
  { id: "5", title: "Norwegian Wood", author: "Haruki Murakami", price: "$480", rating: 4.8, reviews: "3.2k", imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop" },
];

const bestSellers: Book[] = [
  { id: "1", title: "ชีววิทยาเบื้องต้น", author: "ดร. กานต์ กิตติธร", price: "฿320", rating: 4.8, reviews: "1.2k", imageUrl: "https://images.unsplash.com/photo-1614165936126-22485f58c287?q=80&w=400&auto=format&fit=crop" },
  { id: "2", title: "คณิตศาสตร์เพื่อการแก้ปัญหา", author: "รศ.ดร. อัมพร รักเรียน", price: "฿290", rating: 4.6, reviews: "890", imageUrl: "https://images.unsplash.com/photo-1596443686812-a392e2fb8d0d?q=80&w=400&auto=format&fit=crop" },
  { id: "3", title: "โจทย์สมการคณิตศาสตร์", author: "นางสาว มนัสวี ปัญญา", price: "฿260", rating: 4.7, reviews: "760", imageUrl: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=400&auto=format&fit=crop" },
  { id: "4", title: "แสงดาวเหนือฟ้า", author: "พิมพ์พร พรหมทา", price: "฿220", rating: 4.5, reviews: "640", imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop" },
];



function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.id}`} className="flex flex-col gap-3 min-w-40 w-40 md:min-w-45 md:w-45 relative group cursor-pointer">
      {/* Book Cover */}
      <div className={`w-full aspect-2/3 rounded-md shadow-md overflow-hidden group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300 relative z-10 ${!book.imageUrl ? (book.colorClass || 'bg-stone-800') : 'bg-stone-200'}`}>
        {book.imageUrl ? (
          <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full max-w-full px-2 gap-4 text-center p-4">
            <h4 className="text-white font-bold text-sm leading-snug drop-shadow-sm">{book.title}</h4>
            <p className="text-white/80 text-[10px] tracking-wider font-medium">{book.author}</p>
          </div>
        )}
        {/* spine */}
        <div className="absolute left-0 top-0 bottom-0 w-[8%] bg-linear-to-r from-black/40 to-transparent"></div>
        <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-white/20"></div>
      </div>

      {/* Book Info */}
      <div className="flex flex-col gap-0.5 z-10 mt-1">
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <Star size={12} className="fill-amber-500 text-amber-500" />
          <span className="font-sans font-bold text-xs text-stone-800">{book.rating || "4.5"}</span>
          <span className="font-sans text-[11px] text-stone-500">{book.reviews || "100"} reviews</span>
        </div>

        {/* Title & Author */}
        <h3 className="font-sans font-bold text-stone-800 text-sm leading-tight line-clamp-1 group-hover:text-amber-900 transition-colors">
          {book.title}
        </h3>
        <p className="font-serif italic text-stone-500 text-xs">
          {book.author}
        </p>

        {/* Price & Cart */}
        <div className="flex items-center justify-between mt-1">
          <p className="font-sans font-bold text-[#b46b45] text-xs">
            {book.price}
          </p>
          <button className="text-stone-400 hover:text-amber-900 transition-colors p-1 hover:bg-stone-100 rounded-full">
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </Link>
  );
}

function BestSellerCard({ book, rank }: { book: Book; rank: number }) {
  return (
    <Link href={`/books/${book.id}`} className="flex flex-col gap-4 min-w-60 w-60 md:min-w-70 md:w-70 relative group cursor-pointer pl-12 pt-4">
      {/* Large number in front */}
      <div 
        className="absolute -left-2 top-[5%] text-[90px] md:text-[110px] leading-none font-black text-[#b46b45] drop-shadow-lg z-30 select-none tracking-tighter italic pointer-events-none transition-all duration-500 ease-in-out group-hover:opacity-30 group-hover:-z-10 group-hover:-translate-x-4 group-hover:scale-95"       >
        {rank}
      </div>

      {/* Book Cover Container */}
      <div className="relative z-10">
        {/* Book Cover */}
        <div className={`w-40 md:w-45 aspect-2/3 rounded-md shadow-lg overflow-hidden group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300 relative z-10 ${!book.imageUrl ? (book.colorClass || 'bg-stone-800') : 'bg-stone-200'}`}>
          {book.imageUrl ? (
            <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full max-w-full px-2 gap-4 text-center p-4">
              <h4 className="text-white font-bold text-sm leading-snug drop-shadow-sm">{book.title}</h4>
              <p className="text-white/80 text-[10px] tracking-wider font-medium">{book.author}</p>
            </div>
          )}
          {/* spine */}
          <div className="absolute left-0 top-0 bottom-0 w-[8%] bg-linear-to-r from-black/40 to-transparent"></div>
          <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-white/20"></div>
        </div>
      </div>

      {/* Book Info */}
      <div className="flex flex-col gap-0.5 z-10 mt-3 w-40 md:w-45">
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <Star size={12} className="fill-amber-500 text-amber-500" />
          <span className="font-sans font-bold text-xs text-stone-800">{book.rating}</span>
          <span className="font-sans text-[11px] text-stone-500">{book.reviews} reviews</span>
        </div>

        {/* Title & Author */}
        <h3 className="font-sans font-bold text-stone-800 text-sm leading-tight line-clamp-1 group-hover:text-amber-900 transition-colors">
          {book.title}
        </h3>
        <p className="font-serif italic text-stone-500 text-xs">
          {book.author}
        </p>

        {/* Price & Cart */}
        <div className="flex items-center justify-between mt-1">
          <p className="font-sans font-bold text-[#b46b45] text-xs">
            {book.price}
          </p>
          <button className="text-stone-400 hover:text-amber-900 transition-colors p-1 hover:bg-stone-100 rounded-full">
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </Link>
  );
}

export function RecommendedSection({ books = mockBooks }: { books?: Book[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-8 pt-12 pb-4">
      <div className="flex items-end justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">Recommended This Week</h2>
        
        <div className="flex items-center gap-6">
          <button className="text-xs font-bold text-amber-900 hover:text-[#b46b45] transition-colors border-b border-transparent hover:border-[#b46b45]">
            View All
          </button>
          
          <div className="flex items-center gap-2">
            <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:border-stone-400 transition-colors bg-white shadow-sm">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:border-stone-400 transition-colors bg-white shadow-sm">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
        {books.map((book) => (
          <div key={book.id} className="snap-start">
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function BestSellersSection({ books = bestSellers }: { books?: Book[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-8 pt-4 pb-16 mb-10 overflow-hidden relative">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">Best Sellers Top 10</h2>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2 relative z-20">
          <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:border-stone-400 transition-colors bg-white shadow-sm">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:border-stone-400 transition-colors bg-white shadow-sm">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-8 overflow-x-auto pb-10 scrollbar-hide snap-x pt-6">
        {books.map((book, index) => (
          <div key={book.id} className="snap-start shrink-0">
            <BestSellerCard book={book} rank={index + 1} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function StaffPicksSection() {
  const [bundlePacks, setBundlePacks] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const res = await fetch('/api/admin/book-packs');
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((pack: any) => ({
            id: String(pack.id),
            title: pack.title,
            curator: pack.author || "Store Staff",
            description: pack.description || "A curated collection of books.",
            price: `฿${Number(pack.price).toLocaleString('th-TH')}`,
            originalPrice: `฿${(Number(pack.price) * 1.2).toLocaleString('th-TH')}`,
            images: [
              pack.image || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop"
            ],
            books: pack.packItems.map((item: any) => ({
              id: item.book.id,
              title: item.book.title,
              author: item.book.author,
              imageUrl: item.book.image || "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=200&auto=format&fit=crop"
            }))
          }));
          setBundlePacks(mapped);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPacks();
  }, []);

  const nextPack = () => {
    if (bundlePacks.length > 0) {
      setActiveIndex((prev) => (prev + 1) % bundlePacks.length);
    }
  };

  const prevPack = () => {
    if (bundlePacks.length > 0) {
      setActiveIndex((prev) => (prev === 0 ? bundlePacks.length - 1 : prev - 1));
    }
  };

  if (bundlePacks.length === 0) return null;

  return (
    <section className="w-full max-w-[100vw] overflow-hidden py-16 mb-16 border-t border-stone-200/60 mt-4 relative">
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">Book Picks</h2>
        {/* Navigation Arrows */}
        <div className="flex items-center gap-2 relative z-40">
          <button onClick={prevPack} className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:text-stone-800 hover:border-stone-400 hover:bg-stone-50 transition-colors bg-white shadow-sm cursor-pointer">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextPack} className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:text-stone-800 hover:border-stone-400 hover:bg-stone-50 transition-colors bg-white shadow-sm cursor-pointer">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative h-212.5 sm:h-162.5 md:h-137.5 max-w-7xl mx-auto flex items-center justify-center perspective-[1000px]">
        {bundlePacks.map((pack, index) => {
          const isActive = index === activeIndex;
          let position = "translate-x-full opacity-0 scale-75";
          let zIndex = 0;
          let blur = "blur-none";
          
          if (index === activeIndex) {
             position = "translate-x-0 opacity-100 scale-100";
             zIndex = 30;
          } else if (index === (activeIndex - 1 + bundlePacks.length) % bundlePacks.length) {
             position = "-translate-x-[45%] md:-translate-x-[65%] opacity-40 scale-[0.6]";
             zIndex = 10;
             blur = "blur-[2px]";
          } else if (index === (activeIndex + 1) % bundlePacks.length) {
             position = "translate-x-[45%] md:translate-x-[65%] opacity-40 scale-[0.6]";
             zIndex = 10;
             blur = "blur-[2px]";
          }

          return (
            <div 
              key={pack.id} 
              className={`absolute transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${position} ${blur} w-full max-w-4xl px-4 md:px-0`} 
              style={{ zIndex }}
            >
              <div className={`flex flex-col md:flex-row gap-8 md:gap-12 items-start bg-white/70 p-6 md:p-8 rounded-2xl border border-stone-100 shadow-xl relative backdrop-blur-md transition-all ${!isActive ? 'pointer-events-none' : ''}`}>
                
                {/* Left Side: Image Carousel with Badge */}
                <div className="relative shrink-0 w-full max-w-65 mx-auto md:mx-0">
                  <div className="absolute -top-6 -left-4 bg-[#b46b45] text-white px-4 py-1.5 rounded-md font-bold text-[12px] shadow-md z-20 border border-[#965431]">
                    Staff Pick
                  </div>
                  
                  <div className="bg-[#f5f3ee] rounded-xl p-3 shadow-sm border border-[#e6dbcc] relative z-10 w-full">
                    <div className="flex overflow-x-auto snap-x scrollbar-hide rounded-lg" style={{ scrollbarWidth: 'none' }}>
                      {pack.images.map((src: string, idx: number) => (
                        <div key={idx} className="snap-center shrink-0 w-full aspect-4/5 relative group">
                          <img src={src} alt={`${pack.title} ${idx + 1}`} className="w-full h-full object-cover rounded-lg shadow-sm" />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center gap-1.5 mt-3 mb-1">
                       {pack.images.map((_: any, idx: number) => (
                         <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === 0 ? 'w-4 bg-[#b46b45]' : 'w-1.5 bg-stone-300'}`}></div>
                       ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Text & Book List */}
                <div className="flex flex-col pt-2 w-full mx-auto md:mx-0 text-center md:text-left flex-1 h-full">
                  <div className="mb-2">
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-1 rounded-full uppercase tracking-wider">Bundle Pack</span>
                  </div>
                  <h3 className="text-2xl font-bold text-stone-800 mb-1 font-sans">{pack.title}</h3>
                  <p className="font-serif italic text-stone-400 mb-4 text-sm">Curated by {pack.curator}</p>
                  
                  <p className="text-stone-600 text-sm leading-relaxed mb-6 font-sans">
                    {pack.description}
                  </p>

                  {/* List of Books in Bundle */}
                  <div className="mb-6 flex flex-col gap-2 overflow-y-auto max-h-40 pr-2 scrollbar-thin text-left">
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Includes {pack.books.length} Books:</h4>
                    {pack.books.map((book: any) => (
                      <div key={book.id} className="flex gap-3 items-center bg-white/60 p-2 rounded-lg border border-stone-100 hover:bg-white hover:shadow-sm transition-all">
                        <img src={book.imageUrl} alt={book.title} className="w-10 h-14 object-cover rounded shadow-sm" />
                        <div className="flex flex-col flex-1">
                          <h4 className="text-sm font-bold text-stone-800 line-clamp-1">{book.title}</h4>
                          <p className="text-[11px] text-stone-500 font-serif italic">{book.author}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 mt-auto pt-4 border-t border-stone-200/50">
                     <div className="flex items-center gap-3">
                       <p className="font-sans font-bold text-[#b46b45] text-2xl">{pack.price}</p>
                       <p className="line-through text-stone-400 text-sm">{pack.originalPrice}</p>
                     </div>
                     <Link href={`/book-packs/${pack.id}`} className="w-full sm:w-auto bg-[#8b5a45] hover:bg-[#724a38] text-white px-6 py-3 rounded-md font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2">
                       View Details
                     </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

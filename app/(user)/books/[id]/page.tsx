"use client";

import { Navbar } from "@/app/components/Navbar";
import { ShoppingCart, Heart, ArrowLeft, Star, ChevronDown, Check, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import {
  addWishlistToApi,
  fetchWishlistFromApi,
  isBookInWishlist,
  removeWishlistFromApi,
  toggleWishlistBook,
} from "@/src/lib/wishlist";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    avatar: string | null;
  };
};

type ReviewStats = {
  totalReviews: number;
  averageRating: number;
  ratingCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

const RELATED_BOOKS = [
  { id: "2", title: "Echoes of Kyoto", author: "Mei Lin", price: "$26.50", imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop" },
  { id: "3", title: "The Paper Crane", author: "Kenji Sato", price: "$18.00", originalPrice: "$22.00", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop" },
  { id: "4", title: "Whispers in the Bamboo", author: "Aiko Yamada", price: "$22.00", imageUrl: "https://images.unsplash.com/photo-1629196914234-a69077ee8478?q=80&w=400&auto=format&fit=crop" },
];

const MOCK_REVIEWS = [
  {
    id: 1,
    user: "Alice Smith",
    avatar: "https://i.pravatar.cc/150?u=alice",
    rating: 5,
    date: "October 12, 2025",
    content: "Absolutely captivating from start to finish. The author's prose is beautiful and evocative. I couldn't put it down once I started reading!"
  },
  {
    id: 2,
    user: "David Johnson",
    avatar: "https://i.pravatar.cc/150?u=david",
    rating: 4,
    date: "September 28, 2025",
    content: "A very solid read. The character development is excellent, though the pacing in the middle felt a bit slow. Still highly recommended."
  },
  {
    id: 3,
    user: "Emma Wong",
    avatar: "https://i.pravatar.cc/150?u=emma",
    rating: 5,
    date: "August 05, 2025",
    content: "This book changed my perspective entirely. A masterpiece of modern literature. I'll be buying a copy for all my friends!"
  }
];

export default function BookDetailPage() {
  const params = useParams();
  const [isReadMore, setIsReadMore] = useState(false);
  const [isQuoteExpanded, setIsQuoteExpanded] = useState(false);
  const [apiBook, setApiBook] = useState<null | {
    id: number;
    title: string;
    author: string;
    price: number;
    category: string | null;
    description: string | null;
    imageUrl: string | null;
    quantity: number;
    format: string;
    ebookFile?: string | null;
    sampleLimit?: number | null;
    isbn?: string | null;
    pages?: number | null;
    language?: string | null;
    publishDate?: string | null;
    publisher?: string | null;
    quote?: string | null;
  }>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  useEffect(() => {
    const bookId = Array.isArray(params.id) ? params.id[0] : params.id;

    if (!bookId) {
      return;
    }

    const controller = new AbortController();

    async function loadBook() {
      try {
        const response = await fetch(`/api/catalog/${bookId}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!data?.book) {
          return;
        }

        setApiBook(data.book);
      } catch {
        // Keep page stable if API request fails.
      }
    }

    loadBook();

    return () => {
      controller.abort();
    };
  }, [params.id]);

  useEffect(() => {
    if (!apiBook) {
      setIsWishlisted(false);
      return;
    }

    const bookId = apiBook.id;

    let mounted = true;

    async function loadWishlistState() {
      try {
        const data = await fetchWishlistFromApi();
        if (!mounted) {
          return;
        }

        if (data.authenticated) {
          setIsWishlisted(data.ids.includes(bookId));
          return;
        }
      } catch {
        // Fallback to local storage mode.
      }

      if (!mounted) {
        return;
      }

      setIsWishlisted(isBookInWishlist(bookId));
    }

    loadWishlistState();

    return () => {
      mounted = false;
    };
  }, [apiBook]);

  useEffect(() => {
    if (!apiBook) return;

    const controller = new AbortController();
    
    async function loadReviews() {
      setIsLoadingReviews(true);
      try {
        const url = `/api/catalog/${apiBook.id}/reviews${selectedRating ? `?rating=${selectedRating}` : ''}`;
        const res = await fetch(url, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
          setReviewStats(data.stats || null);
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setIsLoadingReviews(false);
      }
    }

    loadReviews();

    return () => {
      controller.abort();
    };
  }, [apiBook, selectedRating]);

  const BOOK = useMemo(() => {
    if (!apiBook) {
      return {
        id: "",
        title: "Loading...",
        author: "",
        price: "฿0",
        category: "Book",
        description: "",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
        quote: "",
        quantity: 0,
        format: "Hardcover",
        isbn: "",
        pages: 0,
        language: "Thai",
        publishDate: "",
        publisher: "Unknown",
      };
    }

    return {
      id: String(apiBook.id),
      title: apiBook.title,
      author: apiBook.author || "Unknown Author",
      price: `฿${apiBook.price.toLocaleString()}`,
      category: apiBook.category || "Book",
      description: apiBook.description || "No description available.",
      imageUrl: apiBook.imageUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
      quote: "",
      quantity: apiBook.quantity,
      format: apiBook.format,
      ebookFile: apiBook.ebookFile,
      sampleLimit: apiBook.sampleLimit,
      isbn: apiBook.isbn || "-",
      pages: apiBook.pages || 0,
      language: apiBook.language || "Thai",
      publishDate: apiBook.publishDate || "-",
      publisher: apiBook.publisher || "-",
      quote: apiBook.quote || "",
    };
  }, [apiBook]);

  const handleToggleWishlist = async () => {
    if (!apiBook) {
      return;
    }

    try {
      const data = isWishlisted
        ? await removeWishlistFromApi(apiBook.id)
        : await addWishlistToApi(apiBook.id);

      if (data.authenticated) {
        setIsWishlisted(data.ids.includes(apiBook.id));
        return;
      }
    } catch {
      // Fallback to local storage mode.
    }

    const result = toggleWishlistBook({
      id: apiBook.id,
      title: apiBook.title,
      author: apiBook.author,
      price: apiBook.price,
      imageUrl: apiBook.imageUrl,
      quantity: apiBook.quantity,
    });

    setIsWishlisted(result.added);
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col font-sans text-stone-800">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-16">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row gap-16 lg:gap-24 mb-32">

          {/* Left: Book Cover */}
          <div className="w-full md:w-2/5 shrink-0 flex justify-center">
            <div className="relative w-full max-w-75 aspect-2/3 bg-white rounded-md shadow-2xl p-1.5 transform -rotate-1 transition-transform hover:rotate-0 duration-500">
              <div className="w-full h-full relative rounded-sm overflow-hidden shadow-inner">
                <img src={BOOK.imageUrl} alt={BOOK.title} className="w-full h-full object-cover" />
                {/* Spine Effect */}
                <div className="absolute left-0 top-0 bottom-0 w-[6%] bg-linear-to-r from-black/50 to-transparent"></div>
                <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-white/30"></div>
                {/* Page edges effect on the right */}
                <div className="absolute right-0 top-0 bottom-0 w-[1%] bg-white/40"></div>
              </div>
            </div>
          </div>

          {/* Right: Book Details */}
          <div className="w-full md:w-3/5 flex flex-col pt-4 md:pl-8">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-3">
              {BOOK.category}
            </span>

            <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-2 font-serif tracking-tight">
              {BOOK.title}
            </h1>

            <p className="text-base text-stone-500 mb-6 font-serif italic">
              by {BOOK.author}
            </p>

            <p className="text-lg font-bold text-stone-800 mb-6">
              {BOOK.price}
            </p>

            <div className="text-sm text-stone-500 leading-relaxed font-sans mb-4 max-w-xl">
              <p className={isReadMore ? "" : "line-clamp-3"}>
                {BOOK.description}
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
              {BOOK.quantity > 0 || BOOK.format === 'EBook' ? (
                <button className="bg-[#8b5a45] hover:bg-[#724a38] text-white px-8 py-2.5 rounded-md font-bold text-xs transition-all shadow-sm">
                  Add to Cart
                </button>
              ) : (
                <button className="bg-stone-200 text-stone-500 px-8 py-2.5 rounded-md font-bold text-xs shadow-sm cursor-not-allowed border border-stone-300">
                  สินค้าหมด (Out of Stock)
                </button>
              )}
              {BOOK.quantity === 0 && BOOK.format !== 'EBook' && (
                <button className="bg-stone-800 hover:bg-stone-900 text-white px-6 py-2.5 rounded-md font-bold text-xs transition-all shadow-sm">
                  แจ้งเตือนเมื่อมีสินค้า
                </button>
              )}
              <button
                onClick={handleToggleWishlist}
                className={`flex items-center justify-center gap-2 border px-5 py-2.5 rounded-md font-bold text-xs transition-all bg-white shadow-sm ${isWishlisted
                    ? "border-[#b46b45] text-[#b46b45]"
                    : "border-stone-300 text-stone-600 hover:text-[#b46b45] hover:border-[#b46b45]"
                  }`}
              >
                <Heart size={14} className={isWishlisted ? "fill-[#b46b45]" : ""} />
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </button>

              {BOOK.format === 'EBook' && BOOK.ebookFile && BOOK.sampleLimit && (
                <button
                  onClick={() => {
                    let url = BOOK.ebookFile;
                    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                      url = 'https://' + url;
                    }
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-6 py-2.5 rounded-md font-bold text-xs transition-all shadow-sm border border-stone-200"
                >
                  อ่านตัวอย่าง ({BOOK.sampleLimit} หน้า)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Middle Section: Quote (Synopsis) */}
        {BOOK.quote && (
          <div className="w-full py-12 mb-20 relative border-t border-stone-200/50">
            <Quote className="absolute top-4 left-0 text-[#e6dbcc] opacity-50 rotate-180" size={36} />
            <div className="px-12 z-10 relative">
              <p className={`text-xl md:text-2xl text-left text-stone-700 font-serif leading-relaxed ${isQuoteExpanded ? "" : "line-clamp-3"}`}>
                {BOOK.quote}
              </p>
              <button
                onClick={() => setIsQuoteExpanded(!isQuoteExpanded)}
                className="mt-4 text-[#b46b45] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:text-stone-800 transition-colors w-fit"
              >
                Read {isQuoteExpanded ? "less" : "more"}
                <ChevronDown size={12} className={`transform transition-transform ${isQuoteExpanded ? "rotate-180" : ""}`} />
              </button>
            </div>
            <Quote className="absolute bottom-4 right-0 text-[#e6dbcc] opacity-50" size={36} />
          </div>
        )}

        {/* Middle Section: Book Details */}
        <div className={`w-full max-w-4xl mx-auto py-12 mb-20 ${!BOOK.quote ? 'border-t border-stone-200/50' : ''}`}>
          <h2 className="text-xl font-bold text-stone-800 font-serif mb-6 tracking-tight">รายละเอียดหนังสือ (Product Details)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-stone-400 font-medium text-[10px] uppercase tracking-wider">ISBN</span>
              <span className="text-stone-800 font-semibold">{BOOK.isbn}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-stone-400 font-medium text-[10px] uppercase tracking-wider">สำนักพิมพ์ (Publisher)</span>
              <span className="text-stone-800 font-semibold">{BOOK.publisher}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-stone-400 font-medium text-[10px] uppercase tracking-wider">วันที่ตีพิมพ์ (Publication Date)</span>
              <span className="text-stone-800 font-semibold">{BOOK.publishDate}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-stone-400 font-medium text-[10px] uppercase tracking-wider">จำนวนหน้า (Pages)</span>
              <span className="text-stone-800 font-semibold">{BOOK.pages > 0 ? `${BOOK.pages} หน้า` : "-"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-stone-400 font-medium text-[10px] uppercase tracking-wider">รูปแบบ (Format)</span>
              <span className="text-stone-800 font-semibold">{BOOK.format}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-stone-400 font-medium text-[10px] uppercase tracking-wider">ภาษา (Language)</span>
              <span className="text-stone-800 font-semibold">{BOOK.language}</span>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="w-full pt-16 border-t border-stone-200/50 mb-16">
          <h2 className="text-2xl font-bold text-stone-800 font-serif tracking-tight mb-8">รีวิวจากผู้อ่าน (Customer Reviews)</h2>
          
          <div className="flex flex-col md:flex-row gap-12">
            {/* Left: Summary & Breakdown */}
            <div className="w-full md:w-1/3 shrink-0">
              {reviewStats && reviewStats.totalReviews > 0 ? (
                <>
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-5xl font-bold text-stone-800 leading-none">{reviewStats.averageRating.toFixed(1)}</span>
                    <div className="flex flex-col gap-1 pb-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            size={16} 
                            className={star <= Math.round(reviewStats.averageRating) ? "fill-[#b46b45] text-[#b46b45]" : "fill-stone-200 text-stone-200"} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-stone-500 font-medium">{reviewStats.totalReviews} reviews</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = reviewStats.ratingCounts[star as keyof typeof reviewStats.ratingCounts] || 0;
                      const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                      const isSelected = selectedRating === star;
                      
                      return (
                        <button 
                          key={star}
                          onClick={() => setSelectedRating(isSelected ? null : star)}
                          className={`flex items-center gap-3 group w-full text-left transition-opacity ${selectedRating && !isSelected ? 'opacity-40 hover:opacity-100' : ''}`}
                        >
                          <div className="flex items-center gap-1 w-10 shrink-0">
                            <span className={`text-xs font-bold ${isSelected ? 'text-[#b46b45]' : 'text-stone-600'}`}>{star}</span>
                            <Star size={10} className={isSelected ? 'fill-[#b46b45] text-[#b46b45]' : 'fill-stone-400 text-stone-400'} />
                          </div>
                          <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${isSelected ? 'bg-[#b46b45]' : 'bg-[#d2a38c] group-hover:bg-[#b46b45]'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-stone-500 w-8 text-right tabular-nums">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {selectedRating && (
                    <button 
                      onClick={() => setSelectedRating(null)}
                      className="mt-6 text-xs text-stone-500 hover:text-stone-800 border border-stone-300 hover:border-stone-400 rounded-md px-4 py-1.5 transition-colors"
                    >
                      Clear Filter
                    </button>
                  )}
                </>
              ) : (
                <div className="text-stone-500 text-sm">ยังไม่มีรีวิวสำหรับหนังสือเล่มนี้ (No reviews yet)</div>
              )}
            </div>

            {/* Right: Review List */}
            <div className="w-full md:w-2/3 flex flex-col gap-6">
              {isLoadingReviews ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b46b45]"></div>
                </div>
              ) : reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="bg-white p-5 rounded-lg shadow-sm border border-stone-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        {review.user.avatar ? (
                          <img src={review.user.avatar} alt={review.user.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#f4f1eb] flex items-center justify-center text-[#b46b45] font-bold text-sm">
                            {review.user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-sm text-stone-800">{review.user.name}</div>
                          <div className="text-[10px] text-stone-400">{new Date(review.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            size={12} 
                            className={star <= review.rating ? "fill-[#b46b45] text-[#b46b45]" : "fill-stone-200 text-stone-200"} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed font-sans">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-100 text-center flex flex-col items-center justify-center">
                  <Quote size={32} className="text-stone-200 mb-3" />
                  <p className="text-stone-500 text-sm">ไม่มีรีวิวที่ตรงกับตัวกรองของคุณ (No reviews matching your filter)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Recommendations */}
        <div className="w-full pt-16 border-t border-stone-200/50">
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
                <div className="w-full aspect-2/3 bg-[#f4f1eb] rounded-md shadow-sm mb-3 relative overflow-hidden group-hover:-translate-y-1.5 group-hover:shadow-md transition-all duration-300">
                  <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                  <div className="absolute left-0 top-0 bottom-0 w-[8%] bg-linear-to-r from-black/40 to-transparent"></div>
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

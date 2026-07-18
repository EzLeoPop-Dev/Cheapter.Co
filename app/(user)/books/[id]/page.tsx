"use client";

import { Navbar } from "@/app/components/Navbar";
import { ShoppingCart, Heart, ArrowLeft, Star, ChevronDown, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useMockStore } from "../../../admin/context/MockStoreContext";
import { useLanguage } from "../../../context/LanguageContext";

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
  const { t, lang } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const { products } = useMockStore();
  
  // Review Form States
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewFilter, setReviewFilter] = useState(0); // 0 means all stars
  
  // Accordion States
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(true);

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
      quantity: found.quantity,
      // Additional Details matching schema
      isbn: "978-3-16-148410-0",
      pages: 352,
      publishDate: "2023-10-15",
      publisher: "Vintage Classics",
      bookType: found.type === 'ebook' ? "E-Book" : "Hardcover",
      language: "English"
    };
  }, [products, params.id]);

  const filteredReviews = useMemo(() => {
    return reviewFilter === 0 ? MOCK_REVIEWS : MOCK_REVIEWS.filter(r => r.rating === reviewFilter);
  }, [reviewFilter]);

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
          <div className="flex-1 flex flex-col pt-2 lg:pt-8">
            <div className="mb-8">
              <span className="inline-block text-[#b46b45] text-[10px] font-extrabold uppercase tracking-widest mb-4">
                {MOCK_BOOK.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-stone-900 font-serif tracking-tight leading-tight mb-3">
                {MOCK_BOOK.title}
              </h1>
              <p className="text-sm font-serif italic text-stone-500 mb-6">
                {t('bookDetail.by')} <span className="font-semibold text-stone-700">{MOCK_BOOK.author}</span>
              </p>
              
              <div className="text-sm text-stone-600 leading-relaxed max-w-xl">
                <p className={`line-clamp-${isExpanded ? 'none' : '4'} transition-all duration-300`}>
                  {MOCK_BOOK.description}
                </p>
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[#b46b45] hover:text-stone-900 font-semibold text-xs tracking-wider uppercase mt-3 transition-colors"
                >
                  {isExpanded ? t('bookDetail.readLess') : t('bookDetail.readMore')}
                </button>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="mt-auto border-t border-b border-stone-200 py-6 mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="text-3xl font-bold text-stone-900">
                  {MOCK_BOOK.price}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {MOCK_BOOK.quantity > 0 ? (
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#b46b45] hover:bg-[#a05a38] text-white px-8 py-3.5 rounded-sm font-bold text-xs uppercase tracking-widest transition-colors group">
                      <ShoppingCart size={16} className="group-hover:animate-bounce-short" />
                      {t('bookDetail.addCart')}
                    </button>
                  ) : (
                    <button disabled className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-stone-200 text-stone-400 px-8 py-3.5 rounded-sm font-bold text-xs uppercase tracking-widest cursor-not-allowed">
                      {t('bookDetail.outOfStock')}
                    </button>
                  )}
                  <button className="flex items-center justify-center w-12 h-12 border border-stone-300 text-stone-400 hover:text-red-500 hover:border-red-500 rounded-sm transition-colors group" title={t('bookDetail.wishlist')}>
                    <Heart size={18} className="group-hover:fill-red-500 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section (Accordion) */}
        <div className="w-full max-w-5xl mx-auto py-8 border-t border-stone-200/50">
          <button 
            onClick={() => setIsProductDetailsOpen(!isProductDetailsOpen)}
            className="w-full flex items-center justify-between group"
          >
            <h2 className="text-2xl font-bold text-stone-900 font-serif tracking-tight group-hover:text-[#b46b45] transition-colors">{t('bookDetail.productDetails')}</h2>
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-[#fdf5e6] transition-colors">
              <ChevronDown 
                size={18} 
                className={`text-stone-500 group-hover:text-[#b46b45] transition-transform duration-300 ${isProductDetailsOpen ? "rotate-180" : ""}`} 
              />
            </div>
          </button>
          
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isProductDetailsOpen ? "max-h-[500px] opacity-100 mt-8" : "max-h-0 opacity-0 mt-0"}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-12">
              <div className="flex flex-col gap-1 border-b border-stone-100 pb-3">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t('bookDetail.isbn')}</span>
                <span className="text-sm text-stone-800 font-medium">{MOCK_BOOK.isbn}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-stone-100 pb-3">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t('bookDetail.publisher')}</span>
                <span className="text-sm text-stone-800 font-medium">{MOCK_BOOK.publisher}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-stone-100 pb-3">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t('bookDetail.publishDate')}</span>
                <span className="text-sm text-stone-800 font-medium">{new Date(MOCK_BOOK.publishDate).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-stone-100 pb-3">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t('bookDetail.pages')}</span>
                <span className="text-sm text-stone-800 font-medium">{MOCK_BOOK.pages} {t('bookDetail.pagesUnit')}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-stone-100 pb-3">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t('bookDetail.format')}</span>
                <span className="text-sm text-stone-800 font-medium">{MOCK_BOOK.bookType}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-stone-100 pb-3">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t('bookDetail.language')}</span>
                <span className="text-sm text-stone-800 font-medium">{MOCK_BOOK.language}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="w-full max-w-5xl mx-auto py-12 border-t border-stone-200/50">
          <div className="flex flex-col md:flex-row gap-12">
            
            {/* Reviews Summary & Filter */}
            <div className="w-full md:w-1/3">
              <h2 className="text-2xl font-bold text-stone-900 font-serif tracking-tight mb-2">{t('bookDetail.reviews')}</h2>
              
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={20} className={`${star <= 4 ? "fill-[#b46b45] text-[#b46b45]" : "fill-stone-200 text-stone-200"}`} />
                  ))}
                </div>
                <span className="text-xl font-bold text-stone-900">4.0</span>
              </div>
              <p className="text-xs text-stone-500 mb-8">{t('bookDetail.basedOn')} {MOCK_REVIEWS.length} {t('bookDetail.reviewsUnit')}</p>

              {/* Rating Bars (Clickable to Filter) */}
              <div className="space-y-3 relative z-10 group/filter">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = MOCK_REVIEWS.filter(r => r.rating === rating).length;
                  const percentage = Math.round((count / MOCK_REVIEWS.length) * 100);
                  const isSelected = reviewFilter === rating;
                  
                  return (
                    <button 
                      key={rating} 
                      onClick={() => setReviewFilter(isSelected ? 0 : rating)}
                      className={`w-full flex items-center gap-3 text-sm cursor-pointer group transition-all duration-200 
                        ${isSelected ? "opacity-100 scale-[1.02]" : reviewFilter !== 0 ? "opacity-40 hover:opacity-80" : "opacity-100 hover:scale-[1.02]"}`}
                    >
                      <div className="flex items-center gap-1 w-12 shrink-0">
                        <span className={`font-medium ${isSelected ? "text-stone-900" : "text-stone-600 group-hover:text-stone-900"}`}>{rating}</span>
                        <Star size={12} className={isSelected ? "fill-stone-900 text-stone-900" : "fill-stone-400 text-stone-400 group-hover:fill-stone-700 group-hover:text-stone-700"} />
                      </div>
                      
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden relative">
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#fdf5e6] opacity-50 z-0"></div>
                        )}
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ease-out relative z-10 
                            ${isSelected ? "bg-[#b46b45]" : "bg-stone-300 group-hover:bg-stone-400"}`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      
                      <div className={`w-8 text-right text-xs ${isSelected ? "font-bold text-stone-900" : "text-stone-500"}`}>
                        {percentage}%
                      </div>
                    </button>
                  );
                })}
              </div>

              {reviewFilter !== 0 && (
                <button 
                  onClick={() => setReviewFilter(0)}
                  className="mt-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-[#b46b45] transition-colors"
                >
                  {t('bookDetail.clearFilter')}
                </button>
              )}
            </div>

            {/* Review List & Form */}
            <div className="w-full md:w-2/3 md:pl-8">
              
              {/* Write Review Toggle */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-stone-200">
                <h3 className="font-serif font-bold text-stone-900">
                  {reviewFilter ? `${t('bookDetail.showingFilter')} ${reviewFilter} ${t('bookDetail.star')}` : `${MOCK_REVIEWS.length} ${t('bookDetail.reviewsUnit')}`}
                </h3>
                <button 
                  onClick={() => setIsWritingReview(!isWritingReview)}
                  className="text-xs font-bold uppercase tracking-widest bg-stone-900 text-white px-5 py-2.5 rounded-sm hover:bg-stone-800 transition-colors"
                >
                  {t('bookDetail.writeReview')}
                </button>
              </div>

              {isWritingReview && (
                <div className="bg-[#fcfaf8] p-6 rounded-md mb-8 border border-stone-200">
                  <div className="mb-4">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">{t('bookDetail.yourRating')}</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setSelectedRating(star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star 
                            size={24} 
                            className={`transition-colors ${(hoverRating || selectedRating) >= star ? "fill-[#b46b45] text-[#b46b45]" : "fill-stone-200 text-stone-200"}`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <textarea 
                      placeholder={t('bookDetail.reviewPh')}
                      className="w-full bg-white border border-stone-200 rounded-sm p-4 text-sm text-stone-700 outline-none focus:border-[#b46b45] transition-colors min-h-[120px] resize-y"
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setIsWritingReview(false)}
                      className="text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 px-4 py-2"
                    >
                      {t('bookDetail.cancel')}
                    </button>
                    <button className="text-xs font-bold uppercase tracking-widest bg-[#b46b45] text-white px-6 py-2.5 rounded-sm hover:bg-[#a05a38] transition-colors">
                      {t('bookDetail.submit')}
                    </button>
                  </div>
                </div>
              )}

              {filteredReviews.length === 0 ? (
                <div className="py-12 text-center border-t border-stone-100">
                  <p className="text-stone-400 font-serif italic mb-2">{t('bookDetail.noReviews')}</p>
                  <p className="text-xs text-stone-400">{t('bookDetail.noReviewsDesc')}</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {filteredReviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-xl border border-stone-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <img src={review.avatar} alt={review.user} className="w-10 h-10 rounded-full object-cover border border-stone-200" />
                          <div>
                            <p className="font-bold text-stone-800 text-sm">{review.user}</p>
                            <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold mt-0.5">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-[#f59e0b]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={12} fill={star <= review.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-stone-600 text-sm leading-relaxed font-sans">
                        {review.content}
                      </p>
                    </div>
                  ))}
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

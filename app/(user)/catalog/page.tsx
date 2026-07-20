"use client";

import { Navbar } from "../../components/Navbar";
import { ChevronDown, ChevronLeft, ChevronRight, Check, Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  addWishlistToApi,
  fetchWishlistFromApi,
  getWishlistBooks,
  removeWishlistFromApi,
  toggleWishlistBook,
} from "@/src/lib/wishlist";

type SortBy = "newest" | "price_asc" | "price_desc" | "title_asc" | "rating_desc";

type CatalogBook = {
  id: number;
  title: string;
  author: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  category: string | null;
  format: "Hardcover" | "EBook" | "Manga";
  quantity: number;
};

type CatalogResponse = {
  books: CatalogBook[];
  facets: {
    categories: string[];
    formats: CatalogBook["format"][];
    priceRange: {
      min: number;
      max: number;
    };
  };
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
};

const PAGE_SIZE = 12;

const SORT_OPTIONS: Array<{ value: SortBy; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "title_asc", label: "Title: A-Z" },
  { value: "rating_desc", label: "Popularity" },
];

const FORMAT_LABELS: Record<CatalogBook["format"], string> = {
  Hardcover: "Hardcover",
  EBook: "E-book",
  Manga: "Manga",
};

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "");
  const [selectedFormats, setSelectedFormats] = useState<CatalogBook["format"][]>(() => {
    const formatsParam = searchParams.get("formats");
    if (!formatsParam) return [];
    return formatsParam.split(",").filter(f => f === "Hardcover" || f === "EBook" || f === "Manga") as CatalogBook["format"][];
  });
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [books, setBooks] = useState<CatalogBook[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [formats, setFormats] = useState<CatalogBook["format"][]>([]);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchQuery = searchParams.get("q")?.trim() ?? "";

  useEffect(() => {
    let mounted = true;

    async function loadWishlist() {
      try {
        const data = await fetchWishlistFromApi();
        if (!mounted) {
          return;
        }

        if (data.authenticated) {
          setWishlistIds(new Set(data.ids));
          return;
        }
      } catch {
        // Fallback to local storage when API is unavailable.
      }

      if (!mounted) {
        return;
      }

      const currentWishlist = getWishlistBooks();
      setWishlistIds(new Set(currentWishlist.map((book) => book.id)));
    }

    loadWishlist();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedFormats, minPrice, maxPrice, sortBy, searchQuery]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalog() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        if (selectedCategory) {
          params.set("category", selectedCategory);
        }
        if (selectedFormats.length > 0) {
          params.set("formats", selectedFormats.join(","));
        }
        if (minPrice !== "") {
          params.set("minPrice", minPrice);
        }
        if (maxPrice !== "") {
          params.set("maxPrice", maxPrice);
        }
        params.set("sortBy", sortBy);
        params.set("limit", String(PAGE_SIZE));
        params.set("page", String(currentPage));
        if (searchQuery.trim()) {
          params.set("q", searchQuery.trim());
        }

        const response = await fetch(`/api/catalog?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to fetch catalog");
        }

        const data: CatalogResponse = await response.json();
        setBooks(data.books);
        setCategories(data.facets.categories);
        setFormats(data.facets.formats);
        setPriceBounds(data.facets.priceRange);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
        setCurrentPage(data.pagination.page);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }

        setError("โหลดข้อมูลแคตตาล็อกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();

    return () => {
      controller.abort();
    };
  }, [selectedCategory, selectedFormats, minPrice, maxPrice, sortBy, searchQuery, currentPage]);

  const displayProducts = useMemo(() => {
    return books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author || "Unknown Author",
      price: `฿${book.price.toLocaleString()}`,
      originalPrice: null,
      tag: book.quantity === 0 && book.format !== 'EBook' ? "Out of Stock" : null,
      imageUrl: book.imageUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
      isWide: false,
      quantity: book.quantity,
      description: book.description,
    }));
  }, [books]);

  const toggleFormat = (format: CatalogBook["format"]) => {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((item) => item !== format) : [...prev, format],
    );
  };

  const handleToggleWishlist = async (
    event: React.MouseEvent<HTMLButtonElement>,
    book: {
      id: number;
      title: string;
      author: string;
      price: string;
      imageUrl: string;
      quantity: number;
    },
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const currentlyWishlisted = wishlistIds.has(book.id);

    try {
      const data = currentlyWishlisted
        ? await removeWishlistFromApi(book.id)
        : await addWishlistToApi(book.id);

      if (data.authenticated) {
        setWishlistIds(new Set(data.ids));
        return;
      }
    } catch {
      // Fallback to local storage mode.
    }

    const result = toggleWishlistBook({
      id: book.id,
      title: book.title,
      author: book.author,
      price: Number(book.price.replace(/[^\d.]/g, "")) || 0,
      imageUrl: book.imageUrl,
      quantity: book.quantity,
    });
    setWishlistIds(new Set(result.books.map((item) => item.id)));
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
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border shadow-sm ${selectedCategory === ""
                      ? "bg-[#8b5a45] text-white border-[#8b5a45]"
                      : "bg-white text-stone-600 border-stone-200 hover:border-[#8b5a45] hover:text-[#8b5a45]"
                    }`}
                >
                  All
                </button>
                {categories.map((cat) => (
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
                {formats.map((format) => (
                  <label key={format} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shadow-sm ${selectedFormats.includes(format)
                        ? "bg-[#8b5a45] border-[#8b5a45] text-white"
                        : "bg-white border-stone-300 group-hover:border-[#8b5a45]"
                      }`} onClick={() => toggleFormat(format)}>
                      {selectedFormats.includes(format) && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span onClick={() => toggleFormat(format)} className="text-xs text-stone-700 font-medium">
                      {FORMAT_LABELS[format]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-base font-bold text-stone-800 mb-3 tracking-tight">Price Range</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder={`${priceBounds.min}`}
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    className="w-full bg-white border border-stone-200 shadow-sm rounded-md py-2 px-3 text-xs font-medium text-stone-700 outline-none focus:border-[#8b5a45]"
                  />
                  <span className="text-stone-400 text-xs">-</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder={`${priceBounds.max}`}
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    className="w-full bg-white border border-stone-200 shadow-sm rounded-md py-2 px-3 text-xs font-medium text-stone-700 outline-none focus:border-[#8b5a45]"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-stone-500 font-semibold">
                  <span>Min: ฿{priceBounds.min.toLocaleString()}</span>
                  <span>Max: ฿{priceBounds.max.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Sort by */}
            <div>
              <h3 className="text-base font-bold text-stone-800 mb-3 tracking-tight">Sort by</h3>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortBy)}
                  className="w-full appearance-none bg-white border border-stone-200 shadow-sm rounded-md py-2 pl-3 pr-8 text-xs font-medium text-stone-700 outline-none focus:border-[#8b5a45] cursor-pointer"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
              <div>
                <h1 className="text-3xl font-bold text-stone-800 tracking-tight font-serif">All Books</h1>
                <span className="text-[10px] font-bold text-stone-400 tracking-widest uppercase mb-1 block mt-1">
                  {loading ? "Loading..." : `Showing ${displayProducts.length} of ${totalCount} books`}
                </span>
                {searchQuery && (
                  <p className="text-xs text-stone-500 mt-1">
                    Search results for: <span className="font-semibold text-stone-700">{searchQuery}</span>
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {displayProducts.map((book) => (
                <Link
                  href={`/books/${book.id}`}
                  key={book.id}
                  className={`bg-[#fdfcfb] rounded-xl p-4 border border-stone-100 shadow-sm flex flex-col group cursor-pointer hover:shadow-md transition-all ${book.isWide ? 'col-span-2 md:flex-row gap-4 items-center' : ''}`}
                >
                  {/* Book Image Container */}
                  <div className={`relative shrink-0 ${book.isWide ? 'w-30 md:w-37.5' : 'w-full aspect-4/5 flex items-center justify-center bg-[#f4f1eb] rounded-lg mb-3'}`}>
                    {book.tag && (
                      <div className={`absolute -top-3 -left-2 ${book.tag === 'Out of Stock' ? 'bg-red-500' : 'bg-[#7a8c6e]'} text-white px-2 py-0.5 rounded-md font-bold text-[9px] tracking-wider shadow-sm z-20`}>
                        {book.tag}
                      </div>
                    )}
                    <div className={`${book.isWide ? 'w-full aspect-2/3' : 'w-27.5 aspect-2/3'} rounded-sm shadow-md overflow-hidden relative group-hover:-translate-y-1 transition-transform`}>
                      <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                      <div className="absolute left-0 top-0 bottom-0 w-[8%] bg-linear-to-r from-black/40 to-transparent"></div>
                      <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-white/20"></div>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className={`flex flex-col flex-1 ${book.isWide ? 'pt-2' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-stone-800 mb-1 leading-snug">{book.title}</h3>
                      <button
                        onClick={(event) => handleToggleWishlist(event, book)}
                        className="text-stone-400 hover:text-[#b46b45] transition-colors"
                        aria-label="Add to wishlist"
                      >
                        <Heart
                          size={16}
                          className={wishlistIds.has(book.id) ? "text-[#b46b45] fill-[#b46b45]" : ""}
                        />
                      </button>
                    </div>
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
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`w-8 h-8 flex items-center justify-center transition-colors ${currentPage === 1 ? "text-stone-400 cursor-not-allowed" : "text-stone-600 hover:text-stone-800"}`}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((pageNumber) => {
                  if (totalPages <= 7) {
                    return true;
                  }
                  return (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    Math.abs(pageNumber - currentPage) <= 1
                  );
                })
                .map((pageNumber, index, visiblePages) => (
                  <div key={pageNumber} className="contents">
                    {index > 0 && visiblePages[index - 1] !== pageNumber - 1 && (
                      <span className="text-stone-400 px-1">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-8 h-8 rounded-md text-sm flex items-center justify-center transition-colors shadow-sm ${
                        pageNumber === currentPage
                          ? "bg-[#8b5a45] text-white font-bold"
                          : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  </div>
                ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`w-8 h-8 flex items-center justify-center transition-colors ${currentPage === totalPages ? "text-stone-400 cursor-not-allowed" : "text-stone-600 hover:text-stone-800"}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ใช้สำหรับ Next.js App Router
import { Search, ShoppingCart, User, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

type SearchBook = {
  id: number;
  title: string;
  author: string;
  imageUrl: string | null;
};

type CatalogSearchResponse = {
  books: SearchBook[];
};

export function Navbar() {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          q: trimmedQuery,
          limit: "6",
          sortBy: "newest",
        });

        const response = await fetch(`/api/catalog?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          setResults([]);
          return;
        }

        const data: CatalogSearchResponse = await response.json();
        setResults(data.books ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const showDropdown = useMemo(
    () => isOpen && query.trim().length >= 1,
    [isOpen, query]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      router.push("/catalog");
      return;
    }
    router.push(`/catalog?q=${encodeURIComponent(trimmedQuery)}`);
    setIsOpen(false);
  };

  return (
    <nav className="w-full flex items-center justify-between py-6 px-8 max-w-7xl mx-auto font-sans text-stone-800">
      <Link href="/" className="font-serif text-3xl font-semibold tracking-tight text-amber-900">
        Cheapter.Co
      </Link>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link href="/catalog" className="relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-amber-900 text-amber-900">
          {t('nav.catalog')}
        </Link>
        <Link href="/catalog?filter=new" className="hover:text-amber-900 transition-colors">
          {t('nav.newArrivals')}
        </Link>
        <Link href="/" className="hover:text-amber-900 transition-colors">
          {t('nav.editorial')}
        </Link>
        <Link href="/" className="hover:text-amber-900 transition-colors">
          {t('nav.about')}
        </Link>
      </div>
      
      <div className="flex items-center gap-6">
        <form
          onSubmit={handleSubmit}
          className="hidden lg:flex items-center text-sm text-stone-500 bg-transparent border-b border-stone-300 pb-1 w-48 focus-within:border-amber-900 transition-colors relative"
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              setTimeout(() => setIsOpen(false), 150);
            }}
            placeholder={t('nav.searchPh')}
            className="bg-transparent outline-none w-full placeholder:text-stone-400 text-stone-800"
          />
          <button type="submit" aria-label="Search catalog" className="text-stone-400 hover:text-amber-900 transition-colors">
            <Search size={16} />
          </button>

          {showDropdown && (
            <div className="absolute top-full mt-2 left-0 w-80 bg-white border border-stone-200 rounded-md shadow-lg overflow-hidden z-40">
              {loading && (
                <div className="px-3 py-2 text-xs text-stone-500">Searching...</div>
              )}

              {!loading && results.length === 0 && (
                <div className="px-3 py-2 text-xs text-stone-500">No books found</div>
              )}

              {!loading && results.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-stone-50 transition-colors"
                >
                  <img
                    src={book.imageUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80"}
                    alt={book.title}
                    className="w-8 h-10 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-stone-800 font-semibold truncate">{book.title}</p>
                    <p className="text-[11px] text-stone-500 truncate">{book.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </form>
        
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative text-amber-900 hover:opacity-80 transition-opacity block">
            <ShoppingCart size={20} />
            <span className="absolute -top-1.5 -right-1.5 bg-green-700 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              2
            </span>
          </Link>
          <Link href="/profile" className="text-amber-900 hover:opacity-80 transition-opacity block">
            <User size={20} />
          </Link>
          
          <div className="h-6 w-px bg-stone-300 mx-2"></div>
          
          <button 
            onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-amber-900 transition-colors"
          >
            <Globe size={16} />
            {lang}
          </button>
        </div>
      </div>
    </nav>
  );
}
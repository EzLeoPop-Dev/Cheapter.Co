"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { 
  Search, 
  ShoppingCart, 
  User, 
  Globe, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  Loader2,
  LayoutGrid
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { signOut, useSession } from "next-auth/react";
import { CategoryWheelModal } from "./CategoryWheelModal";

// --- Types สำหรับระบบ Search ---
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { lang, setLang, t } = useLanguage();
  
  // --- State สำหรับระบบ Search ---
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // --- State สำหรับระบบ Auth & Dropdown ---
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- State สำหรับจำนวนสินค้าในตะกร้า ---
  const [cartCount, setCartCount] = useState(0);
  
  // --- State สำหรับติดตามการ Scroll ---
  const [isScrolled, setIsScrolled] = useState(false);
  
  // --- State สำหรับ Category Wheel ---
  const [isCategoryWheelOpen, setIsCategoryWheelOpen] = useState(false);
  
  // --- State สำหรับระบบ Search (Expandable) ---
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // เช็คสิทธิ์ว่าเป็น Admin หรือ Staff
  const isAdminOrStaff = session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";

  // --- Effect สำหรับปิด Dropdown Profile เมื่อคลิกที่อื่น ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Effect สำหรับดึงจำนวนสินค้าในตะกร้า ---
  useEffect(() => {
    if (status !== "authenticated") {
      setCartCount(0);
      return;
    }
    const fetchCart = async () => {
      try {
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const total = (data.items ?? []).reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0
        );
        setCartCount(total);
      } catch {
        // ไม่ทำอะไรถ้า fetch ล้มเหลว
      }
    };
    fetchCart();
  }, [status]);

  // --- Effect สำหรับระบบดึงข้อมูล Search API ---
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

  // ซ่อน/โชว์ Dropdown ของช่องค้นหา
  const showDropdown = useMemo(
    () => isOpen && query.trim().length >= 1,
    [isOpen, query]
  );

  // กด Enter เพื่อค้นหา
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

  // กดปุ่ม Logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <header 
      className={`w-full sticky z-50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex justify-center ${
        isScrolled ? "top-0 px-0" : "top-4 px-4 sm:px-8"
      }`}
    >
      <nav 
        className={`w-full bg-[#faf8f4]/95 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isScrolled 
            ? "max-w-full rounded-none border-b border-stone-200/50 shadow-md" 
            : "max-w-[1600px] rounded-full border border-stone-200/60 shadow-sm"
        }`}
      >
        <div className={`w-full flex items-center justify-between mx-auto font-sans text-stone-800 transition-all duration-500 max-w-[1600px] ${isScrolled ? "py-3 px-8 sm:px-12" : "py-3 px-10 sm:px-16"}`}>
      {/* โลโก้ */}
      <Link href="/" className="font-serif text-3xl font-semibold tracking-tight text-amber-900">
        Cheapter.Co
      </Link>
      
      {/* เมนูตรงกลาง (รองรับแปลภาษา) */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link 
          href="/" 
          className={pathname === "/" ? "relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-amber-900 text-amber-900" : "hover:text-amber-900 transition-colors text-stone-600"}
        >
          {lang === 'th' ? 'หน้าหลัก' : 'Home'}
        </Link>

        <Link 
          href="/catalog" 
          className={pathname?.startsWith("/catalog") && searchParams?.get("formats") !== "EBook" ? "relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-amber-900 text-amber-900" : "hover:text-amber-900 transition-colors text-stone-600"}
        >
          {t('nav.catalog')}
        </Link>
        <Link 
          href="/book-packs" 
          className={pathname?.startsWith("/book-packs") ? "relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-amber-900 text-amber-900" : "hover:text-amber-900 transition-colors text-stone-600"}
        >
          {t('nav.bookPack')}
        </Link>
        <Link 
          href="/editorial" 
          className={pathname?.startsWith("/editorial") ? "relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-amber-900 text-amber-900" : "hover:text-amber-900 transition-colors text-stone-600"}
        >
          {t('nav.editorial')}
        </Link>
        <Link 
          href="/catalog?formats=EBook" 
          className={pathname === "/catalog" && searchParams?.get("formats") === "EBook" ? "relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-amber-900 text-amber-900" : "hover:text-amber-900 transition-colors text-stone-600"}
        >
          {t('nav.ebooks')}
        </Link>
      </div>
      
      <div className="flex items-center gap-6">
        {/* ปุ่มหมวดหมู่ (Icon) */}
        <button 
          onClick={() => setIsCategoryWheelOpen(true)}
          className="text-stone-400 hover:text-amber-900 transition-colors focus:outline-none flex-shrink-0"
          aria-label="Categories"
          title={lang === 'th' ? 'หมวดหมู่' : 'Categories'}
        >
          <LayoutGrid size={20} />
        </button>

        {/* ช่องค้นหา */}
        <form
          onSubmit={handleSubmit}
          className={`hidden lg:flex items-center text-sm text-stone-500 bg-transparent transition-all duration-300 relative ${
            isSearchExpanded ? "border-b border-stone-300 pb-1 w-56 focus-within:border-amber-900" : "w-5 justify-end"
          }`}
        >
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              setTimeout(() => {
                setIsOpen(false);
                if (!query.trim()) {
                  setIsSearchExpanded(false);
                }
              }, 200);
            }}
            placeholder={t('nav.searchPh')}
            className={`bg-transparent outline-none placeholder:text-stone-400 text-stone-800 transition-all duration-300 ${
              isSearchExpanded ? "w-full opacity-100" : "w-0 opacity-0"
            }`}
          />
          <button 
            type={isSearchExpanded && query.trim() ? "submit" : "button"} 
            onClick={(e) => {
              if (!isSearchExpanded) {
                e.preventDefault();
                setIsSearchExpanded(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }
            }}
            aria-label="Search catalog" 
            className="text-stone-400 hover:text-amber-900 transition-colors flex-shrink-0 cursor-pointer block"
          >
            <Search size={20} />
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
        
        {/* เมนูด้านขวา (Cart, Profile/Auth, Language) */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative text-amber-900 hover:opacity-80 transition-opacity block">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-green-700 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* เช็คสถานะล็อกอิน */}
          {status === "loading" ? (
            <div className="w-8 h-8 flex items-center justify-center ml-2">
              <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
            </div>
          ) : session?.user ? (
            <div className="relative ml-2" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-amber-900 hover:opacity-80 transition-opacity block focus:outline-none"
              >
                <User size={20} />
              </button>

              {/* Dropdown Menu เมื่อล็อกอินแล้ว */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-100 py-2 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                  
                  <div className="px-4 py-3 border-b border-stone-100 mb-1">
                    <p className="text-sm font-semibold text-stone-800 truncate">
                      {session.user.name || "ผู้ใช้งาน"}
                    </p>
                    <p className="text-xs text-stone-500 truncate mt-0.5">
                      {session.user.email}
                    </p>
                  </div>

                  {isAdminOrStaff && (
                    <Link 
                      href="/admin/dashboard" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:text-amber-900 hover:bg-stone-50 transition-colors"
                    >
                      <LayoutDashboard size={16} />
                      จัดการระบบหลังบ้าน
                    </Link>
                  )}

                  <Link 
                    href="/profile" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:text-amber-900 hover:bg-stone-50 transition-colors"
                  >
                    <Settings size={16} />
                    การตั้งค่าบัญชี
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={16} />
                    ล็อคเอาท์
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/auth/login" 
              className="ml-2 px-5 py-2 text-sm font-semibold text-white bg-amber-900 hover:bg-amber-800 rounded-full transition-colors shadow-sm"
            >
              Sign in
            </Link>
          )}
          
          <div className="h-6 w-px bg-stone-300 mx-2"></div>
          
          {/* เปลี่ยนภาษา */}
          <button 
            onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-amber-900 transition-colors"
          >
            <Globe size={16} />
            {lang}
          </button>
        </div>
      </div>
      </div>
      </nav>

      {/* Category Wheel Modal */}
      <CategoryWheelModal 
        isOpen={isCategoryWheelOpen} 
        onClose={() => setIsCategoryWheelOpen(false)} 
      />
    </header>
  );
}
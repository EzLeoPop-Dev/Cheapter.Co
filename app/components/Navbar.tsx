"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ShoppingCart, 
  User, 
  Globe, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  Loader2 
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { signOut, useSession } from "next-auth/react";

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
    <nav className="w-full flex items-center justify-between py-6 px-8 max-w-7xl mx-auto font-sans text-stone-800">
      {/* โลโก้ */}
      <Link href="/" className="font-serif text-3xl font-semibold tracking-tight text-amber-900">
        Cheapter.Co
      </Link>
      
      {/* เมนูตรงกลาง (รองรับแปลภาษา) */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link href="/catalog" className="relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-amber-900 text-amber-900">
          {t('nav.catalog')}
        </Link>
        <Link href="/book-packs" className="hover:text-amber-900 transition-colors">
          {t('nav.bookPack')}
        </Link>
        <Link href="/" className="hover:text-amber-900 transition-colors">
          {t('nav.editorial')}
        </Link>
        <Link href="/catalog?formats=EBook" className="hover:text-amber-900 transition-colors">
          {t('nav.ebooks')}
        </Link>
      </div>
      
      <div className="flex items-center gap-6">
        {/* ช่องค้นหา */}
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
    </nav>
  );
}
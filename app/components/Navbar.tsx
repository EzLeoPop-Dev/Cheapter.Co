"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export function Navbar() {
  const { lang, setLang, t } = useLanguage();

  return (
    <nav className="w-full flex items-center justify-between py-6 px-8 max-w-7xl mx-auto font-sans text-stone-800">
      <Link href="/" className="font-serif text-3xl font-semibold tracking-tight text-amber-900">
        Cheapter.Co
      </Link>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link href="/catalog" className="relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-amber-900 text-amber-900">{t('nav.catalog')}</Link>
        <Link href="/catalog?filter=new" className="hover:text-amber-900 transition-colors">{t('nav.newArrivals')}</Link>
        <Link href="/" className="hover:text-amber-900 transition-colors">{t('nav.editorial')}</Link>
        <Link href="/" className="hover:text-amber-900 transition-colors">{t('nav.about')}</Link>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center text-sm text-stone-500 bg-transparent border-b border-stone-300 pb-1 w-48 focus-within:border-amber-900 transition-colors">
          <input 
            type="text" 
            placeholder={t('nav.searchPh')} 
            className="bg-transparent outline-none w-full placeholder:text-stone-400 text-stone-800"
          />
          <Search size={16} className="text-stone-400" />
        </div>
        
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

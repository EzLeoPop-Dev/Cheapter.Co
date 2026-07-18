"use client";

import { motion } from "framer-motion";
import { Navbar } from "./components/Navbar";
import { HeroImage } from "./components/HeroImage";
import { CategoryNav } from "./components/CategoryNav";
import { DiscountMarquee } from "./components/DiscountMarquee";
import { RecommendedSection, BestSellersSection, StaffPicksSection } from "./components/BookSections";
import { PromotionSection } from "./components/PromotionSection";
import { FlyingBooks } from "./components/FlyingBooks";
import { useLanguage } from "./context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col font-sans text-stone-800 overflow-hidden relative">
      <Navbar />

      {/* Flying Books Parallax Background */}
      <FlyingBooks />

      {/* Promo Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-[#e6dbcc] text-center py-2 text-xs font-semibold tracking-wider text-amber-900"
      >
        {t('home.promoBanner')}
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        
        {/* Text Section */}
        <div className="flex flex-col gap-8 z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-[72px] leading-[1.1] font-bold text-stone-900 tracking-tight"
          >
            {t('home.heroTitle1')}<br />
            {t('home.heroTitle2')} <span className="font-serif italic text-amber-800/90 font-medium">{t('home.heroTitle3')}</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-stone-500 max-w-md leading-relaxed"
          >
            {t('home.heroSubtitle')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4 pt-4"
          >
            <button className="bg-[#8b5a45] hover:bg-[#724a38] text-white px-8 py-4 text-sm font-bold tracking-wider rounded-md transition-all shadow-md hover:shadow-lg">
              {t('home.btnExplore')}
            </button>
            <button className="bg-transparent hover:bg-stone-200/50 text-[#8b5a45] border border-stone-200 px-8 py-4 text-sm font-bold tracking-wider rounded-md transition-all">
              {t('home.btnEditorial')}
            </button>
          </motion.div>
        </div>

        {/* Image / 3D Section */}
        <HeroImage />

      </main>

      {/* Marquee Section */}
      <DiscountMarquee />

      {/* Categories Section */}
      <CategoryNav />


      {/* Recommended Section */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <RecommendedSection />
      </motion.div>
      
      {/* Promotion Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <PromotionSection />
      </motion.div>

      {/* Best Sellers Section */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <BestSellersSection />
      </motion.div>

      {/* Staff Picks Section */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <StaffPicksSection />
      </motion.div>

      {/* Background decoration */}
      <div 
        className="fixed top-0 left-0 w-full h-full pointer-events-none -z-20"
        style={{
          backgroundSize: "32px 32px",
          backgroundImage: `
            linear-gradient(to right, rgba(139, 90, 69, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(139, 90, 69, 0.15) 1px, transparent 1px)
          `
        }}
      />
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#e6dbcc]/40 via-transparent to-transparent opacity-80" />
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Navbar } from "./components/Navbar";
import { HeroImage } from "./components/HeroImage";
import { CategoryNav } from "./components/CategoryNav";
import { DiscountMarquee } from "./components/DiscountMarquee";
import { RecommendedSection, BestSellersSection, StaffPicksSection } from "./components/BookSections";
import { PromotionSection } from "./components/PromotionSection";
export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col font-sans text-stone-800 overflow-hidden">
      <Navbar />

      {/* Promo Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-[#e6dbcc] text-center py-2 text-xs font-semibold tracking-wider text-amber-900"
      >
        Free shipping on orders over $100
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
            Find the stories<br />
            that <span className="font-serif italic text-amber-800/90 font-medium">live and breathe.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-stone-500 max-w-md leading-relaxed"
          >
            Curated literature for the wandering mind. Discover our latest collection of tactile, meaningful reads selected by independent booksellers.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4 pt-4"
          >
            <button className="bg-[#8b5a45] hover:bg-[#724a38] text-white px-8 py-4 text-sm font-bold tracking-wider rounded-md transition-all shadow-md hover:shadow-lg">
              Explore Catalog
            </button>
            <button className="bg-transparent hover:bg-stone-200/50 text-[#8b5a45] border border-stone-200 px-8 py-4 text-sm font-bold tracking-wider rounded-md transition-all">
              Read the Editorial
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
      <RecommendedSection />
      
      {/* Promotion Section */}
      <PromotionSection />

      {/* Best Sellers Section */}
      <BestSellersSection />

      {/* Staff Picks Section */}
      <StaffPicksSection />

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

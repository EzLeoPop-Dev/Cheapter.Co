"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

export function CategoryWheelModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      setLoading(true);
      fetch("/api/categories")
        .then(res => res.json())
        .then(data => {
          if (data.categories) {
            setCategories(data.categories);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // We want to be able to fit the wheel on smaller screens too.
  // Using a responsive radius based on window width or just a fixed smaller one for mobile.
  const [windowWidth, setWindowWidth] = useState(1024);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const radius = windowWidth < 640 ? 140 : windowWidth < 1024 ? 200 : 260;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Close button */}
          <button 
            className="absolute top-6 right-6 md:top-10 md:right-10 text-stone-300 hover:text-white transition-colors bg-stone-800/50 hover:bg-stone-800 p-3 rounded-full z-50"
            onClick={onClose}
          >
            <X size={24} />
          </button>

          <div 
            className="relative w-full h-full max-w-4xl max-h-[800px] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Center Header */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="absolute z-10 flex flex-col items-center"
            >
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-amber-900 bg-white/95 px-6 py-4 md:px-8 md:py-5 rounded-full shadow-xl border border-amber-900/10 backdrop-blur-xl">
                ค้นพบหมวดหมู่หนังสือ
              </h2>
            </motion.div>

            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            ) : (
              categories.map((cat, index) => {
                const angle = (360 / categories.length) * index;
                // Offset by -90 degrees so the first item starts at 12 o'clock
                const rad = (angle - 90) * (Math.PI / 180);
                const x = radius * Math.cos(rad);
                const y = radius * Math.sin(rad);

                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                    animate={{ opacity: 1, x, y, scale: 1 }}
                    exit={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 250, 
                      damping: 20, 
                      delay: index * 0.05 
                    }}
                    className="absolute"
                  >
                    <Link
                      href={`/catalog?category=${encodeURIComponent(cat.name)}`}
                      onClick={onClose}
                      className="flex items-center justify-center px-4 py-2 md:px-6 md:py-3 bg-white/95 hover:bg-[#8b5a45] text-stone-700 hover:text-white font-medium text-sm md:text-base rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.15)] border border-stone-200/50 backdrop-blur-xl transition-all duration-300 hover:scale-110 whitespace-nowrap"
                    >
                      {cat.name}
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

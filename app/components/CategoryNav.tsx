"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, Briefcase, Drama, Baby, Palette, PenTool, Sprout, ChevronLeft, ChevronRight } from "lucide-react";

const iconMap: Record<string, any> = {
  "นิยาย": Drama,
  "สารคดี": BookOpen,
  "พัฒนาตนเอง": Sprout,
  "หนังสือเด็ก": Baby,
  "การ์ตูน": Palette,
  "ธุรกิจ": Briefcase,
  "บทกวี": PenTool,
};

export function CategoryNav({ categories = [] }: { categories?: { id: number | string; name: string }[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let direction = 1;
    const speed = 15; // pixels per second

    const scroll = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      if (!isPaused && scrollRef.current) {
        const el = scrollRef.current;
        const maxScroll = el.scrollWidth - el.clientWidth;
        
        if (maxScroll > 0) {
          el.scrollLeft += (direction * speed * deltaTime) / 1000;
          
          if (el.scrollLeft >= maxScroll - 1) {
            direction = -1;
          } else if (el.scrollLeft <= 0) {
            direction = 1;
          }
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-8 pb-16">
      <div className="w-full h-px bg-stone-200 mb-12"></div>
      
      <div className="relative group flex items-center">
        <button
          onClick={scrollLeft}
          className="absolute -left-4 z-10 w-8 h-8 flex items-center justify-center bg-white border border-stone-200 rounded-full shadow-sm text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-50 hover:text-stone-900"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          ref={scrollRef}
          className="flex items-center gap-4 overflow-x-auto w-fit max-w-full mx-auto [&::-webkit-scrollbar]:hidden py-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {categories.map((category) => {
            const Icon = iconMap[category.name] || BookOpen;
            return (
              <Link
                key={category.id}
                href={`/catalog?category=${encodeURIComponent(category.name)}`}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 bg-white hover:bg-stone-100 hover:border-stone-400 transition-all text-sm font-medium"
              >
                <span>{category.name}</span>
                <Icon size={16} className="text-stone-500" strokeWidth={1.5} />
              </Link>
            );
          })}
        </div>

        <button
          onClick={scrollRight}
          className="absolute -right-4 z-10 w-8 h-8 flex items-center justify-center bg-white border border-stone-200 rounded-full shadow-sm text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-50 hover:text-stone-900"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}

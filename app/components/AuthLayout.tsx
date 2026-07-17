"use client";


import Link from "next/link";
import { BookOpen } from "lucide-react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col font-sans text-stone-800 overflow-hidden relative justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
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

      {/* Top Navbar for Auth - Minimal */}
      <div className="absolute top-0 w-full p-8 flex justify-between items-center z-10">
        <Link href="/" className="flex items-center gap-2 group">
            <BookOpen className="w-6 h-6 text-[#8b5a45] group-hover:text-stone-900 transition-colors" />
            <span className="font-serif font-bold text-xl tracking-tight text-stone-900 group-hover:text-[#8b5a45] transition-colors">
                Cheapter.Co
            </span>
        </Link>
        <Link href="/" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
          Back to store
        </Link>
      </div>

      {/* Children Container (No built-in card anymore so the page can handle 3D flips) */}
      <div className="z-10 w-full flex justify-center perspective-1000" style={{ perspective: "1500px" }}>
        {children}
      </div>
    </div>
  );
}

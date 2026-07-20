"use client";

import { motion } from "framer-motion";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-stone-100 ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg]"
        animate={{ x: ["-150%", "250%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export default function CatalogLoading() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8"
    >
      {/* Title & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <Skeleton className="w-40 h-8 rounded-lg" />
        <div className="flex gap-4 w-full md:w-auto">
          <Skeleton className="w-28 h-8 rounded-md" />
          <Skeleton className="w-28 h-8 rounded-md" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((card) => (
          <div key={card} className="flex flex-col space-y-2">
            <Skeleton className="w-[90%] aspect-[2/3] rounded-xl shadow-sm mx-auto" />
            <Skeleton className="w-2/3 h-3 rounded-md mt-2 mx-auto" />
            <Skeleton className="w-[85%] h-3 rounded-md mx-auto" />
            <Skeleton className="w-1/3 h-4 rounded-md mt-1 mx-auto" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

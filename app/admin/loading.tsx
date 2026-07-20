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

export default function AdminLoading() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="w-full p-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="w-48 h-8 rounded-lg" />
        <Skeleton className="w-24 h-8 rounded-lg" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((card) => (
          <div key={card} className="w-full h-28 bg-white rounded-xl border border-stone-200 p-5 flex flex-col justify-between">
            <Skeleton className="w-1/2 h-3 rounded-md" />
            <Skeleton className="w-2/3 h-6 rounded-md" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="w-full bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="w-full h-10 border-b border-stone-200 px-6 flex items-center">
          <Skeleton className="w-1/4 h-3 rounded-md" />
        </div>
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="w-full h-14 border-b border-stone-200 px-6 flex items-center justify-between">
            <Skeleton className="w-[20%] h-3 rounded-md" />
            <Skeleton className="w-[20%] h-3 rounded-md" />
            <Skeleton className="w-[15%] h-3 rounded-md" />
            <Skeleton className="w-10 h-6 rounded-md" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

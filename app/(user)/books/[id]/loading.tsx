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

export default function BookDetailLoading() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-12"
    >
      <div className="flex flex-col md:flex-row gap-12">
        {/* Left Column (Image) */}
        <div className="w-full md:w-1/3 xl:w-1/4">
          <Skeleton className="w-[90%] aspect-[2/3] rounded-2xl shadow-md mx-auto md:mx-0" />
        </div>

        {/* Right Column (Details) */}
        <div className="w-full md:w-2/3 xl:w-3/4 flex flex-col space-y-5">
          <Skeleton className="w-2/3 h-10 rounded-lg" />
          <Skeleton className="w-1/4 h-5 rounded-md" />
          
          <div className="h-px w-full bg-stone-100 my-4"></div>

          <Skeleton className="w-1/5 h-8 rounded-lg" />
          
          <div className="space-y-3 mt-4">
            <Skeleton className="w-[90%] h-3 rounded-md" />
            <Skeleton className="w-[85%] h-3 rounded-md" />
            <Skeleton className="w-3/4 h-3 rounded-md" />
            <Skeleton className="w-1/2 h-3 rounded-md" />
          </div>

          <div className="flex gap-4 mt-8">
            <Skeleton className="w-28 h-10 rounded-full" />
            <Skeleton className="w-40 h-10 rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

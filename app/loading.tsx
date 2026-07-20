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

export default function Loading() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8"
    >
      {/* Hero Skeleton */}
      <Skeleton className="w-full h-[300px] md:h-[400px] rounded-3xl mb-12 shadow-sm" />
      
      {/* Category Nav Skeleton */}
      <div className="flex gap-4 overflow-hidden mb-12 justify-center">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="w-20 h-8 rounded-full flex-shrink-0" />
        ))}
      </div>

      {/* Sections Skeleton */}
      <div className="space-y-16">
        {[1, 2].map((section) => (
          <div key={section}>
            <Skeleton className="w-32 h-6 rounded-lg mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map((card) => (
                <div key={card} className="flex flex-col space-y-2">
                  <Skeleton className="w-[90%] aspect-[2/3] rounded-xl shadow-sm mx-auto" />
                  <Skeleton className="w-2/3 h-3 rounded-md mt-2 mx-auto" />
                  <Skeleton className="w-1/3 h-3 rounded-md mx-auto" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

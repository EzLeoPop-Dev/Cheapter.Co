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

export default function ProfileLoading() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="space-y-8 w-full"
    >
      {/* ข้อมูลส่วนตัว Card Skeleton */}
      <div className="bg-[#fefdfb] rounded-2xl p-8 shadow-sm">
        <Skeleton className="w-32 h-6 rounded-md mb-6" />
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="w-28 h-28 rounded-full" />
            <Skeleton className="w-24 h-3 rounded-md" />
          </div>

          {/* Profile Form */}
          <div className="flex-1 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Skeleton className="w-20 h-3 rounded-md" />
                <Skeleton className="w-full h-10 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-20 h-3 rounded-md" />
                <Skeleton className="w-full h-10 rounded-lg" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Skeleton className="w-20 h-3 rounded-md" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>

            <div className="flex justify-end pt-4">
              <Skeleton className="w-28 h-10 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* ที่อยู่สำหรับจัดส่ง Section Skeleton */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="w-32 h-6 rounded-md" />
          <Skeleton className="w-24 h-4 rounded-md" />
        </div>

        {/* รายการที่อยู่ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((addr) => (
            <div key={addr} className="bg-[#fefdfb] rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-[180px]">
              <div className="flex justify-between items-start mb-3">
                <Skeleton className="w-16 h-5 rounded-full" />
              </div>
              <Skeleton className="w-24 h-4 rounded-md mb-3" />
              <Skeleton className="w-1/2 h-3 rounded-md mb-2" />
              <Skeleton className="w-2/3 h-3 rounded-md mb-2" />
              <Skeleton className="w-1/3 h-3 rounded-md mb-4" />
              
              <div className="mt-auto pt-3 border-t border-gray-50">
                <Skeleton className="w-1/4 h-3 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

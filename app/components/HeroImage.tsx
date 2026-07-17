"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MouseEvent } from "react";

export function HeroImage() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none flex justify-center lg:justify-end mt-12 lg:mt-0 perspective-1000">
      <motion.div
        initial={{ opacity: 0, y: 50, rotateY: 15, rotateX: 5 }}
        animate={{ opacity: 1, y: 0, rotateY: -5, rotateX: 2 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative bg-stone-100 rounded-xl shadow-2xl p-4 md:p-6 w-full sm:w-[450px] aspect-[4/3] flex items-center justify-center border border-stone-200"
      >
        {/* Placeholder for the website UI within the tablet/book */}
        <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden flex flex-col relative">
          {/* Header Mock */}
          <div className="w-full h-8 bg-stone-50 border-b border-stone-100 flex items-center px-4 justify-between">
            <div className="text-[8px] font-serif text-amber-900 font-bold">Paperbound</div>
            <div className="flex gap-2">
              <div className="w-4 h-1 bg-stone-200 rounded-full"></div>
              <div className="w-4 h-1 bg-stone-200 rounded-full"></div>
              <div className="w-4 h-1 bg-stone-200 rounded-full"></div>
            </div>
          </div>
          
          {/* Body Mock */}
          <div className="flex-1 bg-stone-50 p-6 flex justify-center items-center relative overflow-hidden">
            {/* Main Book Mockup inside the device */}
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="bg-[#f0ece1] w-[200px] h-[280px] shadow-xl rounded-r-md border-l-4 border-stone-300 relative overflow-hidden flex flex-col items-center pt-8 px-4"
            >
              <h3 className="font-serif text-lg tracking-widest text-center text-stone-800 mb-1">THE SILENT<br/>FOREST</h3>
              <p className="text-[8px] tracking-widest text-stone-500 mb-6">KENJI SATO</p>
              
              {/* Abstract tree illustration */}
              <div className="flex-1 w-full bg-gradient-to-t from-green-900/80 via-green-800/40 to-transparent rounded-t-[40px] opacity-80" />
            </motion.div>
          </div>
        </div>

        {/* Floating Price Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ scale: 0.92 }}
          className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md px-6 py-4 rounded-xl shadow-xl border border-white/40 cursor-pointer z-20"
        >
          <div className="font-sans font-medium text-stone-800 mb-1" style={{ transform: "translateZ(30px)" }}>The Silent Forest</div>
          <div className="font-serif italic text-stone-500 text-sm mb-2" style={{ transform: "translateZ(20px)" }}>K. Sato</div>
          <div className="font-sans font-bold text-amber-900" style={{ transform: "translateZ(40px)" }}>$45B</div>
        </motion.div>

        {/* New Arrival Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          className="absolute -top-4 -right-4 bg-[#5c6b4b] text-white text-xs font-bold px-4 py-2 rounded-full tracking-wider shadow-lg"
        >
          NEW ARRIVAL
        </motion.div>
      </motion.div>
    </div>
  );
}

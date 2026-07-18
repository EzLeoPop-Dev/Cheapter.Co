"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export function FlyingBooks() {
  const { scrollYProgress } = useScroll();

  // We map the scroll progress (0 to 1) to different X, Y, and Rotation values for each book
  // Book 1: Flies from left to right, slowly downwards
  const x1 = useTransform(scrollYProgress, [0, 1], ["-20vw", "120vw"]);
  const y1 = useTransform(scrollYProgress, [0, 1], ["10vh", "80vh"]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [-30, 180]);

  // Book 2: Flies from right to left, upwards
  const x2 = useTransform(scrollYProgress, [0, 1], ["120vw", "-20vw"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["70vh", "15vh"]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [45, -120]);

  // Book 3: Slower, from left to right, steep angle up
  const x3 = useTransform(scrollYProgress, [0, 1], ["-10vw", "110vw"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["90vh", "30vh"]);
  const rotate3 = useTransform(scrollYProgress, [0, 1], [-15, 90]);

  // Book 4: Fast, right to left across the middle
  const x4 = useTransform(scrollYProgress, [0, 1], ["110vw", "-30vw"]);
  const y4 = useTransform(scrollYProgress, [0, 1], ["40vh", "50vh"]);
  const rotate4 = useTransform(scrollYProgress, [0, 1], [90, -90]);

  const books = [
    { x: x1, y: y1, rotate: rotate1, src: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80", size: "w-24 md:w-32", zIndex: 10, opacity: 0.6, blur: "blur(3px)" },
    { x: x2, y: y2, rotate: rotate2, src: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&q=80", size: "w-32 md:w-48", zIndex: 0, opacity: 0.4, blur: "blur(6px)" },
    { x: x3, y: y3, rotate: rotate3, src: "https://images.unsplash.com/photo-1626618012641-bfbca5a5d239?w=200&q=80", size: "w-20 md:w-28", zIndex: 20, opacity: 0.7, blur: "blur(2px)" },
    { x: x4, y: y4, rotate: rotate4, src: "https://images.unsplash.com/photo-1476275466078-4007374efac4?w=200&q=80", size: "w-28 md:w-36", zIndex: 5, opacity: 0.5, blur: "blur(4px)" },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {books.map((book, i) => (
        <motion.div
          key={i}
          className={`absolute ${book.size} aspect-[3/4] rounded shadow-2xl bg-white p-1`}
          style={{
            x: book.x,
            y: book.y,
            rotate: book.rotate,
            opacity: book.opacity,
            filter: book.blur,
            zIndex: book.zIndex,
          }}
        >
          <div className="w-full h-full relative rounded-sm overflow-hidden">
            <img src={book.src} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-stone-900/10"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

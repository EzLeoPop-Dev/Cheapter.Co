import { motion } from "framer-motion";

export const PromotionSection = () => {
  return (
    <section className="w-full py-4 px-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="bg-[#8b5a45] rounded-lg overflow-hidden relative shadow-md flex flex-col sm:flex-row items-center justify-between p-4 sm:px-8"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        
        <div className="z-10 text-white flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold tracking-wider uppercase">
            Sale
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif italic m-0">
              Summer Reading Sale - Up to 40% Off
            </h2>
            <p className="text-white/80 text-sm m-0">
              Stock up on your next adventures before the season ends.
            </p>
          </div>
        </div>
        
        <button className="mt-4 sm:mt-0 z-10 bg-white text-[#8b5a45] hover:bg-stone-100 px-6 py-2 text-xs font-bold tracking-wider rounded transition-all shadow-sm shrink-0">
          Shop Now
        </button>
      </motion.div>
    </section>
  );
};

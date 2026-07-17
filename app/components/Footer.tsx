import { Mail } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#f4f1eb] border-t border-[#e6dbcc] pt-16 pb-8 mt-auto relative z-20">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="font-serif italic text-3xl text-stone-800 mb-4 tracking-tight">Cheapter.</h2>
            <p className="text-sm text-stone-600 leading-relaxed font-sans mb-6 pr-4">
              A curated collection of books exploring space, light, design, and beyond. Discover your next great read.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-stone-400 hover:text-[#b46b45] transition-colors" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="text-stone-400 hover:text-[#b46b45] transition-colors" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="text-stone-400 hover:text-[#b46b45] transition-colors" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-sans font-bold text-stone-800 mb-5 text-sm uppercase tracking-wider">Shop</h3>
            <ul className="flex flex-col gap-3 text-sm text-stone-600">
              <li><Link href="#" className="hover:text-[#b46b45] transition-colors">Best Sellers</Link></li>
              <li><Link href="#" className="hover:text-[#b46b45] transition-colors">New Arrivals</Link></li>
              <li><Link href="#" className="hover:text-[#b46b45] transition-colors">Staff Picks</Link></li>
              <li><Link href="#" className="hover:text-[#b46b45] transition-colors">Bundles</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-sans font-bold text-stone-800 mb-5 text-sm uppercase tracking-wider">Support</h3>
            <ul className="flex flex-col gap-3 text-sm text-stone-600">
              <li><Link href="#" className="hover:text-[#b46b45] transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-[#b46b45] transition-colors">Shipping & Returns</Link></li>
              <li><Link href="#" className="hover:text-[#b46b45] transition-colors">Track Order</Link></li>
              <li><Link href="#" className="hover:text-[#b46b45] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-sans font-bold text-stone-800 mb-5 text-sm uppercase tracking-wider">Newsletter</h3>
            <p className="text-sm text-stone-600 leading-relaxed font-sans mb-4">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-white border border-stone-200 px-4 py-2.5 rounded-md text-sm outline-none focus:border-[#b46b45] focus:ring-1 focus:ring-[#b46b45] transition-all"
              />
              <button 
                type="button" 
                className="bg-[#8b5a45] hover:bg-[#724a38] text-white px-4 rounded-md transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <Mail size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-stone-200/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-500 font-sans">
            &copy; {new Date().getFullYear()} Cheapter.Co. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-stone-500 font-sans">
            <Link href="#" className="hover:text-stone-800 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-stone-800 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import {
  fetchWishlistFromApi,
  getWishlistBooks,
  removeFromWishlist,
  removeWishlistFromApi,
  type WishlistBook,
} from '@/src/lib/wishlist';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistBook[]>([]);
  const [useApiMode, setUseApiMode] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadWishlist() {
      try {
        const data = await fetchWishlistFromApi();
        if (!mounted) {
          return;
        }

        if (data.authenticated) {
          setWishlistItems(data.books);
          setUseApiMode(true);
          return;
        }
      } catch {
        // Fallback to local storage mode.
      }

      if (!mounted) {
        return;
      }

      setUseApiMode(false);
      setWishlistItems(getWishlistBooks());
    }

    loadWishlist();

    return () => {
      mounted = false;
    };
  }, []);

  const handleRemove = async (bookId: number) => {
    if (useApiMode) {
      try {
        const data = await removeWishlistFromApi(bookId);
        if (data.authenticated) {
          setWishlistItems(data.books);
          return;
        }
      } catch {
        // Fallback to local storage mode.
      }
    }

    const next = removeFromWishlist(bookId);
    setWishlistItems(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Heart className="h-5 w-5 text-[#bc876e]" fill="#bc876e" />
          หนังสือที่อยากได้
        </h2>
        <span className="text-sm text-gray-500">{wishlistItems.length} รายการ</span>
      </div>

      {wishlistItems.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-500">
          ยังไม่มีหนังสือใน Wishlist
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <div key={item.id} className="bg-[#fefdfb] rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="relative h-48 w-full bg-gray-100">
              <img 
                src={item.imageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80'} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemove(item.id)}
                className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-white hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-5">
              <h3 className="font-semibold text-gray-800 line-clamp-1">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{item.author}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg text-[#bc876e]">฿{item.price.toLocaleString()}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${item.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.quantity > 0 ? 'มีสินค้า' : 'สินค้าหมด'}
                </span>
              </div>
              
              <button 
                disabled={item.quantity <= 0}
                className={`w-full flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.quantity > 0
                    ? 'bg-[#bc876e] hover:bg-[#a8745d] text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                {item.quantity > 0 ? 'หยิบใส่ตะกร้า' : 'สินค้าหมด'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

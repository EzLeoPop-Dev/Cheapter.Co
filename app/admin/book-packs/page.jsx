"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Package, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminBookPacksPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [packs, setPacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPacks();
  }, [searchQuery]);

  const fetchPacks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/book-packs?search=${searchQuery}`);
      if (res.ok) {
        const data = await res.json();
        setPacks(data);
      }
    } catch (error) {
      console.error('Failed to fetch book packs', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this book pack?')) return;
    try {
      const res = await fetch(`/api/admin/book-packs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPacks();
      } else {
        alert('Failed to delete book pack');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete book pack');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">Book Packs</h2>
          <p className="text-gray-500 mt-1">Manage bundled books to sell as a package</p>
        </div>
        <div className="flex gap-3">
          {user?.role === 'ADMIN' && (
            <Link href="/admin/book-packs/new" className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Book Pack
            </Link>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 px-4 py-4 bg-gray-50/50 gap-4 sm:gap-0">
          <div className="flex items-center text-sm font-bold text-gray-700">
            Total {packs.length} packs
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search packs..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm rounded-xl outline-none focus:border-gray-900 font-medium shadow-sm w-full sm:w-64 transition-shadow" 
              />
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
                <div className="text-gray-500 font-medium tracking-wide">Loading packs...</div>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-white">
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Pack Info</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Items Included</th>
                  {user?.role === 'ADMIN' && (
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Stock</th>
                  )}
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Price</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {packs.map((pack) => (
                  <tr key={pack.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
                          {pack.image ? (
                            <img src={pack.image} alt={pack.title} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{pack.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">ID:{pack.id}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-2 max-w-xs">
                        {pack.packItems?.map(item => (
                          <span key={item.id} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                            {item.quantity}x {item.book.title}
                          </span>
                        ))}
                      </div>
                    </td>
                    {user?.role === 'ADMIN' && (
                      <td className="py-4 px-6 text-center font-mono text-sm font-bold text-gray-700">
                        {pack.stock}
                      </td>
                    )}
                    <td className="py-4 px-6 text-right font-bold text-gray-900 font-mono text-sm">
                      ฿{pack.price}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/book-packs/edit/${pack.id}`} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(pack.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isLoading && packs.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold mb-1">No Book Packs Found</h3>
              <p className="text-sm text-gray-500">Create a new book pack to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

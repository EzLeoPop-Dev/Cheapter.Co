"use client";
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Book, Package, Edit, Trash2, ExternalLink, ShoppingCart, Layers } from 'lucide-react';
import Link from 'next/link';

const TYPE_META = {
  Hardcover: { label: 'ปกแข็ง', icon: Package, className: 'text-gray-500' },
  EBook: { label: 'E-Book', icon: Book, className: 'text-blue-500' },
  Manga: { label: 'มังงะ', icon: Layers, className: 'text-gray-700' },
};

const STOCK_STATUS_META = {
  InStock: { label: 'มีสินค้า', className: 'bg-green-50 text-green-700 border-green-200' },
  LowStock: { label: 'ใกล้หมด', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  OutOfStock: { label: 'สินค้าหมด', className: 'bg-red-50 text-red-700 border-red-200' },
};

export default function AdminProductsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockFilter, setStockFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/books');
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data.books ?? []);
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (product) => {
    if (!confirm(`คุณต้องการลบสินค้า "${product.title}" ใช่หรือไม่?`)) return;
    try {
      const res = await fetch(`/api/admin/books/${product.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถลบสินค้านี้ได้');
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (stockFilter !== 'all') result = result.filter(p => p.stockStatus === stockFilter);
    if (typeFilter !== 'all') result = result.filter(p => p.bookType === typeFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    }
    return result;
  }, [products, stockFilter, typeFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">{t('prod.title')}</h2>
          <p className="text-gray-500 mt-1">{t('prod.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          {user?.role === 'ADMIN' && (
            <Link href="/admin/products/new" className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {t('prod.add')}
            </Link>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 px-2 pt-2 bg-gray-50/50 gap-4 sm:gap-0">
          <div className="flex overflow-x-auto scrollbar-hide w-full sm:w-auto">
            {[
              { key: 'all', label: t('prod.filter.all') },
              { key: 'InStock', label: STOCK_STATUS_META.InStock.label },
              { key: 'LowStock', label: STOCK_STATUS_META.LowStock.label },
              { key: 'OutOfStock', label: STOCK_STATUS_META.OutOfStock.label },
            ].map(tab => (
              <button 
                key={tab.key} 
                onClick={() => setStockFilter(tab.key)}
                className={`px-6 py-3.5 text-sm font-bold border-b-2 whitespace-nowrap transition-all flex-1 sm:flex-none ${
                  stockFilter === tab.key 
                    ? 'border-gray-900 text-gray-900 bg-white rounded-t-xl' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-t-xl'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto px-4 sm:px-0 sm:pr-4 pb-4 sm:pb-0">
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-xl outline-none focus:border-gray-900 font-bold shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <option value="all">ทุกประเภท</option>
              <option value="Hardcover">ปกแข็ง (Hardcover)</option>
              <option value="EBook">E-Book</option>
              <option value="Manga">มังงะ (Manga)</option>
            </select>

            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder={t('prod.search')} 
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
                <div className="text-gray-500 font-medium tracking-wide">Loading catalog...</div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-sm text-red-500 font-semibold">{error}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-white">
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('prod.col.book')}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{t('prod.col.type')}</th>
                  {user?.role === 'ADMIN' && (
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Stock</th>
                  )}
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('prod.col.price')}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{t('prod.col.status')}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('prod.col.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => {
                  const typeMeta = TYPE_META[product.bookType] ?? TYPE_META.Hardcover;
                  const TypeIcon = typeMeta.icon;
                  const statusMeta = STOCK_STATUS_META[product.stockStatus] ?? STOCK_STATUS_META.InStock;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            {product.image ? (
                              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Book className="w-5 h-5 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{product.title}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] font-bold text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">#{product.id}</span>
                              <span className="text-xs text-gray-500 font-medium">{product.author}</span>
                              {product.categoryName && (
                                <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">{product.categoryName}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex flex-col items-center justify-center">
                          <TypeIcon className={`w-4 h-4 mb-1 ${typeMeta.className}`} />
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            {typeMeta.label}
                          </span>
                        </div>
                      </td>
                      {user?.role === 'ADMIN' && (
                        <td className="py-4 px-6 text-center font-mono text-sm font-bold text-gray-700">
                          {product.stock}
                        </td>
                      )}
                      <td className="py-4 px-6 text-right font-bold text-gray-900 font-mono text-sm">
                        ฿{product.price}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider border ${statusMeta.className}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {user?.role === 'ADMIN' && (
                            <Link href={`/admin/purchase-orders/new?product=${product.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Order (PO)">
                              <ShoppingCart className="w-4 h-4" />
                            </Link>
                          )}
                          <Link href={`/admin/products/edit/${product.id}`} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200" title="Edit">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Link href={`/books/${product.id}`} target="_blank" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200" title="View Storefront">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          {user?.role === 'ADMIN' && (
                            <button onClick={() => handleDelete(product)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!isLoading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Book className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold mb-1">No Books Found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

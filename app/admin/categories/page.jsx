"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Folder, Edit2, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AdminCategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock categories data
    const mockCategories = [
      { id: 1, name: 'การพัฒนาตนเอง (Self-Improvement)', count: 45 },
      { id: 2, name: 'การเงินและการลงทุน (Finance & Investment)', count: 32 },
      { id: 3, name: 'วรรณกรรม (Literature)', count: 120 },
      { id: 4, name: 'เทคโนโลยี (Technology)', count: 15 },
      { id: 5, name: 'นิยายสืบสวน (Mystery/Thriller)', count: 56 },
      { id: 6, name: 'ประวัติศาสตร์ (History)', count: 28 },
    ];
    
    setTimeout(() => {
      setCategories(mockCategories);
      setIsLoading(false);
    }, 400);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">{t('cat.title')}</h2>
          <p className="text-gray-500 mt-1">{t('cat.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder={t('cat.search')} className="pl-9 pr-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg outline-none focus:border-gray-900 font-medium shadow-sm w-64" />
          </div>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('cat.new')}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-8">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
                <div className="text-gray-500 font-medium text-sm tracking-wide">Loading categories...</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(cat => (
                <div 
                  key={cat.id} 
                  className="p-6 bg-white border border-gray-100 rounded-2xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:border-gray-300 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-900 transition-colors duration-300">
                    <Folder className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{cat.name}</h3>
                  <p className="text-sm text-gray-500 font-medium mb-6">{cat.count} {t('cat.items')}</p>
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                      {t('cat.edit')}
                    </button>
                    <button className="flex items-center justify-center p-2 text-red-500 hover:text-white bg-red-50 hover:bg-red-500 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

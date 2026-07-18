"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, Folder, Edit2, Trash2, X, Save, BookOpen } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function AdminCategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showBooksModal, setShowBooksModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryBooks, setCategoryBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [booksError, setBooksError] = useState(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(cat => cat.name.toLowerCase().includes(q));
  }, [categories, searchQuery]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setNameInput('');
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setNameInput(category.name);
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) {
      setFormError('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
      const method = editingCategory ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Failed to save category');
      }

      const data = await res.json();
      if (editingCategory) {
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? data.category : c));
      } else {
        setCategories(prev => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err.message || 'ไม่สามารถบันทึกหมวดหมู่ได้');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`คุณต้องการลบหมวดหมู่ "${category.name}" ใช่หรือไม่?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      setCategories(prev => prev.filter(c => c.id !== category.id));
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถลบหมวดหมู่นี้ได้');
    }
  };

  const handleViewBooks = async (category) => {
    setShowBooksModal(true);
    setSelectedCategory(category);
    setCategoryBooks([]);
    setBooksError(null);
    setIsLoadingBooks(true);

    try {
      const res = await fetch(`/api/admin/categories/${category.id}`);
      if (!res.ok) throw new Error('Failed to load category books');
      const data = await res.json();
      setCategoryBooks(data?.category?.books ?? []);
    } catch (err) {
      console.error(err);
      setBooksError('ไม่สามารถโหลดรายการหนังสือของหมวดหมู่นี้ได้');
    } finally {
      setIsLoadingBooks(false);
    }
  };

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
            <input
              type="text"
              placeholder={t('cat.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg outline-none focus:border-gray-900 font-medium shadow-sm w-64"
            />
          </div>
          <button onClick={openCreateModal} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center gap-2">
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
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-sm text-red-500 font-semibold">{error}</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Folder className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold mb-1">ไม่พบหมวดหมู่</h3>
              <p className="text-sm text-gray-500">ลองเพิ่มหมวดหมู่ใหม่ หรือปรับคำค้นหา</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map(cat => (
                <div 
                  key={cat.id} 
                  className="p-6 bg-white border border-gray-100 rounded-2xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:border-gray-300 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-900 transition-colors duration-300">
                    <Folder className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{cat.name}</h3>
                  <p className="text-sm text-gray-500 font-medium mb-6">{cat.count} {t('cat.items')}</p>
                  <button
                    onClick={() => handleViewBooks(cat)}
                    className="w-full mb-3 flex items-center justify-center gap-2 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    ดูหนังสือในหมวด
                  </button>
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                    <button onClick={() => openEditModal(cat)} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                      {t('cat.edit')}
                    </button>
                    <button onClick={() => handleDelete(cat)} className="flex items-center justify-center p-2 text-red-500 hover:text-white bg-red-50 hover:bg-red-500 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingCategory ? 'แก้ไขหมวดหมู่' : t('cat.new')}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 p-2 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="p-6 space-y-3">
                <label className="text-sm font-bold text-gray-700 block">ชื่อหมวดหมู่ <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  placeholder="เช่น วรรณกรรม (Literature)"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow"
                />
                {formError && <p className="text-xs text-red-500 font-semibold">{formError}</p>}
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors text-sm">
                  ยกเลิก
                </button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors text-sm shadow-sm disabled:opacity-70 flex items-center gap-2">
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBooksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowBooksModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">หนังสือในหมวด: {selectedCategory?.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">ทั้งหมด {categoryBooks.length} รายการ</p>
              </div>
              <button onClick={() => setShowBooksModal(false)} className="text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 p-2 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {isLoadingBooks ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
                    <div className="text-gray-500 font-medium text-sm tracking-wide">Loading books...</div>
                  </div>
                </div>
              ) : booksError ? (
                <div className="text-center py-10">
                  <p className="text-sm text-red-500 font-semibold">{booksError}</p>
                </div>
              ) : categoryBooks.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                    <BookOpen className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">ยังไม่มีหนังสือในหมวดหมู่นี้</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categoryBooks.map((book) => (
                    <div key={book.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="w-12 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                        {book.image ? (
                          <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 truncate">{book.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                          <span className="font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">#{book.id}</span>
                          <span className="font-bold text-gray-700">{book.bookType}</span>
                          <span className="font-bold text-gray-700">Stock: {book.stock}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">฿{book.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

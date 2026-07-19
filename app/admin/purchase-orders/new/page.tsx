// @ts-nocheck
"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { ArrowLeft, Save, Plus, Search, Trash2, Book, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreatePurchaseOrderPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [items, setItems] = useState<any[]>([]);

  // Book search
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableBooks, setAvailableBooks] = useState<any[]>([]);

  useEffect(() => {
    // Load books from API
    fetch('/api/admin/books')
      .then(res => res.json())
      .then(data => {
        let books = [];
        if (data.books) books = data.books;
        else if (Array.isArray(data)) books = data;
        
        setAvailableBooks(books);

        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const paramBooks = params.get('books') || params.get('product');
          if (paramBooks && books.length > 0) {
            const ids = paramBooks.split(',').map(Number);
            const initialItems = books
              .filter((b: any) => ids.includes(b.id))
              .map((b: any) => ({
                bookId: b.id, 
                title: b.title, 
                image: b.image,
                ordered: 1, 
                unitCost: 0
              }));
            
            setItems(prev => {
              const newItems = [...prev];
              initialItems.forEach((item: any) => {
                if (!newItems.find(i => i.bookId === item.bookId)) {
                  newItems.push(item);
                }
              });
              return newItems;
            });
          }
        }
      })
      .catch(err => console.error(err));
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return availableBooks;
    const q = searchQuery.toLowerCase();
    return availableBooks.filter(p => 
      p.title?.toLowerCase().includes(q) || 
      p.isbn?.toLowerCase().includes(q) ||
      p.author?.toLowerCase().includes(q)
    );
  }, [availableBooks, searchQuery]);

  const handleAddItem = (book: any) => {
    if (items.find(i => i.bookId === book.id)) return;
    setItems([...items, { 
      bookId: book.id, 
      title: book.title, 
      image: book.image,
      ordered: 1, 
      unitCost: 0
    }]);
    setShowProductSearch(false);
    setSearchQuery('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index][field] = Number(value);
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.ordered * item.unitCost), 0);
  };

  const handleSavePO = async (e: any) => {
    e.preventDefault();
    if (!supplier || items.length === 0) {
      alert("Please select a supplier and add at least one item.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier,
          expectedDate: expectedDate || null,
          createdBy: 'Admin',
          items: items.map(i => ({
            bookId: i.bookId,
            ordered: i.ordered,
            unitCost: i.unitCost
          }))
        })
      });

      if (res.ok) {
        router.push('/admin/purchase-orders');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create PO');
      }
    } catch (error) {
      console.error(error);
      alert('Error saving PO');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 relative">
      
      {/* Product Search Modal */}
      {showProductSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-500" />
                ค้นหาหนังสือที่ต้องการสั่งซื้อ
              </h3>
              <button onClick={() => setShowProductSearch(false)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-100">
              <input 
                type="text" 
                autoFocus
                placeholder="พิมพ์ชื่อหนังสือ, ISBN, หรือชื่อผู้เขียน..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow" 
              />
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {filteredProducts.map(book => (
                <div key={book.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                      {book.image && <img src={book.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{book.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddItem(book)}
                    disabled={items.some(i => i.bookId === book.id)}
                    className="px-4 py-2 text-sm font-bold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {items.some(i => i.bookId === book.id) ? 'เลือกแล้ว' : 'เพิ่ม'}
                  </button>
                </div>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500 font-medium">ไม่พบหนังสือที่ค้นหา</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/purchase-orders" className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-gray-900 rounded-full transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900">{t('po.add')}</h2>
            <p className="text-gray-500 mt-1">ร่างใบสั่งซื้อไปยังซัพพลายเออร์</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/purchase-orders" className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
            ยกเลิก
          </Link>
          <button 
            onClick={handleSavePO}
            disabled={isSaving || items.length === 0 || !supplier}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            บันทึกใบสั่งซื้อ
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-200 p-6">
        <h3 className="text-lg font-black text-gray-900 mb-6">ข้อมูลใบสั่งซื้อ (PO Details)</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1.5">ซัพพลายเออร์ (Supplier) <span className="text-red-500">*</span></label>
            <input 
              type="text"
              value={supplier} 
              onChange={e => setSupplier(e.target.value)}
              placeholder="พิมพ์ชื่อซัพพลายเออร์/สำนักพิมพ์..."
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1.5">วันที่คาดว่าจะได้รับ (Expected Date)</label>
            <input 
              type="date" 
              value={expectedDate} 
              onChange={e => setExpectedDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900">รายการหนังสือ (Line Items)</h3>
          <button 
            onClick={() => setShowProductSearch(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> ค้นหาหนังสือ
          </button>
        </div>
        
        <div className="overflow-x-auto min-h-[200px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest w-1/2">รายการ</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">จำนวน</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">ทุน/หน่วย</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">รวม</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center w-16">ลบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-12 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                        {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <input 
                      type="number" 
                      min="1"
                      value={item.ordered} 
                      onChange={e => handleItemChange(index, 'ordered', e.target.value)}
                      className="w-20 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:border-gray-900 font-mono inline-block"
                    />
                  </td>
                  <td className="py-3 px-6 text-right">
                    <input 
                      type="number" 
                      min="0"
                      value={item.unitCost} 
                      onChange={e => handleItemChange(index, 'unitCost', e.target.value)}
                      className="w-24 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:border-gray-900 font-mono inline-block"
                    />
                  </td>
                  <td className="py-3 px-6 text-right font-bold text-gray-900 font-mono text-sm">
                    ฿{(item.ordered * item.unitCost).toLocaleString()}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button onClick={() => handleRemoveItem(index)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-sm font-medium">
                    ยังไม่มีรายการหนังสือในใบสั่งซื้อ กรุณากดปุ่ม "ค้นหาหนังสือ"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <div className="w-72">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500 font-bold text-sm">จำนวนทั้งหมด:</span>
              <span className="text-gray-900 font-bold font-mono">{items.reduce((sum, item) => sum + item.ordered, 0)} เล่ม</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-gray-900 font-black">ยอดรวมสุทธิ:</span>
              <span className="text-2xl font-black text-gray-900 font-mono tracking-tight">฿{calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

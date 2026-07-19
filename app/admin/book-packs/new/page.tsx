// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save, Plus, Trash2, Book } from 'lucide-react';
import Link from 'next/link';

export default function NewBookPackPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    image: ''
  });
  
  const [availableBooks, setAvailableBooks] = useState<any[]>([]);
  const [packItems, setPackItems] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/admin/books');
      if (res.ok) {
        const data = await res.json();
        const booksData = Array.isArray(data) ? data : (data.books || []);
        setAvailableBooks(booksData);
        if (booksData.length > 0) {
          setSelectedBookId(booksData[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Failed to fetch books', error);
    }
  };

  const handleAddItem = () => {
    if (!selectedBookId) return;
    
    // Check if already added
    if (packItems.find(item => item.bookId.toString() === selectedBookId)) {
      alert("Book already added to pack");
      return;
    }

    const book = availableBooks.find(b => b.id.toString() === selectedBookId);
    if (book) {
      setPackItems([...packItems, { ...book, bookId: book.id, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (bookId) => {
    setPackItems(packItems.filter(item => item.bookId !== bookId));
  };

  const handleQuantityChange = (bookId, qty) => {
    setPackItems(packItems.map(item => 
      item.bookId === bookId ? { ...item, quantity: parseInt(qty) || 1 } : item
    ));
  };

  const calculateSuggestedPrice = () => {
    return packItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (packItems.length === 0) {
      alert("Please add at least one book to the pack");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/book-packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          packItems: packItems.map(i => ({ bookId: i.bookId, quantity: i.quantity }))
        })
      });

      if (res.ok) {
        router.push('/admin/book-packs');
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create pack");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving pack");
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-8 text-center text-red-500 font-bold">Unauthorized</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/book-packs" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Create Book Pack</h2>
            <p className="text-gray-500 text-sm">Combine multiple books into a single product</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Pack Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Pack Title <span className="text-red-500">*</span></label>
              <input 
                required 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all" 
                placeholder="e.g. Harry Potter Complete Set"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Price (฿) <span className="text-red-500">*</span></label>
              <input 
                required 
                type="number" 
                step="0.01"
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: e.target.value})} 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all" 
              />
              <p className="text-xs text-gray-500">
                Suggested price based on contents: ฿{calculateSuggestedPrice().toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Stock <span className="text-red-500">*</span></label>
              <input 
                required 
                type="number" 
                value={formData.stock} 
                onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Image URL</label>
              <input 
                type="text" 
                value={formData.image} 
                onChange={(e) => setFormData({...formData, image: e.target.value})} 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all" 
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Description</label>
            <textarea 
              rows="3"
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all" 
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Included Books</h3>
          
          <div className="flex gap-2 items-center">
            <select 
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
            >
              {availableBooks.map(book => (
                <option key={book.id} value={book.id}>{book.title} (฿{book.price})</option>
              ))}
            </select>
            <button 
              type="button" 
              onClick={handleAddItem}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Book
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {packItems.length === 0 ? (
              <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Book className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold">No books added to the pack yet</p>
              </div>
            ) : (
              packItems.map(item => (
                <div key={item.bookId} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden">
                      {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Book className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">฿{item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-gray-500">Qty:</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={(e) => handleQuantityChange(item.bookId, e.target.value)}
                        className="w-16 px-2 py-1 text-sm bg-white border border-gray-200 rounded"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveItem(item.bookId)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/book-packs" className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isLoading}
            className="px-6 py-2.5 bg-[#1a1a1a] text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Book Pack</>}
          </button>
        </div>
      </form>
    </div>
  );
}

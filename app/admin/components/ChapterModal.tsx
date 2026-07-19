// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Save } from 'lucide-react';

export default function ChapterModal({ isOpen, onClose, onSave, initialData, nextChapterNumber = 1 }) {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    file: null,
    chapterNumber: 1
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          chapterNumber: initialData.chapterNumber || nextChapterNumber
        });
      } else {
        setFormData({ title: '', price: '', file: null, chapterNumber: nextChapterNumber });
      }
    }
  }, [isOpen, initialData, nextChapterNumber]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert("กรุณากรอกชื่อตอน");
      return;
    }
    onSave({
      ...formData,
      id: initialData?.id || `CH-${Math.floor(Math.random() * 10000)}`,
      price: Number(formData.price) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900">
            {initialData ? 'แก้ไขตอน' : 'เพิ่มตอนใหม่'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-sm font-bold text-gray-700 block mb-1.5">ตอนที่</label>
              <input 
                type="number" 
                value={formData.chapterNumber}
                disabled
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 font-bold cursor-not-allowed text-center" 
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-bold text-gray-700 block mb-1.5">ชื่อตอน <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                autoFocus
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="เช่น จุดเริ่มต้น" 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow" 
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1.5">ราคา (บาท)</label>
            <input 
              type="number" 
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              placeholder="0 (อ่านฟรี)" 
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow font-mono" 
            />
            <p className="text-xs text-gray-500 mt-1">หากต้องการให้อ่านฟรี ให้ใส่เลข 0 หรือเว้นว่างไว้</p>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1.5">ไฟล์เนื้อหา</label>
            <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
              <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors mb-2" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                {formData.file ? 'เลือกไฟล์อื่นเพื่อเปลี่ยน' : 'คลิกเพื่อเลือกไฟล์ (PDF/EPUB/TXT)'}
              </span>
              {formData.file && (
                <span className="text-xs text-gray-900 font-bold mt-1">ไฟล์ถูกเลือกแล้ว (Mock)</span>
              )}
              {/* Mocking actual file upload by just setting a flag */}
              <input 
                type="file" 
                className="hidden" 
                onChange={() => setFormData({...formData, file: true})} 
              />
              <button 
                type="button"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onClick={() => setFormData({...formData, file: true})}
              ></button>
            </div>
          </div>
          
          <div className="pt-2">
            <button 
              type="submit"
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {initialData ? 'บันทึกการแก้ไข' : 'บันทึกตอน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

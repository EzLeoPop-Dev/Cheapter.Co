// @ts-nocheck
"use client";
import React, { useState } from 'react';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState([
    { id: 1, name: 'ส่วนลด 10% เดือนเกิด', code: 'HBD2026', discount: '10%', status: 'Active', end_date: '2026-12-31', type: 'discount' },
    { id: 2, name: 'ส่งฟรี 500 บาทขึ้นไป', code: 'FREESHIP', discount: 'ค่าส่ง 0 บาท', status: 'Active', end_date: '', type: 'freeship' },
    { id: 3, name: 'Flash Sale (หมดเขต)', code: 'FLASH50', discount: '50 บาท', status: 'Expired', end_date: '2026-07-10', type: 'discount' },
  ]);

  const [showAddPromoModal, setShowAddPromoModal] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<any>(null);
  const [promoFormData, setPromoFormData] = useState({
    name: '', code: '', discount: '', end_date: '', status: 'Active', type: 'discount'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">ตั้งค่าโปรโมชั่นและแคมเปญ</h2>
          <p className="text-[#a09c92]">จัดการโค้ดส่วนลด และแคมเปญกระตุ้นยอดขาย</p>
        </div>
        <button 
          onClick={() => {
            setEditingPromoId(null);
            setPromoFormData({ name: '', code: '', discount: '', end_date: '', status: 'Active' });
            setShowAddPromoModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors text-sm shadow-md"
        >
          + สร้างโปรโมชั่นใหม่
        </button>
      </div>

      {/* Promotions List - Separated by Category */}
      <div className="space-y-6">
        
        {/* Discount Coupons */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-sm">
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            🎟️ คูปองส่วนลดหนังสือ
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e6e5e0]">
                  <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap">ชื่อแคมเปญ</th>
                  <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap">โค้ดส่วนลด</th>
                  <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap">ส่วนลด</th>
                  <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap">วันหมดอายุ</th>
                  <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap">สถานะ</th>
                  <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e5e0]">
                {promotions.filter(p => p.type !== 'freeship').map((promo) => (
                  <tr key={promo.id} className="hover:bg-white/50 transition-colors">
                    <td className="py-4 px-4 font-medium text-[#1A1A1A]">{promo.name}</td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">{promo.code}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-indigo-600 font-bold">{promo.discount}</td>
                    <td className="py-4 px-4 text-sm text-[#a09c92]">
                      {promo.end_date ? new Date(promo.end_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'ไม่มีกำหนด'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        promo.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {promo.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                      <button 
                        onClick={() => {
                          setEditingPromoId(promo.id);
                          setPromoFormData({
                            name: promo.name, code: promo.code, discount: promo.discount, end_date: promo.end_date, status: promo.status, type: promo.type || 'discount'
                          });
                          setShowAddPromoModal(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-[#F2EEE7] hover:bg-gray-200 text-[#1A1A1A] rounded-lg transition-colors"
                      >
                        แก้ไข
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('คุณต้องการลบโปรโมชั่นนี้ใช่หรือไม่?')) {
                            setPromotions(promotions.filter(p => p.id !== promo.id));
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Free Shipping Coupons */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-sm">
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            🚚 คูปองส่งฟรี
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e6e5e0]">
                  <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap">ชื่อแคมเปญ</th>
                  <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap">โค้ดส่วนลด</th>
                  <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap">เงื่อนไข/ส่วนลด</th>
                  <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap">วันหมดอายุ</th>
                  <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap">สถานะ</th>
                  <th className="pb-3 px-4 font-bold text-[#a09c92] whitespace-nowrap text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e5e0]">
                {promotions.filter(p => p.type === 'freeship').map((promo) => (
                  <tr key={promo.id} className="hover:bg-white/50 transition-colors">
                    <td className="py-4 px-4 font-medium text-[#1A1A1A]">{promo.name}</td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">{promo.code}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-green-600 font-bold">{promo.discount}</td>
                    <td className="py-4 px-4 text-sm text-[#a09c92]">
                      {promo.end_date ? new Date(promo.end_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'ไม่มีกำหนด'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        promo.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {promo.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                      <button 
                        onClick={() => {
                          setEditingPromoId(promo.id);
                          setPromoFormData({
                            name: promo.name, code: promo.code, discount: promo.discount, end_date: promo.end_date, status: promo.status, type: promo.type || 'freeship'
                          });
                          setShowAddPromoModal(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-[#F2EEE7] hover:bg-gray-200 text-[#1A1A1A] rounded-lg transition-colors"
                      >
                        แก้ไข
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('คุณต้องการลบโปรโมชั่นนี้ใช่หรือไม่?')) {
                            setPromotions(promotions.filter(p => p.id !== promo.id));
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Promotion Modal */}
      {showAddPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddPromoModal(false)}>
          <div className="bg-[#FDFBF7] rounded-[2rem] w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[#e6e5e0] flex justify-between items-center bg-white">
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                {editingPromoId ? 'แก้ไขโปรโมชั่น' : 'สร้างโปรโมชั่นใหม่'}
              </h3>
              <button onClick={() => setShowAddPromoModal(false)} className="text-[#a09c92] hover:text-red-500 bg-gray-100 hover:bg-red-50 p-2 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">ชื่อแคมเปญ <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={promoFormData.name} 
                  onChange={e => setPromoFormData({...promoFormData, name: e.target.value})} 
                  placeholder="เช่น ส่วนลด 10% เดือนเกิด"
                  className="w-full px-3 py-2 border border-[#e6e5e0] rounded-xl focus:outline-none focus:border-indigo-600 text-sm" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1">โค้ดส่วนลด <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={promoFormData.code} 
                    onChange={e => setPromoFormData({...promoFormData, code: e.target.value.toUpperCase()})} 
                    placeholder="เช่น HBD2026"
                    className="w-full px-3 py-2 border border-[#e6e5e0] rounded-xl focus:outline-none focus:border-indigo-600 text-sm font-mono uppercase" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1">ส่วนลด <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={promoFormData.discount} 
                    onChange={e => setPromoFormData({...promoFormData, discount: e.target.value})} 
                    placeholder="เช่น 10%, 50 บาท"
                    className="w-full px-3 py-2 border border-[#e6e5e0] rounded-xl focus:outline-none focus:border-indigo-600 text-sm" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1">วันหมดอายุ</label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={promoFormData.end_date} 
                    onChange={e => setPromoFormData({...promoFormData, end_date: e.target.value})} 
                    className="w-full px-3 py-2 border border-[#e6e5e0] rounded-xl focus:outline-none focus:border-indigo-600 text-sm" 
                  />
                  <p className="text-xs text-stone-500 mt-1">เว้นว่างไว้หากไม่มีกำหนด</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1">สถานะ</label>
                  <select 
                    value={promoFormData.status} 
                    onChange={e => setPromoFormData({...promoFormData, status: e.target.value})} 
                    className="w-full px-3 py-2 border border-[#e6e5e0] rounded-xl focus:outline-none focus:border-indigo-600 text-sm bg-white"
                  >
                    <option value="Active">Active (ใช้งานอยู่)</option>
                    <option value="Expired">Expired (หมดเขต/ระงับ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">หมวดหมู่คูปอง <span className="text-red-500">*</span></label>
                <select 
                  value={promoFormData.type} 
                  onChange={e => setPromoFormData({...promoFormData, type: e.target.value})} 
                  className="w-full px-3 py-2 border border-[#e6e5e0] rounded-xl focus:outline-none focus:border-indigo-600 text-sm bg-white"
                >
                  <option value="discount">🎟️ คูปองส่วนลดหนังสือ (เปอร์เซ็นต์ / เงินสด)</option>
                  <option value="freeship">🚚 คูปองส่งฟรี</option>
                </select>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#e6e5e0] bg-white flex justify-end gap-3">
              <button 
                onClick={() => setShowAddPromoModal(false)} 
                className="px-5 py-2.5 bg-[#F2EEE7] hover:bg-gray-200 text-[#1A1A1A] rounded-xl font-bold transition-colors text-sm"
              >
                ยกเลิก
              </button>
              <button 
                onClick={() => {
                  if (promoFormData.name && promoFormData.code && promoFormData.discount) {
                    if (editingPromoId) {
                      setPromotions(promotions.map(p => p.id === editingPromoId ? { ...p, ...promoFormData } : p));
                    } else {
                      const newId = promotions.length > 0 ? Math.max(...promotions.map(p => p.id)) + 1 : 1;
                      setPromotions([...promotions, { id: newId, ...promoFormData }]);
                    }
                    setShowAddPromoModal(false);
                  }
                }} 
                className={`px-5 py-2.5 rounded-xl font-bold transition-colors text-sm ${(promoFormData.name && promoFormData.code && promoFormData.discount) ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={!(promoFormData.name && promoFormData.code && promoFormData.discount)}
              >
                บันทึกโปรโมชั่น
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

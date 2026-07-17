"use client";

import React, { useState } from 'react';
import Image from 'next/image';

export default function ProfilePage() {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      isDefault: true,
      label: 'บ้าน',
      name: 'สมชาย ใจดี',
      phone: '081-234-5678',
      streetAddress: '123/45 ซอยสุขุมวิท 101 ถนนสุขุมวิท',
      city: 'กรุงเทพมหานคร',
      zipCode: '10260',
    },
    {
      id: 2,
      isDefault: false,
      label: 'ที่ทำงาน',
      name: 'สมชาย ใจดี',
      phone: '081-999-9999',
      streetAddress: 'อาคารสำนักงานใหญ่ ชั้น 15 ซอยอโศกมนตรี',
      city: 'กรุงเทพมหานคร',
      zipCode: '10110',
    }
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  const handleDelete = (id: number) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบที่อยู่นี้?')) {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    }
  };

  const startEdit = (addr: any) => {
    setEditingId(addr.id);
    setIsAdding(false);
    setEditForm({ ...addr });
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditForm({
      label: 'ที่อยู่ใหม่',
      name: '',
      phone: '',
      streetAddress: '',
      city: '',
      zipCode: ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditForm(null);
  };

  const handleSave = () => {
    if (isAdding) {
      const newId = addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1;
      setAddresses([...addresses, { ...editForm, id: newId, isDefault: addresses.length === 0 }]);
    } else {
      setAddresses(prev => prev.map(addr => addr.id === editingId ? editForm : addr));
    }
    setEditingId(null);
    setIsAdding(false);
    setEditForm(null);
  };

  return (
    <div className="space-y-8">
      {/* ข้อมูลส่วนตัว Card */}
      <div className="bg-[#fefdfb] rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">ข้อมูลส่วนตัว</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <button className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              เปลี่ยนรูปโปรไฟล์
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm text-gray-600 block">ชื่อ - นามสกุล</label>
                <input 
                  type="text" 
                  defaultValue="สมชาย ใจดี" 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#fefdfb] focus:outline-none focus:ring-2 focus:ring-[#bc876e] focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-600 block">อีเมล</label>
                <input 
                  type="email" 
                  defaultValue="somchai.j@example.com" 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#fefdfb] focus:outline-none focus:ring-2 focus:ring-[#bc876e] focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-600 block">เบอร์โทรศัพท์</label>
              <input 
                type="tel" 
                defaultValue="081-234-5678" 
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(/[^0-9-]/g, '');
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#fefdfb] focus:outline-none focus:ring-2 focus:ring-[#bc876e] focus:border-transparent transition-all"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button className="px-6 py-2.5 bg-[#bc876e] hover:bg-[#a8745d] text-white rounded-lg font-medium transition-colors shadow-sm">
                บันทึกข้อมูล
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ที่อยู่สำหรับจัดส่ง Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">ที่อยู่สำหรับจัดส่ง</h2>
          {!isAdding && (
            <button 
              onClick={handleAddNew}
              className="text-sm text-[#bc876e] hover:text-[#a8745d] font-medium flex items-center transition-colors"
            >
              + เพิ่มที่อยู่ใหม่
            </button>
          )}
        </div>

        {isAdding && (
          <div className="mb-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">เพิ่มที่อยู่ใหม่</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-600 block">Full Name</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black" 
                    value={editForm.name} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600 block">Phone Number</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black" 
                    value={editForm.phone} 
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value.replace(/[^0-9-]/g, '')})} 
                    placeholder="08XXXXXXXX"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600 block">Street Address</label>
                <input 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black" 
                  value={editForm.streetAddress} 
                  onChange={(e) => setEditForm({...editForm, streetAddress: e.target.value})} 
                  placeholder="123 Paper St, Apt 4B"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-600 block">City</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black" 
                    value={editForm.city} 
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})} 
                    placeholder="Portland"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600 block">ZIP Code</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black" 
                    value={editForm.zipCode} 
                    onChange={(e) => setEditForm({...editForm, zipCode: e.target.value.replace(/\D/g, '')})} 
                    placeholder="97204"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button onClick={cancelEdit} className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2.5 text-sm bg-[#1a1a1a] text-white rounded-lg hover:bg-black font-medium transition-colors shadow-sm">Save Address</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div key={addr.id} className={`bg-[#fefdfb] rounded-2xl p-6 shadow-sm border ${editingId === addr.id ? 'border-[#bc876e] ring-1 ring-[#bc876e]' : 'border-gray-100'} flex flex-col`}>
              {editingId === addr.id ? (
                // Edit Form
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800">แก้ไขที่อยู่</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600 block">Full Name</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black" 
                        value={editForm.name} 
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600 block">Phone Number</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black" 
                        value={editForm.phone} 
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value.replace(/[^0-9-]/g, '')})} 
                        placeholder="08XXXXXXXX"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-gray-600 block">Street Address</label>
                    <input 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black" 
                      value={editForm.streetAddress} 
                      onChange={(e) => setEditForm({...editForm, streetAddress: e.target.value})} 
                      placeholder="123 Paper St, Apt 4B"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600 block">City</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black" 
                        value={editForm.city} 
                        onChange={(e) => setEditForm({...editForm, city: e.target.value})} 
                        placeholder="Portland"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600 block">ZIP Code</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black" 
                        value={editForm.zipCode} 
                        onChange={(e) => setEditForm({...editForm, zipCode: e.target.value.replace(/\D/g, '')})} 
                        placeholder="97204"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end mt-6">
                    <button onClick={cancelEdit} className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2.5 text-sm bg-[#1a1a1a] text-white rounded-lg hover:bg-black font-medium transition-colors shadow-sm">Save Address</button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <>
                  <div className="flex justify-between items-start mb-3">
                    {addr.isDefault ? (
                      <div className="inline-block px-3 py-1 bg-[#fae8df] text-[#bc876e] text-xs rounded-full font-medium">
                        ที่อยู่หลัก
                      </div>
                    ) : (
                      <div></div>
                    )}
                    <div className="flex gap-3 text-sm font-medium">
                      <button 
                        onClick={() => startEdit(addr)}
                        className="text-gray-400 hover:text-[#bc876e] transition-colors"
                      >
                        แก้ไข
                      </button>
                      {!addr.isDefault && (
                        <button 
                          onClick={() => handleDelete(addr.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          ลบ
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-2">{addr.label}</h3>
                  <p className="text-sm text-gray-600 mb-1">{addr.name}</p>
                  <p className="text-sm text-gray-600 mb-1">{addr.streetAddress}</p>
                  <p className="text-sm text-gray-600 mb-3">{addr.city}, {addr.zipCode}</p>
                  <p className="text-sm text-gray-600 mt-auto pt-2 border-t border-gray-50 text-xs">โทร: {addr.phone}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

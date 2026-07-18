"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from "next-auth/react";
import Image from 'next/image';
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  
  // State ข้อมูลส่วนตัว
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', profileImage: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State ที่อยู่
  const [addresses, setAddresses] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลเมื่อโหลดหน้า
  useEffect(() => {
    if (status === "authenticated") {
      fetchProfileData();
    } else if (status === "unauthenticated") {
      setIsLoading(false); // กันไม่ให้ค้างหมุนตลอดไปถ้ายังไม่ได้ล็อกอิน
    }
  }, [status]);

  const fetchProfileData = async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Fetch profile failed:", res.status, errData);
        return; // ไม่เอาข้อมูล error มาเซ็ต state
      }
      const data = await res.json();
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        profileImage: data.profileImage || ''
      });
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ฟังก์ชันอัปโหลดรูปโปรไฟล์ ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // จำกัดขนาด 2MB
        alert("ขนาดไฟล์ใหญ่เกินไป (สูงสุด 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          profileImage: profile.profileImage
        })
      });
      if (res.ok) {
        alert("บันทึกข้อมูลส่วนตัวสำเร็จ!");
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Save profile failed:", res.status, errData);
        alert(`บันทึกไม่สำเร็จ: ${errData.error || res.status}`);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- ฟังก์ชันจัดการที่อยู่ ---
  const handleAddNew = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditForm({ label: 'ที่อยู่ใหม่', name: '', phone: '', streetAddress: '', city: '', zipCode: '' });
  };

  const startEdit = (addr: any) => {
    setEditingId(addr.id);
    setIsAdding(false);
    setEditForm({ ...addr });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditForm(null);
  };

  const handleSaveAddress = async () => {
    const method = isAdding ? 'POST' : 'PUT';
    try {
      const res = await fetch('/api/address', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      if (res.ok) {
        fetchProfileData(); // โหลดข้อมูลใหม่เพื่อเอา ID จาก DB
        cancelEdit();
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกที่อยู่");
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบที่อยู่นี้?')) {
      try {
        await fetch(`/api/address?id=${id}`, { method: 'DELETE' });
        setAddresses(prev => prev.filter(addr => addr.id !== id));
      } catch (error) {
        alert("ลบที่อยู่ไม่สำเร็จ");
      }
    }
  };

  if (status === "loading" || isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#bc876e]" /></div>;
  }

  // สร้างตัวแปรดึงตัวอักษรตัวแรกของชื่อมา (ถ้าไม่มีชื่อให้ใช้ตัว U แทน)
  const avatarLetter = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="space-y-8">
      {/* --- ข้อมูลส่วนตัว Card --- */}
      <div className="bg-[#fefdfb] rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">ข้อมูลส่วนตัว</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-3">
            
            {/* 👇 เติมสีพื้นหลัง bg-[#bc876e] ให้กรอบวงกลม */}
            <div className={`w-28 h-28 rounded-full overflow-hidden flex items-center justify-center relative shadow-inner ${!profile.profileImage ? 'bg-[#bc876e]' : 'bg-gray-100'}`}>
              {profile.profileImage ? (
                <Image 
                  src={profile.profileImage} 
                  alt="Profile" 
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-white">{avatarLetter}</span>
              )}
            </div>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              เปลี่ยนรูปโปรไฟล์
            </button>
          </div>

          {/* Profile Form */}
          <div className="flex-1 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm text-gray-600 block">ชื่อ - นามสกุล</label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#fefdfb] focus:outline-none focus:ring-2 focus:ring-[#bc876e]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-600 block">อีเมล (เปลี่ยนไม่ได้)</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-600 block">เบอร์โทรศัพท์</label>
              <input 
                type="tel" 
                value={profile.phone} 
                onChange={(e) => setProfile({...profile, phone: e.target.value.replace(/[^0-9-]/g, '')})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#fefdfb] focus:outline-none focus:ring-2 focus:ring-[#bc876e]"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="px-6 py-2.5 bg-[#bc876e] hover:bg-[#a8745d] text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
              >
                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
                บันทึกข้อมูล
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- ที่อยู่สำหรับจัดส่ง Section --- */}
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

        {/* ฟอร์มเพิ่ม/แก้ไข ที่อยู่ */}
        {(isAdding || editingId) && (
          <div className="mb-6 bg-white rounded-2xl p-6 shadow-sm border border-[#bc876e]">
            <h3 className="font-semibold text-gray-800 mb-4">{isAdding ? 'เพิ่มที่อยู่ใหม่' : 'แก้ไขที่อยู่'}</h3>
            <div className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-sm text-gray-600 block">ป้ายกำกับ (เช่น บ้าน, ที่ทำงาน)</label>
                <input 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#bc876e] focus:ring-1 focus:ring-[#bc876e]" 
                  value={editForm?.label || ''} 
                  onChange={(e) => setEditForm({...editForm, label: e.target.value})} 
                  placeholder="บ้าน"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-600 block">ชื่อผู้รับ</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#bc876e] focus:ring-1 focus:ring-[#bc876e]" 
                    value={editForm?.name || ''} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600 block">เบอร์โทรศัพท์</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#bc876e] focus:ring-1 focus:ring-[#bc876e]" 
                    value={editForm?.phone || ''} 
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value.replace(/[^0-9-]/g, '')})} 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600 block">ที่อยู่ (บ้านเลขที่, ซอย, ถนน)</label>
                <input 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#bc876e] focus:ring-1 focus:ring-[#bc876e]" 
                  value={editForm?.streetAddress || ''} 
                  onChange={(e) => setEditForm({...editForm, streetAddress: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-600 block">จังหวัด / อำเภอ / ตำบล</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#bc876e] focus:ring-1 focus:ring-[#bc876e]" 
                    value={editForm?.city || ''} 
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600 block">รหัสไปรษณีย์</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#bc876e] focus:ring-1 focus:ring-[#bc876e]" 
                    value={editForm?.zipCode || ''} 
                    onChange={(e) => setEditForm({...editForm, zipCode: e.target.value.replace(/\D/g, '')})} 
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button onClick={cancelEdit} className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">ยกเลิก</button>
                <button onClick={handleSaveAddress} className="px-6 py-2.5 text-sm bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition-colors shadow-sm">บันทึกที่อยู่</button>
              </div>
            </div>
          </div>
        )}

        {/* รายการที่อยู่ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-[#fefdfb] rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:border-[#bc876e] transition-colors group">
              <div className="flex justify-between items-start mb-3">
                {addr.isDefault ? (
                  <div className="inline-block px-3 py-1 bg-[#fae8df] text-[#bc876e] text-xs rounded-full font-medium">ที่อยู่หลัก</div>
                ) : <div />}
                
                <div className="flex gap-3 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(addr)} className="text-gray-400 hover:text-[#bc876e] transition-colors">แก้ไข</button>
                  <button onClick={() => handleDeleteAddress(addr.id)} className="text-gray-400 hover:text-red-500 transition-colors">ลบ</button>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-800 mb-2">{addr.label}</h3>
              <p className="text-sm text-gray-600 mb-1">{addr.name}</p>
              <p className="text-sm text-gray-600 mb-1">{addr.streetAddress}</p>
              <p className="text-sm text-gray-600 mb-3">{addr.city}, {addr.zipCode}</p>
              <p className="text-sm text-gray-600 mt-auto pt-2 border-t border-gray-50 text-xs">โทร: {addr.phone}</p>
            </div>
          ))}
          {addresses.length === 0 && !isAdding && (
             <div className="col-span-full text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
               ยังไม่มีที่อยู่จัดส่ง
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
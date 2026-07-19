// @ts-nocheck
"use client";
import React, { useState, useEffect, useRef } from 'react';
// 👇 1. เพิ่ม ChevronLeft สำหรับปุ่มย้อนกลับ
import { Search, Shield, UserX, UserCheck, Mail, Calendar, MoreVertical, Filter, UserPlus, X, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useSession } from 'next-auth/react';

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  
  // States สำหรับ Modal เพิ่มผู้ใช้
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });

  // State สำหรับ Dropdown Actions
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ปิด Dropdown เมื่อคลิกที่อื่น
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ดึงข้อมูลผู้ใช้จาก Database
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
        if (res.status !== 401) {
          console.error("Failed to fetch users:", data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ฟังก์ชันเพิ่มผู้ใช้
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewUser({ name: '', email: '', password: '', role: 'CUSTOMER' });
        fetchUsers();
      } else {
        alert("ไม่สามารถเพิ่มผู้ใช้ได้ (อีเมลอาจซ้ำ)");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ฟังก์ชันสลับสถานะ Active / Banned
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Banned' : 'Active';
    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  // ฟังก์ชันเปลี่ยน Role
  const handleChangeRole = async (id: string, newRole: string) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole })
      });
      setActiveDropdown(null);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  // ฟังก์ชันลบผู้ใช้
  const handleDelete = async (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานท่านนี้?")) {
      try {
        await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
        fetchUsers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  // กรองผู้ใช้ตามช่องค้นหา
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 👇 3. รีเซ็ตกลับไปหน้า 1 เสมอเวลาพิมพ์ค้นหาใหม่
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 👇 4. คำนวณข้อมูลที่จะแสดงในหน้าปัจจุบัน
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">{t('usr.title') || 'ผู้ใช้งานระบบ'}</h2>
          <p className="text-gray-500 mt-1">{t('usr.subtitle') || 'จัดการข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึง'}</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('usr.search') || 'ค้นหาชื่อ, อีเมล...'} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg outline-none focus:border-gray-900 font-medium shadow-sm w-72" 
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {t('usr.add') || 'เพิ่มผู้ใช้'}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
                <div className="text-gray-500 font-medium text-sm tracking-wide">Loading users...</div>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('usr.col.user') || 'USER'}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('usr.col.contact') || 'CONTACT'}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('usr.col.role') || 'ROLE'}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('usr.col.status') || 'STATUS'}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('usr.col.join') || 'JOINED'}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('order.col.actions') || 'ACTIONS'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* 👇 5. เปลี่ยนจาก filteredUsers.map เป็น currentUsers.map เพื่อแสดงทีละหน้า */}
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200 flex items-center justify-center font-bold text-gray-600">
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{user.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider border ${
                        user.role === 'ADMIN' ? 'bg-gray-900 text-white border-gray-900' : 
                        user.role === 'STAFF' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${
                        user.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {user.status === 'Active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(user.createdAt).toLocaleDateString('th-TH')}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right relative">
                      {isAdmin && (
                        <>
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {activeDropdown === user.id && (
                            <div ref={dropdownRef} className="absolute right-8 top-10 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 animate-in fade-in zoom-in-95">
                              <button 
                                onClick={() => handleToggleStatus(user.id, user.status)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                {user.status === 'Active' ? <UserX className="w-4 h-4 text-orange-500"/> : <UserCheck className="w-4 h-4 text-green-500"/>}
                                {user.status === 'Active' ? 'ระงับบัญชี' : 'เปิดใช้งานบัญชี'}
                              </button>
                              
                              <div className="h-px bg-gray-100 my-1"></div>
                              
                              <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">เปลี่ยนสิทธิ์</div>
                              <button onClick={() => handleChangeRole(user.id, 'CUSTOMER')} className="w-full text-left px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">CUSTOMER</button>
                              <button onClick={() => handleChangeRole(user.id, 'STAFF')} className="w-full text-left px-4 py-1.5 text-sm text-blue-600 hover:bg-gray-50">STAFF</button>
                              <button onClick={() => handleChangeRole(user.id, 'ADMIN')} className="w-full text-left px-4 py-1.5 text-sm text-gray-900 font-bold hover:bg-gray-50">ADMIN</button>

                              <div className="h-px bg-gray-100 my-1"></div>
                              
                              <button 
                                onClick={() => handleDelete(user.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                ลบผู้ใช้งาน
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {currentUsers.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      ไม่พบข้อมูลผู้ใช้งาน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* 👇 6. แถบ Pagination ด้านล่างสุดของตาราง */}
        {!isLoading && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
            <div className="text-sm text-gray-500">
              แสดง <span className="font-medium text-gray-900">{startIndex + 1}</span> ถึง <span className="font-medium text-gray-900">{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</span> จากทั้งหมด <span className="font-medium text-gray-900">{filteredUsers.length}</span> รายการ
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" /> ก่อนหน้า
              </button>
              
              <div className="text-sm font-medium text-gray-600 px-2">
                {currentPage} / {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm"
              >
                ถัดไป <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal เพิ่มผู้ใช้ใหม่ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">เพิ่มผู้ใช้งานใหม่</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ - นามสกุล</label>
                <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-colors text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-colors text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-colors text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สิทธิ์การใช้งาน (Role)</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-colors text-sm cursor-pointer">
                  <option value="CUSTOMER">Customer (ลูกค้า)</option>
                  <option value="STAFF">Staff (พนักงาน)</option>
                  <option value="ADMIN">Admin (ผู้ดูแลระบบ)</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm">ยกเลิก</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors text-sm shadow-sm">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState, useEffect } from 'react';
import { Search, Shield, UserX, UserCheck, Mail, Calendar, MoreVertical, Filter, UserPlus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setUsers([
        { id: 'USR-01', name: 'สมชาย รักการอ่าน', email: 'somchai@example.com', role: 'CUSTOMER', status: 'Active', joinDate: '12/07/2026', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
        { id: 'USR-02', name: 'วิภาดา ใจดี', email: 'wipada@example.com', role: 'CUSTOMER', status: 'Active', joinDate: '14/07/2026', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
        { id: 'USR-03', name: 'แอดมิน สูงสุด', email: 'admin@cheapter.co', role: 'ADMIN', status: 'Active', joinDate: '01/01/2026', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
        { id: 'USR-04', name: 'พนักงาน แพ็คของ', email: 'staff@cheapter.co', role: 'STAFF', status: 'Suspended', joinDate: '10/06/2026', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d' },
      ]);
      setIsLoading(false);
    }, 400);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">{t('usr.title')}</h2>
          <p className="text-gray-500 mt-1">{t('usr.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder={t('usr.search')} className="pl-9 pr-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg outline-none focus:border-gray-900 font-medium shadow-sm w-72" />
          </div>
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" />
            {t('order.filter')}
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            {t('usr.add')}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
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
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('usr.col.user')}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('usr.col.contact')}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('usr.col.role')}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('usr.col.status')}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('usr.col.join')}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('order.col.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{user.id}</p>
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
                        {user.joinDate}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
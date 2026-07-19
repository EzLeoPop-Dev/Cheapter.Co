// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, Ticket, AlertCircle, Clock, CheckCircle2, MoreVertical, SearchX } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminTicketsPage() {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setTickets([
        { id: 'TCK-20260714-01', subject: 'ได้รับหนังสือไม่ครบ', message: 'สั่งซื้อ Boxset ไป แต่ในกล่องไม่มีของแถมที่เป็นการ์ดใสครับ รบกวนตรวจสอบให้ด้วยครับ', customer: 'สมชาย รักการอ่าน', orderId: 'ORD-001', date: '14/07/2026 14:30', status: 'เปิด' },
        { id: 'TCK-20260713-02', subject: 'ขอเปลี่ยนที่อยู่จัดส่ง', message: 'พอดีพิมพ์ที่อยู่ผิดตอนสั่งซื้อครับ ขอเปลี่ยนจากคอนโดเป็นบ้านแทนครับ', customer: 'ณเดชน์ สุดหล่อ', orderId: 'ORD-003', date: '13/07/2026 09:15', status: 'รอดำเนินการ' },
        { id: 'TCK-20260710-03', subject: 'ชำระเงินแล้วแต่สถานะไม่อัปเดต', message: 'โอนเงินและแนบสลิปไปตั้งแต่เมื่อวาน แต่สถานะยังเป็นรอชำระเงินอยู่เลยครับ', customer: 'วิภาดา ใจดี', orderId: 'ORD-002', date: '10/07/2026 11:20', status: 'ปิดแล้ว' },
      ]);
      setIsLoading(false);
    }, 400);
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setTickets(tickets.map(tk => tk.id === id ? { ...tk, status: newStatus } : tk));
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'เปิด': return 'bg-red-50 text-red-700 border-red-200';
      case 'รอดำเนินการ': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'ปิดแล้ว': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'เปิด': return <AlertCircle className="w-3 h-3" />;
      case 'รอดำเนินการ': return <Clock className="w-3 h-3" />;
      case 'ปิดแล้ว': return <CheckCircle2 className="w-3 h-3" />;
      default: return <Ticket className="w-3 h-3" />;
    }
  };

  const getTranslatedStatus = (status) => {
    switch (status) {
      case 'เปิด': return t('tck.status.open');
      case 'รอดำเนินการ': return t('tck.status.progress');
      case 'ปิดแล้ว': return t('tck.status.close');
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">{t('tck.title')}</h2>
          <p className="text-gray-500 mt-1">{t('tck.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder={t('tck.search')} className="pl-9 pr-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg outline-none focus:border-gray-900 font-medium shadow-sm w-72" />
          </div>
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" />
            {t('order.filter')}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
                <div className="text-gray-500 font-medium text-sm tracking-wide">Loading tickets...</div>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('tck.col.details')}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('tck.col.customer')}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('tck.col.date')}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('usr.col.status')}</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('order.col.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tickets.length > 0 ? tickets.map((tk) => (
                  <tr key={tk.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedTicket(tk)}>
                    <td className="py-4 px-6">
                      <div className="mb-1">
                        <span className="font-bold text-gray-900">{tk.subject}</span>
                      </div>
                      <div className="text-xs text-gray-500 font-medium max-w-sm truncate flex items-center gap-2">
                        <span className="font-mono text-gray-400 uppercase">{tk.id}</span>
                        <span>•</span>
                        {tk.message}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-700 text-sm mb-1">{tk.customer}</p>
                      <p className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md inline-block">{tk.orderId}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 font-medium whitespace-nowrap">
                      {tk.date}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider border ${getStatusColor(tk.status)}`}>
                        {getStatusIcon(tk.status)}
                        {getTranslatedStatus(tk.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedTicket(tk); }}
                        className="px-4 py-2 text-xs font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 rounded-lg transition-colors shadow-sm"
                      >
                        {t('tck.action.review')}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <SearchX className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-gray-900 font-bold mb-1">{t('tck.empty')}</h3>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{t('tck.detail.title')}</h3>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded-md border ${getStatusColor(selectedTicket.status)}`}>
                    {getTranslatedStatus(selectedTicket.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-mono font-medium">{selectedTicket.id}</p>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-gray-100"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#f8f9fa]">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('order.detail.customer')}</p>
                  <p className="font-bold text-gray-900 text-lg">{selectedTicket.customer}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('tck.detail.orderRef')}</p>
                  <p className="font-bold text-gray-900 text-lg bg-gray-50 border border-gray-200 px-3 py-1 rounded-lg inline-block">{selectedTicket.orderId}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('tck.detail.subject')}</p>
                <h4 className="font-bold text-gray-900 text-xl">{selectedTicket.subject}</h4>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[160px]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t('tck.detail.message')}</p>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedTicket.message}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-gray-100 bg-white flex items-center justify-between sticky bottom-0">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('tck.detail.updateStatus')}</span>
                <select 
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg outline-none border cursor-pointer shadow-sm transition-colors ${
                    selectedTicket.status === 'เปิด' ? 'bg-red-50 text-red-700 border-red-200' :
                    selectedTicket.status === 'รอดำเนินการ' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-green-50 text-green-700 border-green-200'
                  }`}
                >
                  <option value="เปิด">{t('tck.status.open')}</option>
                  <option value="รอดำเนินการ">{t('tck.status.progress')}</option>
                  <option value="ปิดแล้ว">{t('tck.status.close')}</option>
                </select>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md text-sm"
              >
                {t('tck.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

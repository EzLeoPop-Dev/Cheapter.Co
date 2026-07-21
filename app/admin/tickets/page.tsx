// @ts-nocheck
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Ticket, AlertCircle, Clock, CheckCircle2, MessageSquare, Send, X, Package } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function AdminTicketsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/tickets');
      const data = await res.json();
      if (Array.isArray(data)) setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      setAdminNote(selectedTicket.adminNote || '');
    }
  }, [selectedTicket]);

  const handleUpdateTicket = async (e: React.FormEvent, closeTicket = false) => {
    e.preventDefault();
    if (!adminNote.trim() && !closeTicket) return;

    if (closeTicket) {
      const confirmed = window.confirm("คุณต้องการปิด (CLOSED) Ticket นี้ใช่หรือไม่? เมื่อปิดแล้วจะไม่สามารถแก้ไขสถานะได้อีก");
      if (!confirmed) return;
    }

    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          adminNote: adminNote, 
          status: closeTicket ? 'CLOSED' : 'PENDING' 
        }),
      });
      const data = await res.json();
      
      setSelectedTicket(data);
      fetchTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (newStatus === 'CLOSED') {
      const confirmed = window.confirm("คุณต้องการปิด (CLOSED) Ticket นี้ใช่หรือไม่? เมื่อปิดแล้วจะไม่สามารถแก้ไขสถานะได้อีก");
      if (!confirmed) return;
    }

    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      setSelectedTicket(data);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-50 text-red-700 border-red-200';
      case 'PENDING': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'CLOSED': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertCircle className="w-3 h-3" />;
      case 'PENDING': return <Clock className="w-3 h-3" />;
      case 'CLOSED': return <CheckCircle2 className="w-3 h-3" />;
      default: return <Ticket className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex justify-between items-end mb-4 shrink-0">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">{t('tck.title')}</h2>
          <p className="text-gray-500 mt-1">{t('tck.subtitle')}</p>
        </div>
      </div>

      <div className="flex gap-6 h-full min-h-0">
        {/* Ticket List */}
        <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm flex-col overflow-hidden ${selectedTicket ? 'hidden lg:flex w-1/3' : 'flex flex-1'}`}>
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder={t('tck.search')} className="pl-9 pr-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg outline-none focus:border-gray-900 w-full transition-colors" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No tickets found</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {tickets.map(tk => (
                  <div 
                    key={tk.id} 
                    onClick={() => setSelectedTicket(tk)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTicket?.id === tk.id ? 'bg-gray-50 border-l-4 border-[#bc876e]' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-900 text-sm">{tk.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(tk.status)}`}>
                        {getStatusIcon(tk.status)}
                        {tk.status}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-800 text-sm truncate">{tk.subject}</h3>
                    <p className="text-xs text-gray-500 mt-1">{tk.customerName || tk.user?.name || 'Customer'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {selectedTicket ? (
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900">{selectedTicket.subject}</h3>
                <p className="text-xs text-gray-500">Ticket: {selectedTicket.id} • Customer: {selectedTicket.customerName || selectedTicket.user?.name || 'Guest'}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedTicket.status === 'OPEN' && (
                  <button 
                    onClick={() => handleChangeStatus('PENDING')}
                    className="px-3 py-1.5 text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    Start Working
                  </button>
                )}
                
                {selectedTicket.status === 'PENDING' && (
                  <button 
                    onClick={(e) => handleUpdateTicket(e, true)}
                    className="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    Mark as Resolved
                  </button>
                )}
                
                {selectedTicket.status === 'CLOSED' && (
                  <span className="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg">
                    CLOSED (แก้ไขแล้ว)
                  </span>
                )}
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stepper Status Bar */}
            <div className="px-8 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
              {['OPEN', 'PENDING', 'CLOSED'].map((step, index) => {
                const stepOrder = ['OPEN', 'PENDING', 'CLOSED'];
                const currentIndex = stepOrder.indexOf(selectedTicket.status);
                const isActive = currentIndex >= index;
                const isCurrent = currentIndex === index;
                const labels = { OPEN: 'เปิดใหม่', PENDING: 'กำลังแก้ไข', CLOSED: 'แก้ไขแล้ว' };
                
                let circleColor = 'bg-gray-100 text-gray-400';
                if (isActive) {
                  if (step === 'CLOSED') circleColor = 'bg-green-500 text-white shadow-sm';
                  else circleColor = 'bg-[#bc876e] text-white shadow-sm';
                }

                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${circleColor}`}>
                        {isActive ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                      </div>
                      <span className={`text-xs mt-2 font-medium transition-colors ${isCurrent ? 'text-gray-900 font-bold' : isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                        {labels[step as keyof typeof labels]}
                      </span>
                    </div>
                    {index < 2 && (
                      <div className="flex-1 mx-4 relative -mt-5">
                        <div className="h-1 absolute w-full bg-gray-100 rounded-full" />
                        <div 
                          className="h-1 absolute bg-[#bc876e] rounded-full transition-all duration-500" 
                          style={{ width: currentIndex > index ? '100%' : '0%' }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
              {/* Initial Ticket Message */}
              <div className="flex justify-start">
                <div className="max-w-[70%] bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedTicket.message}</p>
                  <span className="text-[10px] text-gray-400 mt-2 block">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              {selectedTicket.order && (
                <div className="flex justify-start mt-2">
                  <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                        <Package className="w-4 h-4 text-[#bc876e]" />
                        ข้อมูลคำสั่งซื้อ #{selectedTicket.orderId}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                        selectedTicket.order.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border border-green-200' :
                        selectedTicket.order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-orange-100 text-orange-700 border border-orange-200'
                      }`}>
                        สถานะ: {selectedTicket.order.status}
                      </span>
                    </div>
                    
                    <div className="p-4 flex flex-col gap-4">
                      {/* Shipping Info & Total */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">ที่อยู่สำหรับจัดส่ง:</p>
                          <p className="whitespace-pre-wrap">{selectedTicket.order.shippingAddress || 'ไม่ได้ระบุ'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">ยอดชำระสุทธิ:</p>
                          <p className="text-[#bc876e] font-bold text-lg">฿{Number(selectedTicket.order.totalAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="border-t border-gray-100 pt-3">
                        <p className="font-semibold text-gray-800 mb-2 text-sm">รายการสินค้า ({selectedTicket.order.items?.length || 0}):</p>
                        <div className="flex flex-col gap-2">
                          {selectedTicket.order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                              {item.bookImage ? (
                                <img src={item.bookImage} alt={item.bookTitle} className="w-10 h-12 object-cover rounded shadow-sm" />
                              ) : (
                                <div className="w-10 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  <span className="text-[10px] text-gray-500">No Img</span>
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.bookTitle}</p>
                                <p className="text-xs text-gray-500">
                                  ฿{Number(item.unitPrice).toLocaleString(undefined, {minimumFractionDigits: 2})} x {item.quantity}
                                </p>
                              </div>
                              <div className="text-sm font-bold text-gray-700">
                                ฿{(Number(item.unitPrice) * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2})}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Note Section instead of Messages */}
              {selectedTicket.adminNote && (
                <div className="flex justify-end mt-4">
                  <div className="max-w-[70%] bg-gray-900 text-white border border-gray-900 p-4 rounded-2xl rounded-tr-sm shadow-sm">
                    <p className="text-sm text-white whitespace-pre-wrap">{selectedTicket.adminNote}</p>
                    <span className="text-[10px] text-gray-400 mt-2 block">Admin Note</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input for Admin Note */}
            <form onSubmit={(e) => handleUpdateTicket(e, false)} className="p-4 border-t border-gray-100 bg-white">
              {selectedTicket.status === 'CLOSED' ? (
                <div className="text-center text-sm font-medium text-gray-500 py-2">
                  This ticket is closed.
                </div>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    placeholder="Update Admin Note..."
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900 transition-colors"
                    disabled={isSending}
                  />
                  <button 
                    type="submit"
                    disabled={isSending || !adminNote.trim()}
                    className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-black disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Save Note</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-900 font-bold">Select a ticket</h3>
              <p className="text-sm text-gray-500">Choose a ticket from the left to view the conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

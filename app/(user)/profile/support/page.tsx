"use client";
import React, { useState, useEffect } from 'react';
import { AlertCircle, MessageSquare, Phone, Mail, FileQuestion, CheckCircle, Clock } from 'lucide-react';
import LiveChatWidget from '@/app/components/LiveChatWidget';

export default function SupportPage() {
  const faqs = [
    { q: 'วิธีการติดตามสถานะการจัดส่งทำอย่างไร?', a: 'สามารถตรวจสอบได้ที่เมนู "ประวัติการสั่งซื้อ" และคลิกที่ "ดูรายละเอียด" ของคำสั่งซื้อที่ต้องการ' },
    { q: 'สามารถยกเลิกคำสั่งซื้อได้หรือไม่?', a: 'สามารถยกเลิกได้ภายใน 1 ชั่วโมงหลังจากทำการสั่งซื้อ โดยไปที่หน้ารายละเอียดคำสั่งซื้อ' },
    { q: 'E-book ที่ซื้อแล้วสามารถอ่านได้ที่ไหน?', a: 'สามารถอ่านได้ทันทีผ่านเว็บไซต์ที่เมนู "คลัง E-book" หรือดาวน์โหลดแอปพลิเคชันของเราบนมือถือ' }
  ];

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [formData, setFormData] = useState({ subject: 'ปัญหาการจัดส่ง', orderId: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  const fetchTickets = () => {
    fetch('/api/user/tickets')
      .then(res => res.json())
      .then(data => {
        if (data.tickets) setTickets(data.tickets);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlOrderId = params.get('orderId');
      if (urlOrderId) {
        setFormData(prev => ({ ...prev, orderId: urlOrderId }));
      }
    }

    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(console.error);
      
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const res = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSubmitStatus('success');
        setErrorMessage('');
        setFormData({ subject: 'ปัญหาการจัดส่ง', orderId: '', message: '' });
        fetchTickets(); // Refresh ticket history
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrorMessage(errorData.error || 'เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง');
        setSubmitStatus('error');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-[#bc876e]" />
          แจ้งปัญหาและติดต่อเรา
        </h2>
        
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div 
            onClick={() => setIsChatOpen(true)}
            className="bg-[#fefdfb] p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:border-[#bc876e] hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-12 h-12 bg-[#fae8df] rounded-full flex items-center justify-center mb-3">
              <MessageSquare className="h-6 w-6 text-[#bc876e]" />
            </div>
            <h3 className="font-medium text-gray-800 mb-1">Live Chat</h3>
            <p className="text-xs text-gray-500">สนทนากับเจ้าหน้าที่ (09:00 - 18:00)</p>
          </div>
          
          <div className="bg-[#fefdfb] p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:border-[#bc876e] hover:shadow-md transition-all cursor-pointer">
            <div className="w-12 h-12 bg-[#fae8df] rounded-full flex items-center justify-center mb-3">
              <Phone className="h-6 w-6 text-[#bc876e]" />
            </div>
            <h3 className="font-medium text-gray-800 mb-1">โทรศัพท์</h3>
            <p className="text-xs text-gray-500">02-123-4567 (จันทร์ - ศุกร์)</p>
          </div>
          
          <div className="bg-[#fefdfb] p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:border-[#bc876e] hover:shadow-md transition-all cursor-pointer">
            <div className="w-12 h-12 bg-[#fae8df] rounded-full flex items-center justify-center mb-3">
              <Mail className="h-6 w-6 text-[#bc876e]" />
            </div>
            <h3 className="font-medium text-gray-800 mb-1">อีเมล</h3>
            <p className="text-xs text-gray-500">support@cheapter.co</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-[#fefdfb] rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">ส่งข้อความถึงเรา</h3>
          
          {submitStatus === 'success' && (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 text-sm border border-green-200">
              <CheckCircle className="h-5 w-5" />
              ส่งข้อความสำเร็จแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุด
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">หัวข้อปัญหา</label>
              <select 
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#fefdfb] focus:outline-none focus:ring-2 focus:ring-[#bc876e] focus:border-transparent text-sm"
              >
                <option>ปัญหาการจัดส่ง</option>
                <option>ปัญหาการชำระเงิน</option>
                <option>ปัญหาเกี่ยวกับ E-book</option>
                <option>อื่นๆ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">หมายเลขคำสั่งซื้อ (ถ้ามี)</label>
              <select 
                value={formData.orderId}
                onChange={e => setFormData({...formData, orderId: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#fefdfb] focus:outline-none focus:ring-2 focus:ring-[#bc876e] focus:border-transparent text-sm"
              >
                <option value="">-- ไม่ระบุ หรือ เลือกคำสั่งซื้อ --</option>
                {orders.map(order => (
                  <option key={order.id} value={order.id}>
                    {order.id} ({new Date(order.createdAt).toLocaleDateString('th-TH')})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">รายละเอียดปัญหา</label>
              <textarea 
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                rows={4}
                required
                placeholder="กรุณาอธิบายปัญหาที่คุณพบ..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#fefdfb] focus:outline-none focus:ring-2 focus:ring-[#bc876e] focus:border-transparent text-sm resize-none"
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#bc876e] hover:bg-[#a8745d] disabled:opacity-50 text-white rounded-lg font-medium transition-colors shadow-sm mt-2"
            >
              {isSubmitting ? 'กำลังส่ง...' : 'ส่งข้อความ'}
            </button>
          </form>
        </div>

        {/* FAQ */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-gray-500" />
            คำถามที่พบบ่อย
          </h3>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-[#f9f8f6] p-4 rounded-xl">
                <h4 className="font-medium text-gray-800 text-sm mb-2">{faq.q}</h4>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ticket History */}
      {tickets.length > 0 && (
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#bc876e]" />
            ประวัติการแจ้งปัญหา
          </h3>
          <div className="space-y-4">
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-sm font-bold text-gray-900">{ticket.id}</span>
                    <h4 className="font-medium text-gray-800 mt-1">{ticket.subject}</h4>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    ticket.status === 'CLOSED' ? 'bg-green-50 text-green-700 border border-green-200' :
                    ticket.status === 'PENDING' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                    'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {ticket.status === 'CLOSED' ? 'แก้ไขแล้ว' : ticket.status === 'PENDING' ? 'กำลังดำเนินการ' : 'เปิดใหม่'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 whitespace-pre-wrap">
                  {ticket.message}
                </p>

                {ticket.adminNote && (
                  <div className="bg-[#fae8df] bg-opacity-30 p-4 rounded-xl border border-[#bc876e] border-opacity-20 ml-6">
                    <p className="text-xs font-bold text-[#bc876e] mb-1">ตอบกลับจากแอดมิน:</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{ticket.adminNote}</p>
                  </div>
                )}
                
                <div className="text-xs text-gray-400 mt-4 flex items-center gap-4">
                  <span>แจ้งเมื่อ: {new Date(ticket.createdAt).toLocaleString('th-TH')}</span>
                  {ticket.orderId && <span>อ้างอิงคำสั่งซื้อ: {ticket.orderId}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isChatOpen && <LiveChatWidget onClose={() => setIsChatOpen(false)} />}
    </div>
  );
}

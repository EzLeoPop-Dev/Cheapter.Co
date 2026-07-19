"use client";
import React, { useState } from 'react';
import { AlertCircle, MessageSquare, Phone, Mail, FileQuestion } from 'lucide-react';
import LiveChatWidget from '@/app/components/LiveChatWidget';

export default function SupportPage() {
  const faqs = [
    { q: 'วิธีการติดตามสถานะการจัดส่งทำอย่างไร?', a: 'สามารถตรวจสอบได้ที่เมนู "ประวัติการสั่งซื้อ" และคลิกที่ "ดูรายละเอียด" ของคำสั่งซื้อที่ต้องการ' },
    { q: 'สามารถยกเลิกคำสั่งซื้อได้หรือไม่?', a: 'สามารถยกเลิกได้ภายใน 1 ชั่วโมงหลังจากทำการสั่งซื้อ โดยไปที่หน้ารายละเอียดคำสั่งซื้อ' },
    { q: 'E-book ที่ซื้อแล้วสามารถอ่านได้ที่ไหน?', a: 'สามารถอ่านได้ทันทีผ่านเว็บไซต์ที่เมนู "คลัง E-book" หรือดาวน์โหลดแอปพลิเคชันของเราบนมือถือ' }
  ];

  const [isChatOpen, setIsChatOpen] = useState(false);

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
          <form className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">หัวข้อปัญหา</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#fefdfb] focus:outline-none focus:ring-2 focus:ring-[#bc876e] focus:border-transparent text-sm">
                <option>ปัญหาการจัดส่ง</option>
                <option>ปัญหาการชำระเงิน</option>
                <option>ปัญหาเกี่ยวกับ E-book</option>
                <option>อื่นๆ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">หมายเลขคำสั่งซื้อ (ถ้ามี)</label>
              <select 
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#fefdfb] focus:outline-none focus:ring-2 focus:ring-[#bc876e] focus:border-transparent text-sm"
              >
                <option value="">-- ไม่ระบุ หรือ เลือกคำสั่งซื้อ --</option>
                <option value="ORD-2023-001">ORD-2023-001 (15 ต.ค. 2023)</option>
                <option value="ORD-2023-002">ORD-2023-002 (2 พ.ย. 2023)</option>
                <option value="ORD-2023-003">ORD-2023-003 (10 ธ.ค. 2023)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">รายละเอียดปัญหา</label>
              <textarea 
                rows={4}
                placeholder="กรุณาอธิบายปัญหาที่คุณพบ..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#fefdfb] focus:outline-none focus:ring-2 focus:ring-[#bc876e] focus:border-transparent text-sm resize-none"
              ></textarea>
            </div>
            <button type="button" className="w-full py-2.5 bg-[#bc876e] hover:bg-[#a8745d] text-white rounded-lg font-medium transition-colors shadow-sm mt-2">
              ส่งข้อความ
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
      {isChatOpen && <LiveChatWidget onClose={() => setIsChatOpen(false)} />}
    </div>
  );
}

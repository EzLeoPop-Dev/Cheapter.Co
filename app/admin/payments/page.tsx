// @ts-nocheck
"use client";
import React from 'react';

export default function StaffPaymentsPage() {
  const payments = [
    { id: 'PAY-001', orderId: 'ORD-20260709-01', customer: 'สมชาย รักการอ่าน', amount: 37.99, date: '09/07/2026 10:35', method: 'PromptPay QR', bank: 'KBank', status: 'รอยืนยัน' },
    { id: 'PAY-002', orderId: 'ORD-20260709-03', customer: 'ใจดี มีตังค์', amount: 150.00, date: '09/07/2026 11:00', method: 'Bank Transfer', bank: 'SCB', status: 'รอยืนยัน' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-[#1A1A1A]">ตรวจสอบการชำระเงิน (Payment Verification)</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {payments.map((payment, idx) => (
          <div key={idx} className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/80 flex flex-col md:flex-row gap-6">
            
            {/* Slip Image Mockup */}
            <div className="w-full md:w-1/3 aspect-[3/4] bg-white/50 rounded-2xl border-2 border-dashed border-[#e6e5e0] flex items-center justify-center text-[#a09c92] group cursor-pointer hover:bg-white hover:border-primary transition-all relative overflow-hidden">
               <span className="font-bold text-sm group-hover:text-primary">ดูสลิปโอนเงิน</span>
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                 <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
               </div>
            </div>

            {/* Payment Details */}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl text-[#1A1A1A]">{payment.orderId}</h3>
                  <p className="text-sm font-medium text-[#1A1A1A] mt-1">{payment.date}</p>
                </div>
                <span className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-full border border-primary">
                  {payment.status}
                </span>
              </div>

              <div className="space-y-4 flex-1 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#a09c92] font-bold">ลูกค้า:</span>
                  <span className="font-bold text-[#1A1A1A]">{payment.customer}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#a09c92] font-bold">ช่องทาง:</span>
                  <span className="font-bold text-[#1A1A1A]">{payment.method} ({payment.bank})</span>
                </div>
                <div className="flex justify-between items-center text-sm bg-orange-50 p-4 rounded-2xl border border-primary mt-4">
                  <span className="text-primary font-bold">ยอดโอน (อ้างอิงจากระบบ):</span>
                  <span className="font-black text-primary text-xl">${payment.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors shadow-sm text-sm">
                  ยืนยันความถูกต้อง
                </button>
                <button className="flex-1 bg-white border border-[#e6e5e0] text-[#1A1A1A] hover:bg-red-50 hover:text-red-500 hover:border-red-200 font-bold py-3 rounded-xl transition-colors text-sm shadow-sm">
                  ปฏิเสธ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {payments.length === 0 && (
         <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-16 text-center border border-white/80 shadow-sm flex flex-col items-center">
           <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#e6e5e0]">
             <svg className="w-12 h-12 text-[#a09c92]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
           </div>
           <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">ไม่มีรายการรอตรวจสอบ</h3>
           <p className="text-[#1A1A1A] font-medium">คุณตรวจสอบการชำระเงินทั้งหมดเรียบร้อยแล้ว</p>
         </div>
      )}
    </div>
  );
}

// @ts-nocheck
"use client";
import React from 'react';

export default function StaffShippingPage() {
  const shipments = [
    { id: 'ORD-20260709-02', customer: 'สมศรี รักเรียน', address: '123 ถนนสุขุมวิท กทม. 10110', method: 'Standard Delivery', status: 'รอจัดส่ง' },
    { id: 'ORD-20260708-01', customer: 'มานะ ขยันอ่าน', address: '456 ถนนลาดพร้าว กทม. 10900', method: 'Express Delivery', status: 'จัดส่งแล้ว', tracking: 'TH1234567890' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-[#1A1A1A]">จัดส่งสินค้า (Shipping)</h2>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white/80 overflow-hidden">
        <div className="p-5 border-b border-[#e6e5e0] bg-white/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <input type="text" placeholder="ค้นหาด้วยเลขออเดอร์..." className="px-5 py-3 border border-[#e6e5e0] rounded-xl text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-primary bg-white/60 font-medium placeholder-[#a09c92]" />
          <button className="bg-white border border-[#e6e5e0] text-[#1A1A1A] px-6 py-3 rounded-xl text-sm font-bold hover:bg-orange-50 hover:text-primary hover:border-primary transition-all shadow-sm w-full md:w-auto">
            พิมพ์ใบปะหน้าทั้งหมด (1)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/60 border-b border-[#e6e5e0] text-xs uppercase tracking-wider text-[#a09c92] font-bold">
                <th className="p-5 w-12"><input type="checkbox" className="rounded border-[#e6e5e0] text-primary focus:ring-primary" /></th>
                <th className="p-5">Order ID</th>
                <th className="p-5">ข้อมูลจัดส่ง</th>
                <th className="p-5">รูปแบบ</th>
                <th className="p-5 text-center">สถานะ</th>
                <th className="p-5 text-center">Tracking Number</th>
                <th className="p-5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e5e0]/50">
              {shipments.map((ship, idx) => (
                <tr key={idx} className="hover:bg-white/80 transition-colors">
                  <td className="p-5"><input type="checkbox" className="rounded border-[#e6e5e0] text-primary focus:ring-primary" /></td>
                  <td className="p-5 font-bold text-[#1A1A1A]">{ship.id}</td>
                  <td className="p-5">
                    <p className="font-bold text-[15px] text-[#1A1A1A]">{ship.customer}</p>
                    <p className="text-sm font-medium text-[#1A1A1A] mt-1 max-w-[200px] truncate">{ship.address}</p>
                  </td>
                  <td className="p-5 text-sm font-bold text-[#1A1A1A]">{ship.method}</td>
                  <td className="p-5 text-center">
                    <span className={`px-4 py-1.5 text-[11px] font-bold rounded-full uppercase tracking-wider border ${
                      ship.status === 'รอจัดส่ง' ? 'bg-orange-50 text-primary border-primary' : 'bg-green-50 text-green-600 border-green-200'
                    }`}>
                      {ship.status}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    {ship.tracking ? (
                      <span className="text-sm font-black text-[#1A1A1A] tracking-widest">{ship.tracking}</span>
                    ) : (
                      <input type="text" placeholder="กรอกเลขพัสดุ" className="w-40 px-3 py-2 text-sm font-bold border border-[#e6e5e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center bg-white/60 placeholder-[#a09c92]" />
                    )}
                  </td>
                  <td className="p-5 text-center">
                    {ship.status === 'รอจัดส่ง' ? (
                      <button className="bg-primary hover:bg-primary text-white font-bold py-2 px-5 rounded-xl text-sm transition-colors shadow-sm">
                        อัปเดตจัดส่งแล้ว
                      </button>
                    ) : (
                      <button className="text-[#a09c92] hover:text-[#1A1A1A] font-bold py-2 px-5 text-sm transition-colors underline">
                        แก้ไขเลขพัสดุ
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

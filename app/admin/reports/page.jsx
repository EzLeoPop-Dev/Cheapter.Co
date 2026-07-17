"use client";
import React from 'react';

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-sm flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">รายงานเชิงลึก (Reports)</h2>
          <p className="text-[#a09c92]">วิเคราะห์ยอดขาย, สินค้าขายดี และสต็อกใกล้หมด</p>
        </div>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-white text-[#1A1A1A] border border-[#e6e5e0] hover:bg-[#F2EEE7] rounded-xl font-bold transition-colors text-sm shadow-sm">
            รายสัปดาห์
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors text-sm shadow-md">
            Export เป็น Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Report */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-sm">
          <h3 className="font-bold text-[#1A1A1A] mb-4">ยอดขายย้อนหลัง 1 สัปดาห์</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#e6e5e0]">
                  <th className="pb-2 font-bold text-[#a09c92]">วันที่</th>
                  <th className="pb-2 font-bold text-[#a09c92] text-right">จำนวนออเดอร์</th>
                  <th className="pb-2 font-bold text-[#a09c92] text-right">ยอดรวม (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e5e0]">
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="py-3 font-medium">14 ก.ค. 26</td>
                  <td className="py-3 text-right">45</td>
                  <td className="py-3 text-right text-indigo-600 font-bold">12,450</td>
                </tr>
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="py-3 font-medium">13 ก.ค. 26</td>
                  <td className="py-3 text-right">52</td>
                  <td className="py-3 text-right text-indigo-600 font-bold">14,200</td>
                </tr>
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="py-3 font-medium">12 ก.ค. 26</td>
                  <td className="py-3 text-right">38</td>
                  <td className="py-3 text-right text-indigo-600 font-bold">9,850</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Report */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-sm">
          <h3 className="font-bold text-[#1A1A1A] mb-4">รายงานสต็อกใกล้หมด</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#e6e5e0]">
                  <th className="pb-2 font-bold text-[#a09c92]">รหัสสินค้า</th>
                  <th className="pb-2 font-bold text-[#a09c92]">ชื่อหนังสือ</th>
                  <th className="pb-2 font-bold text-[#a09c92] text-right">คงเหลือ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e5e0]">
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="py-3 text-[#a09c92]">BK-1029</td>
                  <td className="py-3 font-medium text-red-500">Atomic Habits (ฉบับแปลไทย)</td>
                  <td className="py-3 text-right font-bold text-red-500">2 เล่ม</td>
                </tr>
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="py-3 text-[#a09c92]">BK-2041</td>
                  <td className="py-3 font-medium text-red-500">มังงะ ดาบพิฆาตอสูร เล่ม 23</td>
                  <td className="py-3 text-right font-bold text-red-500">5 เล่ม</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

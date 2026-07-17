"use client";

import React, { useState } from 'react';
import { Package, Search, Calendar, ChevronRight, FileText } from 'lucide-react';

const TABS = [
  'ทั้งหมด',
  'รอชำระเงิน',
  'ที่ต้องจัดส่ง',
  'เตรียมการจัดส่ง',
  'อยู่ระหว่างการจัดส่ง',
  'สำเร็จ',
  'ถูกยกเลิก',
  'การคืนเงิน/คืนสินค้า'
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('ทั้งหมด');
  
  const mockOrders = [
    {
      id: 'ORD-2023-001',
      date: '15 ก.ค. 2026',
      total: '450.00',
      status: 'สำเร็จ',
      statusColor: 'text-green-600 bg-green-50',
      items: [
        { title: 'The Great Gatsby', qty: 1, price: '250.00' },
        { title: '1984', qty: 1, price: '200.00' }
      ]
    },
    {
      id: 'ORD-2023-002',
      date: '10 ก.ค. 2026',
      total: '890.00',
      status: 'อยู่ระหว่างการจัดส่ง',
      statusColor: 'text-blue-600 bg-blue-50',
      items: [
        { title: 'Sapiens: A Brief History of Humankind', qty: 1, price: '890.00' }
      ]
    },
    {
      id: 'ORD-2023-003',
      date: '1 ก.ค. 2026',
      total: '320.00',
      status: 'ถูกยกเลิก',
      statusColor: 'text-red-600 bg-red-50',
      items: [
        { title: 'The Catcher in the Rye', qty: 1, price: '320.00' }
      ]
    }
  ];

  const filteredOrders = activeTab === 'ทั้งหมด' 
    ? mockOrders 
    : mockOrders.filter(order => order.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">ประวัติการสั่งซื้อ</h2>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="ค้นหาหมายเลขคำสั่งซื้อ..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#bc876e] focus:border-transparent text-sm"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="bg-[#fefdfb] rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-100 bg-white">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-[#bc876e] text-[#bc876e]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List or Empty State */}
        {filteredOrders.length > 0 ? (
          <div>
            {filteredOrders.map((order, index) => (
              <div key={order.id} className={`p-6 ${index !== filteredOrders.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-5 w-5 text-[#bc876e]" />
                      <span className="font-medium text-gray-800">คำสั่งซื้อ {order.id}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>สั่งซื้อเมื่อ {order.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${order.statusColor}`}>
                      {order.status}
                    </span>
                    <div className="mt-2 text-lg font-semibold text-gray-800">
                      ฿{order.total}
                    </div>
                  </div>
                </div>

                <div className="bg-[#f9f8f6] rounded-lg p-4 mt-4">
                  <h4 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">รายการสินค้า</h4>
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.title} <span className="text-gray-400">x{item.qty}</span></span>
                        <span className="font-medium text-gray-600">฿{item.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4 flex justify-end items-center gap-4">
                  {order.status === 'สำเร็จ' && (
                    <button className="px-5 py-2 text-sm bg-[#bc876e] text-white rounded-lg hover:bg-[#a8745d] font-medium transition-colors shadow-sm">
                      รีวิวสินค้า
                    </button>
                  )}
                  <button className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    ดูรายละเอียด <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-gray-50/50">
            <div className="w-16 h-16 bg-[#fae8df] rounded-full flex items-center justify-center mb-4">
              <FileText className="h-7 w-7 text-[#bc876e]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">ยังไม่มีคำสั่งซื้อในสถานะนี้</h3>
            <p className="text-sm text-gray-500">เมื่อคุณสั่งซื้อสินค้า รายการจะมาแสดงที่นี่</p>
          </div>
        )}
      </div>
    </div>
  );
}

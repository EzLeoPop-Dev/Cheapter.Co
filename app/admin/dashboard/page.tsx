"use client";
import React, { useEffect, useState } from 'react';
import { TrendingUp, ShoppingCart, Users, ArrowUpRight, ArrowDownRight, Package, ChevronRight, BookOpen } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const [range, setRange] = useState('30days');
  const [data, setData] = useState({
    stats: [],
    chartData: [],
    topProducts: [],
    recentOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 อัปเดต Array ไอคอน ให้รับกับข้อมูล: ยอดขาย, ออเดอร์, ผู้ใช้ใหม่, ออเดอร์รอจัดการ (Package)
  const statIcons = [TrendingUp, ShoppingCart, Users, Package];

  const fetchDashboardData = async (selectedRange: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard?range=${selectedRange}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(range);
  }, [range]);

  const handleExport = () => {
    if (!data.topProducts || data.topProducts.length === 0) return alert("No data to export");
    
    const headers = ["Product Name", "Price (THB)", "Sold Quantity"];
    const rows = data.topProducts.map((p: any) => `"${p.name}",${p.price},${p.sold}`);
    const csvContent = [headers.join(","), ...rows].join("\n");
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); 
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `dashboard_report_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[10px] font-bold">รอชำระเงิน</span>;
      case 'VERIFYING': return <span className="bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-md text-[10px] font-bold">ตรวจสอบชำระเงิน</span>;
      case 'PREPARING': return <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-md text-[10px] font-bold">เตรียมจัดส่ง</span>;
      case 'SHIPPING': return <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[10px] font-bold">กำลังจัดส่ง</span>;
      case 'COMPLETED': return <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-md text-[10px] font-bold">สำเร็จ</span>;
      default: return <span className="bg-gray-50 text-gray-500 px-2.5 py-1 rounded-md text-[10px] font-bold">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[#bc876e] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-gray-500 font-medium tracking-wide">กำลังเตรียมข้อมูล Dashboard...</div>
        </div>
      </div>
    );
  }

  const { stats, chartData, topProducts, recentOrders } = data;

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">แผงควบคุม (Dashboard)</h2>
          <p className="text-gray-500 mt-1">สรุปสถานะร้านค้าและสิ่งที่ต้องดำเนินการ</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="flex-1 md:flex-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-4 py-2 outline-none focus:border-[#bc876e] font-medium cursor-pointer shadow-sm"
          >
            <option value="7days">7 วันล่าสุด</option>
            <option value="30days">30 วันล่าสุด</option>
            <option value="thisMonth">เดือนปัจจุบัน</option>
            <option value="thisYear">ปีนี้</option>
          </select>
          <button 
            onClick={handleExport}
            className="px-5 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm text-sm whitespace-nowrap"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* 🌟 Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat: any, idx: number) => {
          const Icon = statIcons[idx];
          const isAlert = stat.isAlert;

          return (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-6">
                {/* เปลี่ยนสีแจ้งเตือนเป็นสีส้ม */}
                <div className={`p-2.5 rounded-xl ${isAlert ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-700'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {stat.isUp !== null && stat.isUp !== undefined ? (
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${stat.isUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.percent}
                  </div>
                ) : (
                  <div className={`text-xs font-bold px-2 py-1 rounded-md ${isAlert ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-500'}`}>
                    {stat.percent}
                  </div>
                )}
              </div>
              <div>
                {/* 🌟 แก้ตรงนี้ ดึง defaultTitle มาโชว์ตรงๆ เลย ไม่ต้องผ่านไฟล์แปลภาษาแล้ว */}
                <h3 className="text-gray-500 font-medium text-sm mb-1">
                  {stat.defaultTitle}
                </h3>
                <span className={`text-3xl font-black tracking-tight ${isAlert ? 'text-orange-600' : 'text-gray-900'}`}>
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Chart Section: ยอดขายรายวัน */}
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900">ยอดขายรายวัน</h3>
              <p className="text-sm text-gray-500 mt-1">ความเคลื่อนไหวยอดขายในช่วงเวลาที่เลือก</p>
            </div>
          </div>
          
          <div className="flex-1 w-full h-full min-h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `฿${value}`} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`฿${Number(value).toLocaleString()}`, 'ยอดขาย']}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 6, 6]}>
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.revenue > 0 ? "#111827" : "#e5e7eb"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">ไม่มีข้อมูลยอดขายในช่วงนี้</div>
            )}
          </div>
        </div>

        {/* Column ขวา: Top Products */}
        <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#bc876e]" /> สินค้าขายดี
            </h3>
          </div>
          <div className="space-y-5 flex-1">
            {topProducts && topProducts.length > 0 ? topProducts.map((book: any, i: number) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4 min-w-0 pr-4">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-400 border border-gray-100 group-hover:bg-[#bc876e] group-hover:text-white transition-colors">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate block" title={book.name}>{book.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">฿{book.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{book.sold}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ขายแล้ว (เล่ม)</p>
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-400 text-center py-8">ไม่มีข้อมูลการขายในช่วงนี้</div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" /> ออเดอร์ล่าสุด
            </h3>
            <p className="text-sm text-gray-500 mt-1">รายการคำสั่งซื้อที่เพิ่งเข้ามาในระบบ</p>
          </div>
          <Link href="/admin/orders" className="text-sm font-bold text-[#bc876e] hover:text-[#9c6a51] flex items-center gap-1 transition-colors">
            จัดการออเดอร์ทั้งหมด <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">รหัสออเดอร์</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">ลูกค้า</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">วันที่</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">ยอดรวม</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders && recentOrders.length > 0 ? recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">{order.id}</td>
                  <td className="py-4 px-6 text-gray-600">{order.customer}</td>
                  <td className="py-4 px-6 text-gray-500">{order.date}</td>
                  <td className="py-4 px-6 font-bold text-gray-900">฿{order.amount.toLocaleString()}</td>
                  <td className="py-4 px-6 text-right">
                    {getStatusBadge(order.status)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">ยังไม่มีออเดอร์ล่าสุด</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  FileSpreadsheet, CalendarDays, PieChart as PieChartIcon, 
  TrendingUp, Download, Receipt, Coins, Layers, PackageSearch, AlertTriangle, PackageX, Boxes, BookHeart
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";

// --- Types ---
type SalesData = {
  summary: { totalRevenue: number; totalDiscount: number; netRevenue: number; totalOrders: number; };
  trendData: { date: string; orders: number; revenue: number; discount: number }[];
  paymentData: { name: string; value: number; color: string }[];
  categoryData: { name: string; revenue: number }[];
};

type InventoryData = {
  summary: { totalTitles: number; totalItemsInStock: number; lowStockCount: number; outOfStockCount: number; };
  problemBooks: { id: number; title: string; stock: number; status: string; price: number }[];
};

type ReportResponse = {
  salesData: SalesData;
  inventoryData: InventoryData;
};

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<"sales" | "inventory">("sales");
  const [range, setRange] = useState("30days");
  const [data, setData] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeGrouping, setTimeGrouping] = useState<"day" | "month">("day");

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/reports?range=${range}`);
        if (res.ok) {
          setData(await res.json());
          if (range === "thisYear") setTimeGrouping("month");
          else setTimeGrouping("day");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReportData();
  }, [range]);

  const processedTrendData = useMemo(() => {
    if (!data?.salesData) return [];
    if (timeGrouping === "day") return data.salesData.trendData;

    const grouped: Record<string, any> = {};
    data.salesData.trendData.forEach(row => {
      const monthStr = row.date.substring(0, 7);
      if (!grouped[monthStr]) grouped[monthStr] = { date: monthStr, orders: 0, revenue: 0, discount: 0 };
      grouped[monthStr].orders += row.orders;
      grouped[monthStr].revenue += row.revenue;
      grouped[monthStr].discount += row.discount;
    });
    return Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [data, timeGrouping]);

  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = "\uFEFF"; // BOM for Thai language

    if (activeTab === "sales") {
      if (processedTrendData.length === 0) return alert("ไม่มีข้อมูลยอดขายให้ Export");
      const dateHeader = timeGrouping === "month" ? "เดือน (Month)" : "วันที่ (Date)";
      const headers = [dateHeader, "จำนวนคำสั่งซื้อ (Orders)", "ส่วนลด (Discount)", "ยอดขายสุทธิ (Net Revenue)"];
      const rows = processedTrendData.map(r => `${r.date},${r.orders},${r.discount},${r.revenue}`);
      rows.push("", `รวมทั้งหมด (Total),${data.salesData.summary.totalOrders},${data.salesData.summary.totalDiscount},${data.salesData.summary.totalRevenue}`);
      csvContent += [headers.join(","), ...rows].join("\n");
    } else {
      if (data.inventoryData.problemBooks.length === 0) return alert("สต็อกปกติ ไม่มีข้อมูลให้ Export");
      const headers = ["รหัสหนังสือ (ID)", "ชื่อหนังสือ (Title)", "คงเหลือ (Stock)", "สถานะ (Status)", "ราคา (Price)"];
      const rows = data.inventoryData.problemBooks.map(b => `${b.id},"${b.title}",${b.stock},${b.status},${b.price}`);
      csvContent += [headers.join(","), ...rows].join("\n");
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" }); 
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${activeTab}_report_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val: number) => `฿${val.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[#bc876e] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-gray-500 font-medium">กำลังโหลดรายงาน...</div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-20 text-gray-500">ไม่สามารถโหลดข้อมูลได้</div>;

  const { salesData, inventoryData } = data;
  const displayPaymentData = salesData.paymentData.map(p => p.name === 'เก็บปลายทาง' ? { ...p, color: '#eab308' } : p);

  return (
    <div className="space-y-6 pb-12">
      
      {/* 🌟 Header & Global Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">รายงานข้อมูลร้านค้า</h2>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> ดูสถิติเชิงลึกเพื่อการวางแผนธุรกิจ
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {activeTab === "sales" && (
            <select 
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="flex-1 md:flex-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-4 py-2 outline-none focus:border-[#bc876e] font-medium shadow-sm"
            >
              <option value="7days">7 วันย้อนหลัง</option>
              <option value="30days">30 วันย้อนหลัง</option>
              <option value="thisMonth">เดือนปัจจุบัน</option>
              <option value="thisYear">ปีนี้ทั้งหมด</option>
            </select>
          )}
          <button 
            onClick={handleExportCSV}
            className="px-5 py-2 bg-[#bc876e] text-white rounded-lg font-semibold hover:bg-[#a3725b] transition-colors shadow-sm text-sm whitespace-nowrap flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* 🌟 Tabs Menu */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab("sales")}
          className={`py-3 px-6 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'sales' ? 'border-[#bc876e] text-[#bc876e]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          <TrendingUp className="w-4 h-4" /> ยอดขาย (Sales)
        </button>
        <button 
          onClick={() => setActiveTab("inventory")}
          className={`py-3 px-6 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-[#bc876e] text-[#bc876e]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          <Boxes className="w-4 h-4" /> สต็อกสินค้า (Inventory)
        </button>
      </div>

      {/* ========================================================
          TAB 1: SALES REPORT (รายงานยอดขาย)
      ======================================================== */}
      {activeTab === "sales" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center shrink-0">
                <Receipt className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">ยอดขายก่อนหักส่วนลด (Gross)</p>
                <h3 className="text-2xl font-black text-gray-900">{formatCurrency(salesData.summary.totalRevenue + salesData.summary.totalDiscount)}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">ส่วนลดทั้งหมด (Discounts)</p>
                <h3 className="text-2xl font-black text-red-600">-{formatCurrency(salesData.summary.totalDiscount)}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                <Coins className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">ยอดขายสุทธิ (Net Revenue)</p>
                <h3 className="text-2xl font-black text-green-600">{formatCurrency(salesData.summary.totalRevenue)}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* Area Chart: Revenue Trend */}
            <div className="lg:col-span-2 bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col min-h-[380px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#bc876e]" /> แนวโน้มยอดขายสุทธิ
                </h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setTimeGrouping('day')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${timeGrouping === 'day' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>รายวัน</button>
                  <button onClick={() => setTimeGrouping('month')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${timeGrouping === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>รายเดือน</button>
                </div>
              </div>
              <div className="flex-1 w-full">
                {processedTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processedTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#111827" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} tickFormatter={(val) => { if (timeGrouping === 'month') { return new Date(val + '-01').toLocaleDateString('th-TH', { month: 'short', year: '2-digit' }); } return `${new Date(val).getDate()}/${new Date(val).getMonth()+1}`; }}/>
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6' }} labelFormatter={(val) => { if (timeGrouping === 'month') return new Date(val as string + '-01').toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }); return new Date(val as string).toLocaleDateString('th-TH', { dateStyle: 'long' }); }} formatter={(value: any) => [`฿${Number(value).toLocaleString()}`, 'ยอดขายสุทธิ']} />
                      <Area type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">ไม่มีข้อมูลในช่วงเวลานี้</div>
                )}
              </div>
            </div>

            {/* Sales by Category */}
            <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col min-h-[380px]">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#bc876e]" /> สัดส่วนหมวดหมู่
              </h3>
              <p className="text-xs text-gray-500 mb-6">หมวดหมู่ที่ทำรายได้สูงสุด</p>
              <div className="flex-1 w-full">
                {salesData.categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData.categoryData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }} width={80} />
                      <RechartsTooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6' }} formatter={(value: any) => [`฿${Number(value).toLocaleString()}`, 'รายได้']} />
                      <Bar dataKey="revenue" fill="#111827" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400 text-sm">ไม่มีข้อมูล</div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* Payment Methods */}
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex-1 flex flex-col items-center justify-center min-h-[300px]">
              <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2 self-start w-full">
                <PieChartIcon className="w-4 h-4 text-[#bc876e]" /> ช่องทางชำระเงิน
              </h3>
              <div className="w-full h-[180px] relative mt-4">
                {displayPaymentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={displayPaymentData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={5} dataKey="value">
                        {displayPaymentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: any) => `฿${Number(value).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400 text-xs">ไม่มีข้อมูล</div>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {displayPaymentData.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                    {p.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Data Table */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-gray-400" />
                <h3 className="text-base font-bold text-gray-900">ตารางสรุปรายได้</h3>
              </div>
              <div className="overflow-x-auto max-h-[300px] custom-scrollbar flex-1">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 shadow-sm">
                    <tr>
                      <th className="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">{timeGrouping === 'month' ? 'เดือน' : 'วันที่'}</th>
                      <th className="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">จำนวนออเดอร์</th>
                      <th className="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">ส่วนลด</th>
                      <th className="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">ยอดขายสุทธิ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {processedTrendData.length > 0 ? processedTrendData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6 font-medium text-gray-900">
                          {timeGrouping === 'month' ? new Date(row.date + '-01').toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }) : new Date(row.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-6 text-gray-600 text-right">{row.orders.toLocaleString()}</td>
                        <td className="py-3 px-6 text-red-500 text-right">-{row.discount.toLocaleString()}</td>
                        <td className="py-3 px-6 font-bold text-gray-900 text-right">฿{row.revenue.toLocaleString()}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="py-8 text-center text-gray-400">ไม่มีข้อมูลในช่วงเวลานี้</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: INVENTORY REPORT (รายงานสต็อกสินค้า)
      ======================================================== */}
      {activeTab === "inventory" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><BookHeart className="w-4 h-4" /></div>
                <p className="text-sm font-medium text-gray-500">จำนวนปกทั้งหมด</p>
              </div>
              <h3 className="text-2xl font-black text-gray-900">{inventoryData.summary.totalTitles.toLocaleString()} ปก</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><PackageSearch className="w-4 h-4" /></div>
                <p className="text-sm font-medium text-gray-500">รวมหนังสือในคลัง</p>
              </div>
              <h3 className="text-2xl font-black text-gray-900">{inventoryData.summary.totalItemsInStock.toLocaleString()} เล่ม</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-200 bg-orange-50/30 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><AlertTriangle className="w-4 h-4" /></div>
                <p className="text-sm font-medium text-orange-800">ใกล้หมด (Low Stock)</p>
              </div>
              <h3 className="text-2xl font-black text-orange-600">{inventoryData.summary.lowStockCount.toLocaleString()} รายการ</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200 bg-red-50/30 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg text-red-600"><PackageX className="w-4 h-4" /></div>
                <p className="text-sm font-medium text-red-800">หมดสต็อก (Out of Stock)</p>
              </div>
              <h3 className="text-2xl font-black text-red-600">{inventoryData.summary.outOfStockCount.toLocaleString()} รายการ</h3>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" /> สินค้าที่ต้องเติมสต็อกด่วน
                </h3>
                <p className="text-sm text-gray-500 mt-1">รายการหนังสือที่สถานะใกล้หมด หรือ หมดสต็อกแล้ว</p>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 shadow-sm">
                  <tr>
                    <th className="py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider w-16">ID</th>
                    <th className="py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">ชื่อหนังสือ</th>
                    <th className="py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">ราคา</th>
                    <th className="py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">คงเหลือ</th>
                    <th className="py-4 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inventoryData.problemBooks.length > 0 ? inventoryData.problemBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-gray-500 font-medium">#{book.id}</td>
                      <td className="py-4 px-6 font-bold text-gray-900 max-w-[300px] truncate" title={book.title}>{book.title}</td>
                      <td className="py-4 px-6 text-gray-600 text-right">฿{book.price.toLocaleString()}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${book.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                          {book.stock}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {book.status === 'OutOfStock' ? (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-50 text-red-600">หมดสต็อก</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-orange-50 text-orange-600">ใกล้หมด</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <Boxes className="w-12 h-12 mb-3 text-gray-300" />
                          <p className="font-medium text-gray-500">สต็อกสินค้าปลอดภัยดี 🎉</p>
                          <p className="text-xs mt-1">ไม่มีรายการที่ต้องเติมสต็อกในขณะนี้</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}} />
    </div>
  );
}
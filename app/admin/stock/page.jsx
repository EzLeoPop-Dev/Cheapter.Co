"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Search, PackagePlus, AlertTriangle, CheckCircle2, Box, Filter, Package, DollarSign, BarChart3, X, Plus, Minus, ArrowUpDown, History, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminStockPage() {
  const { t } = useLanguage();
  const [stock, setStock] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Adjustment Modal State
  const [adjustModal, setAdjustModal] = useState(null);
  const [adjustType, setAdjustType] = useState('add');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  // Movement Log Drawer
  const [logDrawer, setLogDrawer] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setStock([
        { id: 'BK-001', name: 'แฮร์รี่ พอตเตอร์ เล่ม 1', category: 'วรรณกรรม', cost: 250, price: 395, current: 15, reserved: 2, available: 13, reorderPoint: 10, lastUpdate: '14/07/2026', status: 'In Stock',
          logs: [
            { date: '14/07/2026 10:30', type: 'IN', qty: 100, ref: 'PO-2607-001', by: 'Admin', balance: 115 },
            { date: '13/07/2026 14:00', type: 'OUT', qty: -2, ref: 'ORD-004', by: 'System', balance: 15 },
            { date: '10/07/2026 09:00', type: 'ADJUST', qty: -3, ref: 'ตรวจนับสต็อก', by: 'Admin', balance: 17 },
          ]
        },
        { id: 'BK-002', name: 'ปรมาจารย์ลัทธิมาร เล่ม 1', category: 'มังงะ', cost: 300, price: 450, current: 5, reserved: 1, available: 4, reorderPoint: 10, lastUpdate: '14/07/2026', status: 'Low Stock',
          logs: [
            { date: '14/07/2026 10:30', type: 'IN', qty: 50, ref: 'PO-2607-001', by: 'Admin', balance: 55 },
            { date: '12/07/2026 18:00', type: 'OUT', qty: -1, ref: 'ORD-002', by: 'System', balance: 5 },
          ]
        },
        { id: 'BK-003', name: 'Boxset จูจูทสึ ไคเซ็น', category: 'มังงะ', cost: 800, price: 1200, current: 0, reserved: 0, available: 0, reorderPoint: 5, lastUpdate: '12/07/2026', status: 'Out of Stock',
          logs: [
            { date: '10/07/2026 12:00', type: 'OUT', qty: -5, ref: 'ORD-001', by: 'System', balance: 0 },
          ]
        },
        { id: 'BK-004', name: 'คิดแบบยิว', category: 'การเงิน', cost: 200, price: 300, current: 50, reserved: 5, available: 45, reorderPoint: 15, lastUpdate: '14/07/2026', status: 'In Stock',
          logs: [
            { date: '14/07/2026 11:00', type: 'IN', qty: 30, ref: 'PO-2606-003', by: 'Admin', balance: 50 },
          ]
        },
        { id: 'BK-005', name: 'The Psychology of Money', category: 'การเงิน', cost: 180, price: 295, current: 120, reserved: 10, available: 110, reorderPoint: 20, lastUpdate: '13/07/2026', status: 'In Stock',
          logs: [
            { date: '13/07/2026 09:00', type: 'IN', qty: 120, ref: 'PO-2606-002', by: 'Admin', balance: 120 },
          ]
        },
        { id: 'BK-006', name: 'Atomic Habits', category: 'พัฒนาตนเอง', cost: 220, price: 350, current: 8, reserved: 3, available: 5, reorderPoint: 10, lastUpdate: '12/07/2026', status: 'Low Stock',
          logs: [
            { date: '12/07/2026 16:00', type: 'OUT', qty: -2, ref: 'ORD-005', by: 'System', balance: 8 },
          ]
        },
      ]);
      setIsLoading(false);
    }, 400);
  }, []);

  // Summary Cards
  const summaryCards = useMemo(() => {
    const totalSku = stock.length;
    const totalValue = stock.reduce((acc, s) => acc + (s.cost * s.current), 0);
    const lowCount = stock.filter(s => s.status === 'Low Stock').length;
    const outCount = stock.filter(s => s.status === 'Out of Stock').length;
    return { totalSku, totalValue, lowCount, outCount };
  }, [stock]);

  // Filtered stock
  const filteredStock = useMemo(() => {
    let result = stock;
    if (activeTab === 'inStock') result = result.filter(s => s.status === 'In Stock');
    else if (activeTab === 'low') result = result.filter(s => s.status === 'Low Stock');
    else if (activeTab === 'out') result = result.filter(s => s.status === 'Out of Stock');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    }
    return result;
  }, [stock, activeTab, searchQuery]);

  // Adjustment Logic
  const openAdjustModal = (item) => {
    setAdjustModal(item);
    setAdjustType('add');
    setAdjustQty('');
    setAdjustReason('');
  };

  const handleSaveAdjust = () => {
    if (!adjustQty || !adjustReason.trim()) return;
    const qty = parseInt(adjustQty);
    if (isNaN(qty) || qty <= 0) return;

    setStock(prev => prev.map(item => {
      if (item.id !== adjustModal.id) return item;
      let newCurrent = item.current;
      let logQty = 0;
      if (adjustType === 'add') { newCurrent += qty; logQty = qty; }
      else if (adjustType === 'remove') { newCurrent = Math.max(0, newCurrent - qty); logQty = -Math.min(qty, item.current); }
      else { logQty = qty - newCurrent; newCurrent = qty; }
      
      const newAvailable = Math.max(0, newCurrent - item.reserved);
      let newStatus = 'In Stock';
      if (newCurrent <= 0) newStatus = 'Out of Stock';
      else if (newAvailable <= item.reorderPoint) newStatus = 'Low Stock';

      const newLog = {
        date: new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        type: 'ADJUST',
        qty: logQty,
        ref: adjustReason,
        by: 'Admin',
        balance: newCurrent
      };
      return { ...item, current: newCurrent, available: newAvailable, status: newStatus, lastUpdate: new Date().toLocaleDateString('th-TH'), logs: [newLog, ...item.logs] };
    }));
    setAdjustModal(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return 'bg-green-50 text-green-700 border-green-200';
      case 'Low Stock': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Out of Stock': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'In Stock': return <CheckCircle2 className="w-3 h-3" />;
      case 'Low Stock': return <AlertTriangle className="w-3 h-3" />;
      case 'Out of Stock': return <AlertTriangle className="w-3 h-3" />;
      default: return <Box className="w-3 h-3" />;
    }
  };

  const getLogTypeStyle = (type) => {
    switch (type) {
      case 'IN': return 'bg-green-50 text-green-700 border-green-200';
      case 'OUT': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ADJUST': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'DAMAGED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">{t('stk.title')}</h2>
          <p className="text-gray-500 mt-1">{t('stk.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/stock/receive" className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm text-sm flex items-center gap-2">
            <PackagePlus className="w-4 h-4" />
            {t('stk.new')}
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: t('stk.card.totalSku'), value: summaryCards.totalSku, icon: Package, color: 'text-gray-700', bg: 'bg-gray-50' },
          { title: t('stk.card.totalValue'), value: `฿${summaryCards.totalValue.toLocaleString()}`, icon: DollarSign, color: 'text-gray-700', bg: 'bg-gray-50' },
          { title: t('stk.card.lowAlert'), value: summaryCards.lowCount, icon: AlertTriangle, color: 'text-yellow-700', bg: 'bg-yellow-50', border: summaryCards.lowCount > 0 ? 'border-yellow-200' : '' },
          { title: t('stk.card.outOfStock'), value: summaryCards.outCount, icon: Box, color: 'text-red-600', bg: 'bg-red-50', border: summaryCards.outCount > 0 ? 'border-red-200' : '' },
        ].map((card, idx) => (
          <div key={idx} className={`bg-white border ${card.border || 'border-gray-200'} p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] group`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 ${card.bg} rounded-xl ${card.color} group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <p className={`text-2xl font-black mt-1 ${card.color === 'text-gray-700' ? 'text-gray-900' : card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Tabs + Search Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 px-2 pt-2 bg-gray-50/50">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { key: 'all', label: t('stk.tab.all') },
              { key: 'inStock', label: t('stk.tab.inStock') },
              { key: 'low', label: t('stk.tab.low') },
              { key: 'out', label: t('stk.tab.out') }
            ].map(tab => (
              <button 
                key={tab.key} 
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === tab.key ? 'border-gray-900 text-gray-900 bg-white rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-t-xl'
                }`}
              >
                {tab.label}
                {tab.key === 'low' && summaryCards.lowCount > 0 && <span className="ml-1.5 text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold">{summaryCards.lowCount}</span>}
                {tab.key === 'out' && summaryCards.outCount > 0 && <span className="ml-1.5 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">{summaryCards.outCount}</span>}
              </button>
            ))}
          </div>
          <div className="relative pr-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder={t('stk.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg outline-none focus:border-gray-900 font-medium shadow-sm w-64" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
                <div className="text-gray-500 font-medium text-sm tracking-wide">Loading inventory...</div>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-white">
                  <th className="py-3.5 px-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('stk.col.product')}</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('stk.col.category')}</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('stk.col.cost')}</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('stk.col.price')}</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{t('stk.col.inStock')}</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{t('stk.col.reserved')}</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{t('stk.col.available')}</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{t('stk.col.reorder')}</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('usr.col.status')}</th>
                  <th className="py-3.5 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('order.col.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStock.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-3.5 px-5">
                      <button onClick={() => setLogDrawer(item)} className="text-left hover:opacity-70 transition-opacity">
                        <span className="font-bold text-gray-900 block">{item.name}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.id}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-600 font-medium">{item.category}</td>
                    <td className="py-3.5 px-4 text-sm text-gray-500 font-mono text-right">฿{item.cost}</td>
                    <td className="py-3.5 px-4 text-sm text-gray-900 font-bold font-mono text-right">฿{item.price}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-gray-700">{item.current}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-orange-500">{item.reserved}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-black ${item.available > 0 ? 'text-gray-900' : 'text-red-500'}`}>{item.available}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-sm font-medium ${item.available <= item.reorderPoint ? 'text-orange-600' : 'text-gray-400'}`}>{item.reorderPoint}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openAdjustModal(item)} className="px-3 py-1.5 text-xs font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 rounded-lg transition-colors shadow-sm inline-flex items-center gap-1.5">
                          <Settings2 className="w-3 h-3" />
                          {t('stk.action.add')}
                        </button>
                        <button onClick={() => setLogDrawer(item)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200" title="Movement Log">
                          <History className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isLoading && filteredStock.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold mb-1">No Items Found</h3>
              <p className="text-sm text-gray-500">No products match this filter or search.</p>
            </div>
          )}
        </div>
      </div>

      {/* ==================== STOCK ADJUSTMENT MODAL ==================== */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={() => setAdjustModal(null)}>
          <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden border border-gray-100" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-gray-900">{t('stk.adjust.title')}</h3>
                <p className="text-sm text-gray-500 font-medium mt-0.5">{adjustModal.name} <span className="font-mono text-gray-400">({adjustModal.id})</span></p>
              </div>
              <button onClick={() => setAdjustModal(null)} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Current Stock Display */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                <span className="text-sm font-bold text-gray-500">{t('stk.adjust.current')}</span>
                <span className="text-2xl font-black text-gray-900">{adjustModal.current}</span>
              </div>

              {/* Type Selection */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t('stk.adjust.type')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'add', label: t('stk.adjust.add'), icon: Plus, color: 'text-green-600 bg-green-50 border-green-200' },
                    { key: 'remove', label: t('stk.adjust.remove'), icon: Minus, color: 'text-red-600 bg-red-50 border-red-200' },
                    { key: 'set', label: t('stk.adjust.set'), icon: ArrowUpDown, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                  ].map(opt => (
                    <button key={opt.key} onClick={() => setAdjustType(opt.key)} className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      adjustType === opt.key ? `${opt.color} shadow-sm` : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
                    }`}>
                      <opt.icon className="w-4 h-4 mx-auto mb-1" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t('stk.adjust.qty')}</label>
                <input type="number" min="0" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} placeholder="0" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-center text-2xl font-black text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-shadow" />
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t('stk.adjust.reason')} <span className="text-red-500">*</span></label>
                <input type="text" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder={t('stk.adjust.reasonPh')} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow" />
              </div>

              {/* Preview */}
              {adjustQty && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">New Stock:</span>
                  <span className="text-xl font-black text-gray-900">
                    {adjustType === 'add' ? adjustModal.current + (parseInt(adjustQty) || 0) :
                     adjustType === 'remove' ? Math.max(0, adjustModal.current - (parseInt(adjustQty) || 0)) :
                     parseInt(adjustQty) || 0}
                  </span>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button onClick={() => setAdjustModal(null)} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                {t('stk.adjust.cancel')}
              </button>
              <button onClick={handleSaveAdjust} disabled={!adjustQty || !adjustReason.trim()} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-md disabled:opacity-40">
                {t('stk.adjust.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MOVEMENT LOG DRAWER ==================== */}
      {logDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/40 backdrop-blur-sm" onClick={() => setLogDrawer(null)}>
          <div className="bg-white w-full max-w-lg shadow-2xl flex flex-col h-full border-l border-gray-200" onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-black text-gray-900">{t('stk.log.title')}</h3>
                <p className="text-sm font-bold text-gray-500 mt-1">{logDrawer.name} <span className="font-mono text-gray-400">({logDrawer.id})</span></p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-widest">{t('stk.col.inStock')}</span>
                    <span className="text-lg font-black text-gray-900">{logDrawer.current}</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-widest">{t('stk.col.available')}</span>
                    <span className="text-lg font-black text-gray-900">{logDrawer.available}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setLogDrawer(null)} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {logDrawer.logs && logDrawer.logs.length > 0 ? logDrawer.logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border flex-shrink-0 ${getLogTypeStyle(log.type)}`}>
                      {log.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-black text-sm ${log.qty >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {log.qty >= 0 ? `+${log.qty}` : log.qty}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">{t('stk.log.balance')}: {log.balance}</span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium truncate">{t('stk.log.ref')}: {log.ref}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-gray-400 font-medium">{log.date}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{t('stk.log.by')}: {log.by}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 text-gray-400 text-sm">No movement history</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Box, Minus, Package, PackagePlus, Plus, Search, Settings2, X } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

const statusLabel = { InStock: 'In Stock', LowStock: 'Low Stock', OutOfStock: 'Out of Stock' };

export default function AdminStockPage() {
  const { t } = useLanguage();
  const [stock, setStock] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustModal, setAdjustModal] = useState(null);
  const [logDrawer, setLogDrawer] = useState(null);
  const [adjustType, setAdjustType] = useState('add');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadStock = async () => {
      try {
        const response = await fetch('/api/admin/stock');
        if (!response.ok) throw new Error('Unable to load stock');
        setStock(await response.json());
      } catch {
        setError('ไม่สามารถโหลดข้อมูลสต๊อกจากฐานข้อมูลได้');
      } finally {
        setIsLoading(false);
      }
    };
    loadStock();
  }, []);

  const summary = useMemo(() => ({
    total: stock.length,
    value: stock.reduce((total, item) => total + item.price * item.current, 0),
    low: stock.filter((item) => item.status === 'LowStock').length,
    out: stock.filter((item) => item.status === 'OutOfStock').length,
  }), [stock]);

  const filteredStock = useMemo(() => stock.filter((item) => {
    const matchesTab = activeTab === 'all' || (activeTab === 'inStock' && item.status === 'InStock') || (activeTab === 'low' && item.status === 'LowStock') || (activeTab === 'out' && item.status === 'OutOfStock');
    const query = searchQuery.toLowerCase();
    return matchesTab && (!query || item.name.toLowerCase().includes(query) || String(item.id).includes(query));
  }), [stock, activeTab, searchQuery]);

  const openAdjust = (item) => {
    setAdjustModal(item);
    setAdjustType('add');
    setAdjustQty('');
    setAdjustReason('');
  };

  const saveAdjustment = async () => {
    const quantity = Number(adjustQty);
    if (!Number.isInteger(quantity) || quantity < 0 || !adjustReason.trim()) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/stock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: adjustModal.id, quantity, mode: adjustType, reason: adjustReason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'ไม่สามารถบันทึกสต๊อกได้');
      setStock((items) => items.map((item) => item.id === adjustModal.id ? { ...item, ...data, logs: [data.log, ...item.logs] } : item));
      setAdjustModal(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ไม่สามารถบันทึกสต๊อกได้');
    } finally {
      setIsSaving(false);
    }
  };

  const projectedStock = adjustModal && (adjustType === 'add' ? adjustModal.current + (Number(adjustQty) || 0) : adjustType === 'remove' ? adjustModal.current - (Number(adjustQty) || 0) : Number(adjustQty) || 0);
  const statusClass = (status) => status === 'InStock' ? 'bg-green-50 text-green-700 border-green-200' : status === 'LowStock' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200';

  return <div className="space-y-6">
    <div className="flex justify-between items-end"><div><h2 className="text-3xl font-black tracking-tight text-gray-900">{t('stk.title')}</h2><p className="text-gray-500 mt-1">{t('stk.subtitle')}</p></div><Link href="/admin/stock/receive" className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold text-sm flex items-center gap-2"><PackagePlus className="w-4 h-4" />{t('stk.new')}</Link></div>
    {error && <div className="flex justify-between items-center bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm"><span>{error}</span><button onClick={() => setError('')}><X className="w-4 h-4" /></button></div>}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">{[
      [t('stk.card.totalSku'), summary.total, Package], [t('stk.card.totalValue'), `฿${summary.value.toLocaleString()}`, Box], [t('stk.card.lowAlert'), summary.low, AlertTriangle], [t('stk.card.outOfStock'), summary.out, AlertTriangle],
    ].map(([label, value, Icon]) => <div key={label} className="bg-white border border-gray-200 p-5 rounded-2xl"><Icon className="w-5 h-5 text-gray-600 mb-3" /><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-black">{value}</p></div>)}</div>
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex justify-between items-center border-b border-gray-100 px-4 pt-2 bg-gray-50/50"><div className="flex">{[['all', t('stk.tab.all')], ['inStock', t('stk.tab.inStock')], ['low', t('stk.tab.low')], ['out', t('stk.tab.out')]].map(([key, label]) => <button key={key} onClick={() => setActiveTab(key)} className={`px-4 py-3 text-sm font-bold border-b-2 ${activeTab === key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'}`}>{label}</button>)}</div><div className="relative"><Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={t('stk.search')} className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-64" /></div></div>
      {isLoading ? <div className="h-64 flex items-center justify-center text-gray-500">Loading inventory...</div> : <div className="overflow-x-auto"><table className="w-full text-left"><thead className="text-xs text-gray-400 uppercase bg-gray-50"><tr><th className="p-4">{t('stk.col.product')}</th><th className="p-4">{t('stk.col.category')}</th><th className="p-4 text-center">{t('stk.col.inStock')}</th><th className="p-4 text-center">{t('stk.col.available')}</th><th className="p-4 text-center">{t('stk.col.reorder')}</th><th className="p-4">{t('usr.col.status')}</th><th className="p-4" /></tr></thead><tbody>{filteredStock.map((item) => <tr key={item.id} className="border-t border-gray-100"><td className="p-4"><button onClick={() => setLogDrawer(item)} className="text-left"><b className="block">{item.name}</b><span className="text-xs text-gray-400">#{item.id}</span></button></td><td className="p-4 text-sm text-gray-600">{item.category}</td><td className="p-4 text-center font-bold">{item.current}</td><td className="p-4 text-center font-bold">{item.available}</td><td className="p-4 text-center">{item.reorderPoint}</td><td className="p-4"><span className={`inline-flex px-2 py-1 rounded border text-xs font-bold ${statusClass(item.status)}`}>{statusLabel[item.status]}</span></td><td className="p-4 text-right"><button onClick={() => openAdjust(item)} className="px-3 py-1.5 text-xs font-bold border rounded-lg inline-flex gap-1"><Settings2 className="w-3 h-3" />{t('stk.action.add')}</button></td></tr>)}</tbody></table>{filteredStock.length === 0 && <p className="text-center py-12 text-gray-500">No items found</p>}</div>}
    </div>
    {adjustModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40" onClick={() => setAdjustModal(null)}><div className="bg-white rounded-2xl w-full max-w-md" onClick={(event) => event.stopPropagation()}><div className="p-6 border-b flex justify-between"><div><h3 className="font-black text-lg">{t('stk.adjust.title')}</h3><p className="text-sm text-gray-500">{adjustModal.name}</p></div><button onClick={() => setAdjustModal(null)}><X /></button></div><div className="p-6 space-y-5"><div className="bg-gray-50 p-4 rounded-xl flex justify-between"><span>{t('stk.adjust.current')}</span><b>{adjustModal.current}</b></div><div className="grid grid-cols-3 gap-2">{[['add', t('stk.adjust.add'), Plus], ['remove', t('stk.adjust.remove'), Minus], ['set', t('stk.adjust.set'), Settings2]].map(([mode, label, Icon]) => <button key={mode} onClick={() => setAdjustType(mode)} className={`p-3 rounded-xl border text-xs font-bold ${adjustType === mode ? 'bg-gray-900 text-white' : ''}`}><Icon className="w-4 h-4 mx-auto mb-1" />{label}</button>)}</div><input type="number" min="0" value={adjustQty} onChange={(event) => setAdjustQty(event.target.value)} placeholder={t('stk.adjust.qty')} className="w-full p-3 border rounded-xl text-center text-xl font-bold" /><input value={adjustReason} onChange={(event) => setAdjustReason(event.target.value)} placeholder={t('stk.adjust.reasonPh')} className="w-full p-3 border rounded-xl" />{adjustQty && <div className={`p-3 rounded-xl ${projectedStock < 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50'}`}>New stock: <b>{Math.max(0, projectedStock)}</b></div>}</div><div className="p-4 bg-gray-50 flex justify-end gap-3"><button onClick={() => setAdjustModal(null)} className="px-4 py-2 border rounded-xl">{t('stk.adjust.cancel')}</button><button disabled={isSaving || !adjustQty || !adjustReason.trim()} onClick={saveAdjustment} className="px-4 py-2 bg-gray-900 text-white rounded-xl disabled:opacity-50">{isSaving ? 'Saving...' : t('stk.adjust.save')}</button></div></div></div>}
    {logDrawer && <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/40" onClick={() => setLogDrawer(null)}><div className="bg-white w-full max-w-lg h-full p-6 overflow-y-auto" onClick={(event) => event.stopPropagation()}><div className="flex justify-between mb-6"><div><h3 className="font-black text-lg">{t('stk.log.title')}</h3><p className="text-sm text-gray-500">{logDrawer.name}</p></div><button onClick={() => setLogDrawer(null)}><X /></button></div>{logDrawer.logs.length ? logDrawer.logs.map((log) => <div key={log.id} className="p-4 mb-3 bg-gray-50 rounded-xl border"><div className="flex justify-between"><b className={log.qty >= 0 ? 'text-green-600' : 'text-red-600'}>{log.qty >= 0 ? `+${log.qty}` : log.qty}</b><span className="text-xs">Balance: {log.balance}</span></div><p className="text-sm mt-1">{log.ref}</p><p className="text-xs text-gray-400 mt-2">{new Date(log.date).toLocaleString('th-TH')}</p></div>) : <p className="text-center text-gray-500">No movement history</p>}</div></div>}
  </div>;
}

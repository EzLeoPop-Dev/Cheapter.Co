"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useMockStore } from '../../context/MockStoreContext';
import { Search, ChevronRight, CheckCircle2, AlertTriangle, ArrowLeft, PackageCheck, Truck, ClipboardList, Printer, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function AdminStockReceivePage() {
  const { t } = useLanguage();
  const { pos, receiveStock } = useMockStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Removed local initial state for pendingPOs
  const pendingPOs = useMemo(() => pos.filter(po => po.status === 'Pending' || po.status === 'Partial'), [pos]);

  const [selectedPO, setSelectedPO] = useState(null);
  const [receiveItems, setReceiveItems] = useState([]);
  const [hasDiscrepancies, setHasDiscrepancies] = useState(false);

  // Generated after save
  const [grnNumber, setGrnNumber] = useState('');
  const [movementLogs, setMovementLogs] = useState([]);

  const filteredPOs = useMemo(() => {
    if (!searchQuery.trim()) return pendingPOs;
    const q = searchQuery.toLowerCase();
    return pendingPOs.filter(po => po.id.toLowerCase().includes(q) || po.supplier.toLowerCase().includes(q));
  }, [pendingPOs, searchQuery]);

  const handleSelectPO = (po) => {
    setSelectedPO(po);
    setReceiveItems(po.items.map(item => ({
      ...item,
      remaining: item.ordered - (item.previouslyReceived || 0),
      goodQty: item.ordered - (item.previouslyReceived || 0),
      damagedQty: 0,
      note: ''
    })));
    setStep(2);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...receiveItems];
    let val = parseInt(value) || 0;
    if (val < 0) val = 0;
    updated[index][field] = val;
    setReceiveItems(updated);
  };

  const handleNoteChange = (index, value) => {
    const updated = [...receiveItems];
    updated[index].note = value;
    setReceiveItems(updated);
  };

  const handleReview = () => {
    const hasDiff = receiveItems.some(item => (item.goodQty + item.damagedQty) !== item.remaining);
    setHasDiscrepancies(hasDiff);
    setStep(3);
  };

  // Totals for review
  const reviewTotals = useMemo(() => {
    if (receiveItems.length === 0) return { ordered: 0, good: 0, damaged: 0, totalCost: 0 };
    return {
      ordered: receiveItems.reduce((a, i) => a + i.remaining, 0),
      good: receiveItems.reduce((a, i) => a + i.goodQty, 0),
      damaged: receiveItems.reduce((a, i) => a + i.damagedQty, 0),
      totalCost: receiveItems.reduce((a, i) => a + (i.goodQty * i.cost), 0),
    };
  }, [receiveItems]);

  const handleConfirmSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      // Generate GRN
      const grn = `GRN-${Date.now().toString().slice(-8)}`;
      setGrnNumber(grn);
      
      // Save globally via context
      receiveStock(selectedPO.id, receiveItems, grn, 'Admin');

      // Set logs for display in step 4
      const now = new Date();
      const dateStr = now.toLocaleDateString('th-TH') + ' ' + now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      const logs = [];
      receiveItems.forEach(item => {
        if (item.goodQty > 0) {
          logs.push({ date: dateStr, type: 'IN', sku: item.sku, name: item.name, qty: `+${item.goodQty}`, ref: `${selectedPO.id} → ${grn}`, by: 'Admin' });
        }
        if (item.damagedQty > 0) {
          logs.push({ date: dateStr, type: 'DAMAGED', sku: item.sku, name: item.name, qty: item.damagedQty, ref: `${selectedPO.id} → ${grn}`, by: 'Admin' });
        }
      });
      setMovementLogs(logs);

      setIsSaving(false);
      setStep(4);
    }, 1200);
  };

  const poTotalValue = (po) => po.items.reduce((a, i) => a + (i.ordered * i.cost), 0);

  const renderStepper = () => (
    <div className="flex items-center justify-between max-w-3xl mx-auto mb-10">
      {[
        { num: 1, title: t('stk.receive.step1'), icon: ClipboardList },
        { num: 2, title: t('stk.receive.step2'), icon: PackageCheck },
        { num: 3, title: t('stk.receive.step3'), icon: CheckCircle2 },
        { num: 4, title: t('stk.receive.step4'), icon: Truck }
      ].map((s, i) => (
        <React.Fragment key={s.num}>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
              step >= s.num ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-400 border-2 border-dashed border-gray-200'
            }`}>
              <s.icon className="w-5 h-5" />
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
              {s.title}
            </span>
          </div>
          {i < 3 && <div className={`flex-1 h-px mx-4 ${step > s.num ? 'bg-gray-900' : 'bg-gray-200 border-t-2 border-dashed'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  // ==================== STEP 1: SELECT PO ====================
  const renderStep1 = () => (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-900 text-lg">{t('stk.receive.poList')}</h3>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder={t('stk.receive.searchPo')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg outline-none focus:border-gray-900 shadow-sm w-72" />
        </div>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('stk.receive.poNumber')}</th>
            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('stk.receive.supplier')}</th>
            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('stk.receive.expectedDate')}</th>
            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{t('stk.receive.totalItems')}</th>
            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('stk.receive.poValue')}</th>
            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filteredPOs.map(po => (
            <tr key={po.id} className="hover:bg-gray-50 transition-colors group">
              <td className="py-4 px-6 font-bold text-gray-900">
                {po.id}
                <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${po.status === 'Partial' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                  {po.status}
                </span>
              </td>
              <td className="py-4 px-6 font-semibold text-gray-700">{po.supplier}</td>
              <td className="py-4 px-6 text-sm text-gray-500 font-medium">{po.expectedDate}</td>
              <td className="py-4 px-6 text-center font-bold text-gray-900">{po.items.length}</td>
              <td className="py-4 px-6 text-right font-bold text-gray-900 font-mono">฿{poTotalValue(po).toLocaleString()}</td>
              <td className="py-4 px-6 text-right">
                <button onClick={() => handleSelectPO(po)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-end gap-2 ml-auto">
                  {t('stk.receive.actionSelect')} <ChevronRight className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ==================== STEP 2: INPUT QUANTITIES ====================
  const renderStep2 = () => (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-200 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gray-400" />
            {t('stk.receive.poNumber')}: {selectedPO.id}
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-bold text-gray-500">{selectedPO.supplier}</span>
            <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg font-mono">
              <DollarSign className="w-3.5 h-3.5 inline -mt-0.5" /> ฿{poTotalValue(selectedPO).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <div className="p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('stk.receive.item')}</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('stk.receive.unitCost')}</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{t('stk.receive.ordered')}</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center w-28">{t('stk.receive.good')}</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center w-28">{t('stk.receive.damaged')}</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{t('stk.receive.diff')}</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('stk.receive.lineTotal')}</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('stk.receive.note')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {receiveItems.map((item, index) => {
              const diff = (item.goodQty + item.damagedQty) - item.remaining;
              const lineTotal = item.goodQty * item.cost;
              return (
                <tr key={index} className="hover:bg-gray-50/50">
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{item.sku}</p>
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-gray-500 font-mono">฿{item.cost}</td>
                  <td className="py-4 px-4 text-center font-bold text-gray-700 bg-gray-50/50">
                    {item.remaining}
                    {item.previouslyReceived > 0 && (
                      <span className="block text-[10px] text-gray-400 font-medium mt-0.5">({item.previouslyReceived} received)</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <input type="number" min="0" value={item.goodQty} onChange={(e) => handleItemChange(index, 'goodQty', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-shadow" />
                  </td>
                  <td className="py-4 px-4">
                    <input type="number" min="0" value={item.damagedQty} onChange={(e) => handleItemChange(index, 'damagedQty', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-center font-bold text-red-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-black text-sm px-2 py-1 rounded-md ${diff === 0 ? 'text-gray-400' : diff < 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-gray-900 font-mono text-sm">฿{lineTotal.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <input type="text" placeholder="-" value={item.note} onChange={(e) => handleNoteChange(index, e.target.value)} className={`w-full px-3 py-2 bg-white border rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow ${diff !== 0 ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'}`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 bg-gray-50/80">
              <td colSpan="2" className="py-3 px-4 text-right text-xs font-black text-gray-500 uppercase tracking-widest">{t('stk.receive.summaryTotal')}</td>
              <td className="py-3 px-4 text-center font-black text-gray-900">{receiveItems.reduce((a,i)=>a+i.remaining,0)}</td>
              <td className="py-3 px-4 text-center font-black text-green-600">{receiveItems.reduce((a,i)=>a+i.goodQty,0)}</td>
              <td className="py-3 px-4 text-center font-black text-red-600">{receiveItems.reduce((a,i)=>a+i.damagedQty,0)}</td>
              <td className="py-3 px-4"></td>
              <td className="py-3 px-4 text-right font-black text-gray-900 font-mono">฿{receiveItems.reduce((a,i)=>a+(i.goodQty*i.cost),0).toLocaleString()}</td>
              <td className="py-3 px-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center mt-auto">
        <button onClick={() => setStep(1)} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('stk.receive.back')}
        </button>
        <button onClick={handleReview} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md flex items-center gap-2">
          {t('stk.receive.next')} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // ==================== STEP 3: REVIEW & CONFIRM ====================
  const renderStep3 = () => (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-200 overflow-hidden max-w-4xl mx-auto">
      <div className="p-8 border-b border-gray-100">
        <h3 className="font-black text-gray-900 text-xl">{t('stk.receive.reviewTitle')}</h3>
        <p className="text-sm text-gray-500 mt-1">{selectedPO.id} — {selectedPO.supplier}</p>
        {hasDiscrepancies && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="text-orange-800 font-medium text-sm">{t('stk.receive.reviewWarn')}</p>
          </div>
        )}
      </div>
      <div className="p-8">
        <div className="space-y-3">
          {receiveItems.map((item, idx) => {
            const totalRec = item.goodQty + item.damagedQty;
            const diff = totalRec - item.remaining;
            return (
              <div key={idx} className={`p-5 rounded-xl border ${diff !== 0 ? 'bg-orange-50/50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{item.sku} · ฿{item.cost}/unit</p>
                    {item.note && <p className="text-xs text-orange-600 mt-1">📝 {item.note}</p>}
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('stk.receive.ordered')}</p>
                      <p className="font-bold text-gray-900 mt-1">{item.remaining}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{t('stk.receive.good')}</p>
                      <p className="font-black text-green-600 mt-1">+{item.goodQty}</p>
                    </div>
                    {item.damagedQty > 0 && (
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{t('stk.receive.damaged')}</p>
                        <p className="font-black text-red-500 mt-1">{item.damagedQty}</p>
                      </div>
                    )}
                    {diff !== 0 && (
                      <div className="text-center bg-white px-3 py-1.5 rounded-lg border border-orange-100 shadow-sm">
                        <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{t('stk.receive.diff')}</p>
                        <p className={`font-black mt-0.5 ${diff < 0 ? 'text-orange-600' : 'text-red-600'}`}>{diff > 0 ? `+${diff}` : diff}</p>
                      </div>
                    )}
                    <div className="text-center pl-4 border-l border-gray-200">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('stk.receive.lineTotal')}</p>
                      <p className="font-black text-gray-900 mt-1 font-mono">฿{(item.goodQty * item.cost).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Total */}
        <div className="mt-6 p-5 bg-gray-900 rounded-xl text-white flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('stk.receive.good')}</p>
              <p className="font-black text-xl text-green-400">{reviewTotals.good}</p>
            </div>
            {reviewTotals.damaged > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('stk.receive.damaged')}</p>
                <p className="font-black text-xl text-red-400">{reviewTotals.damaged}</p>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('stk.receive.summaryTotal')}</p>
            <p className="font-black text-2xl font-mono">฿{reviewTotals.totalCost.toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <button onClick={() => setStep(2)} disabled={isSaving} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('stk.receive.back')}
        </button>
        <button onClick={handleConfirmSave} disabled={isSaving} className="px-8 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2">
          {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CheckCircle2 className="w-4 h-4" />}
          {t('stk.receive.confirmBtn')}
        </button>
      </div>
    </div>
  );

  // ==================== STEP 4: SUCCESS ====================
  const renderStep4 = () => (
    <div className="max-w-2xl mx-auto mt-8 space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-white shadow-xl">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">{t('stk.receive.successTitle')}</h2>
        <p className="text-gray-500">{t('stk.receive.successSub')}</p>
      </div>

      {/* GRN Summary Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('stk.receive.grnNumber')}</p>
            <p className="font-black text-gray-900 text-lg font-mono mt-1">{grnNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('stk.receive.poNumber')}</p>
            <p className="font-bold text-gray-700 mt-1">{selectedPO.id} — {selectedPO.supplier}</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{t('stk.receive.good')}</p>
              <p className="font-black text-2xl text-green-700 mt-1">{reviewTotals.good}</p>
            </div>
            {reviewTotals.damaged > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{t('stk.receive.damaged')}</p>
                <p className="font-black text-2xl text-red-600 mt-1">{reviewTotals.damaged}</p>
              </div>
            )}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('stk.receive.summaryTotal')}</p>
              <p className="font-black text-2xl text-gray-900 mt-1 font-mono">฿{reviewTotals.totalCost.toLocaleString()}</p>
            </div>
          </div>

          {/* Movement Log Preview */}
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Movement Logs Generated</h4>
          <div className="space-y-2">
            {movementLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md border ${log.type === 'IN' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {log.type}
                </span>
                <span className="font-semibold text-gray-700 truncate flex-1">{log.name}</span>
                <span className={`font-black ${log.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>{log.type === 'IN' ? log.qty : `-${log.qty}`}</span>
                <span className="text-xs text-gray-400 font-mono">{log.ref}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Link href="/admin/stock" className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
          {t('stk.receive.backToStock')}
        </Link>
        <button className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md flex items-center gap-2">
          <Printer className="w-4 h-4" />
          {t('stk.receive.printGrn')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/stock" className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-gray-900 rounded-full transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">{t('stk.receive.title')}</h2>
          <p className="text-gray-500 mt-1">{t('stk.receive.subtitle')}</p>
        </div>
      </div>

      {step < 4 && renderStepper()}

      {isLoading && step < 2 ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
            <div className="text-gray-500 font-medium tracking-wide text-sm">Loading Data...</div>
          </div>
        </div>
      ) : (
        <>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </>
      )}
    </div>
  );
}

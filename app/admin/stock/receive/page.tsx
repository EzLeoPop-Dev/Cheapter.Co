// @ts-nocheck
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Search, ChevronRight, CheckCircle2, AlertTriangle, ArrowLeft, PackageCheck, Truck, ClipboardList, Printer, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function AdminStockReceivePage() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allPOs, setAllPOs] = useState<any[]>([]);

  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [receiveItems, setReceiveItems] = useState<any[]>([]);
  const [hasDiscrepancies, setHasDiscrepancies] = useState(false);

  const [grnNumber, setGrnNumber] = useState('');
  const [movementLogs, setMovementLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/purchase-orders');
      const data = await res.json();
      if (!data.error) setAllPOs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingPOs = useMemo(() => allPOs.filter(po => po.status === 'Pending' || po.status === 'Partial'), [allPOs]);

  const filteredPOs = useMemo(() => {
    if (!searchQuery.trim()) return pendingPOs;
    const q = searchQuery.toLowerCase();
    return pendingPOs.filter(po => po.id.toLowerCase().includes(q) || po.supplier.toLowerCase().includes(q));
  }, [pendingPOs, searchQuery]);

  const handleSelectPO = (po: any) => {
    setSelectedPO(po);
    setReceiveItems(po.items.map((item: any) => ({
      ...item,
      bookId: item.bookId,
      title: item.book?.title || 'Unknown',
      image: item.book?.image,
      remaining: item.ordered - (item.received || 0),
      goodQty: item.ordered - (item.received || 0),
      damagedQty: 0,
      note: ''
    })));
    setStep(2);
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const updated = [...receiveItems];
    let val = parseInt(value) || 0;
    if (val < 0) val = 0;
    updated[index][field] = val;
    setReceiveItems(updated);
  };

  const handleNoteChange = (index: number, value: string) => {
    const updated = [...receiveItems];
    updated[index].note = value;
    setReceiveItems(updated);
  };

  const handleReview = () => {
    const hasDiff = receiveItems.some(item => (item.goodQty + item.damagedQty) !== item.remaining);
    setHasDiscrepancies(hasDiff);
    setStep(3);
  };

  const reviewTotals = useMemo(() => {
    if (receiveItems.length === 0) return { ordered: 0, good: 0, damaged: 0, totalCost: 0 };
    return {
      ordered: receiveItems.reduce((a, i) => a + i.remaining, 0),
      good: receiveItems.reduce((a, i) => a + i.goodQty, 0),
      damaged: receiveItems.reduce((a, i) => a + i.damagedQty, 0),
      totalCost: receiveItems.reduce((a, i) => a + (i.goodQty * Number(i.unitCost)), 0),
    };
  }, [receiveItems]);

  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/purchase-orders/${selectedPO.id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receivedItems: receiveItems.map(item => ({
            bookId: item.bookId,
            goodQty: item.goodQty,
            damagedQty: item.damagedQty,
            note: item.note
          })),
          performedBy: 'Admin'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to receive stock');
      }

      const grn = `GRN-${Date.now().toString().slice(-8)}`;
      setGrnNumber(grn);

      const now = new Date();
      const dateStr = now.toLocaleDateString('th-TH') + ' ' + now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      const logs: any[] = [];
      receiveItems.forEach(item => {
        if (item.goodQty > 0) {
          logs.push({ date: dateStr, type: 'IN', title: item.title, qty: `+${item.goodQty}`, ref: `${selectedPO.id} → ${grn}`, by: 'Admin' });
        }
        if (item.damagedQty > 0) {
          logs.push({ date: dateStr, type: 'DAMAGED', title: item.title, qty: item.damagedQty, ref: `${selectedPO.id} → ${grn}`, by: 'Admin' });
        }
      });
      setMovementLogs(logs);
      setStep(4);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to save received stock.');
    } finally {
      setIsSaving(false);
    }
  };

  const poTotalValue = (po: any) => po.items.reduce((a: number, i: any) => a + (i.ordered * Number(i.unitCost)), 0);

  const renderStepper = () => (
    <div className="flex items-center justify-between max-w-3xl mx-auto mb-10">
      {[
        { num: 1, title: 'เลือก PO', icon: ClipboardList },
        { num: 2, title: 'ตรวจรับ', icon: PackageCheck },
        { num: 3, title: 'ยืนยัน', icon: CheckCircle2 },
        { num: 4, title: 'เสร็จสิ้น', icon: Printer }
      ].map((s, idx) => (
        <React.Fragment key={s.num}>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
              step >= s.num ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400'
            }`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className={`text-xs font-bold mt-2 ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>{s.title}</p>
          </div>
          {idx < 3 && <div className={`flex-1 h-0.5 mx-2 mt-[-12px] rounded ${step > s.num ? 'bg-gray-900' : 'bg-gray-200'}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/admin/stock" className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-gray-900 rounded-full transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">รับสินค้าเข้าคลัง</h2>
          <p className="text-gray-500 mt-1">เลือกใบสั่งซื้อ (PO) ที่ต้องการรับสินค้า</p>
        </div>
      </div>

      {renderStepper()}

      {/* Step 1: Select PO */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="ค้นหาใบสั่งซื้อ..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900"
              />
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : filteredPOs.length === 0 ? (
              <div className="p-8 text-center text-gray-400">ไม่มีใบสั่งซื้อที่รอรับสินค้า</div>
            ) : (
              filteredPOs.map(po => (
                <button key={po.id} onClick={() => handleSelectPO(po)} className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                  <div>
                    <p className="font-bold text-gray-900 font-mono">{po.id}</p>
                    <p className="text-sm text-gray-500">{po.supplier} · {po.items.length} รายการ · ฿{poTotalValue(po).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                      po.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>{po.status === 'Pending' ? 'รอรับ' : 'รับบางส่วน'}</span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Step 2: Input received quantities */}
      {step === 2 && selectedPO && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-900 font-mono text-lg">{selectedPO.id}</p>
              <p className="text-sm text-gray-500">{selectedPO.supplier}</p>
            </div>
            <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-900 font-medium">← เลือก PO อื่น</button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">รายการ</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">คงเหลือรับ</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">ดี</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">ชำรุด</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {receiveItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-12 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                        {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-center font-bold text-gray-500">{item.remaining}</td>
                  <td className="py-3 px-6 text-center">
                    <input type="number" min="0" max={item.remaining} value={item.goodQty} onChange={e => handleItemChange(idx, 'goodQty', e.target.value)}
                      className="w-16 px-2 py-1.5 text-center bg-green-50 border border-green-200 rounded-lg text-sm font-mono focus:outline-none focus:border-green-600"
                    />
                  </td>
                  <td className="py-3 px-6 text-center">
                    <input type="number" min="0" value={item.damagedQty} onChange={e => handleItemChange(idx, 'damagedQty', e.target.value)}
                      className="w-16 px-2 py-1.5 text-center bg-red-50 border border-red-200 rounded-lg text-sm font-mono focus:outline-none focus:border-red-600"
                    />
                  </td>
                  <td className="py-3 px-6">
                    <input type="text" placeholder="หมายเหตุ..." value={item.note} onChange={e => handleNoteChange(idx, e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-6 border-t border-gray-100 flex justify-end">
            <button onClick={handleReview} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2">
              ตรวจสอบ <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Confirm */}
      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-black text-gray-900">ตรวจสอบก่อนยืนยัน</h3>
            {hasDiscrepancies && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800 font-medium">มีรายการที่จำนวนไม่ตรงกับที่คาดหวัง</p>
              </div>
            )}
          </div>
          <div className="p-6 grid grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
              <p className="text-2xl font-black text-gray-900">{reviewTotals.ordered}</p>
              <p className="text-xs text-gray-500 font-bold mt-1">คาดว่ารับ</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center border border-green-100">
              <p className="text-2xl font-black text-green-700">{reviewTotals.good}</p>
              <p className="text-xs text-green-600 font-bold mt-1">สภาพดี</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl text-center border border-red-100">
              <p className="text-2xl font-black text-red-700">{reviewTotals.damaged}</p>
              <p className="text-xs text-red-600 font-bold mt-1">ชำรุด</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
              <p className="text-2xl font-black text-blue-700">฿{reviewTotals.totalCost.toLocaleString()}</p>
              <p className="text-xs text-blue-600 font-bold mt-1">มูลค่ารับ</p>
            </div>
          </div>
          <div className="p-6 border-t border-gray-100 flex justify-between">
            <button onClick={() => setStep(2)} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50">← แก้ไข</button>
            <button onClick={handleConfirmSave} disabled={isSaving}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              ยืนยันรับสินค้า
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === 4 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 text-center border-b border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-1">รับสินค้าเสร็จสิ้น!</h3>
            <p className="text-gray-500 text-sm">GRN: <span className="font-mono font-bold">{grnNumber}</span></p>
          </div>
          {movementLogs.length > 0 && (
            <div className="p-6">
              <h4 className="text-sm font-bold text-gray-700 mb-3">📋 ประวัติการเคลื่อนไหว</h4>
              <div className="space-y-2">
                {movementLogs.map((log, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl text-sm ${log.type === 'IN' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${log.type === 'IN' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{log.type}</span>
                    <span className="font-medium text-gray-800">{log.title}</span>
                    <span className="font-mono font-bold ml-auto">{log.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="p-6 border-t border-gray-100 flex justify-center gap-4">
            <Link href="/admin/stock" className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50">กลับหน้าคลังสินค้า</Link>
            <button onClick={() => { setStep(1); setSelectedPO(null); fetchPOs(); }} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800">รับสินค้า PO อื่น</button>
          </div>
        </div>
      )}
    </div>
  );
}

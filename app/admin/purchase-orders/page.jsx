"use client";
import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useMockStore } from '../context/MockStoreContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, FileText, CheckCircle, Clock, XCircle, AlertCircle, Eye } from 'lucide-react';
import Link from 'next/link';

export default function PurchaseOrdersPage() {
  const { t } = useLanguage();
  const { pos, updatePO } = useMockStore();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleStatusChange = (poId, newStatus) => {
    updatePO(poId, { status: newStatus });
  };

  const filteredPOs = useMemo(() => {
    let result = pos;
    if (activeTab !== 'all') {
      result = result.filter(po => po.status.toLowerCase() === activeTab);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(po => po.id.toLowerCase().includes(q) || po.supplier.toLowerCase().includes(q));
    }
    return result;
  }, [pos, activeTab, searchQuery]);

  const renderStatus = (po) => {
    if (user?.role === 'ADMIN') {
      return (
        <select
          value={po.status}
          onChange={(e) => handleStatusChange(po.id, e.target.value)}
          className={`text-[10px] font-bold rounded-md uppercase tracking-wider border outline-none px-2 py-1 cursor-pointer transition-colors ${
            po.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
            po.status === 'Partial' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' :
            po.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' :
            po.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
            'bg-gray-50 text-gray-700 border-gray-200'
          }`}
        >
          <option value="Pending">รอรับสินค้า</option>
          <option value="Partial">รับบางส่วน</option>
          <option value="Completed">เสร็จสิ้น</option>
          <option value="Cancelled">ยกเลิก</option>
        </select>
      );
    }
    
    switch(po.status) {
      case 'Pending':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-200"><Clock className="w-3 h-3" /> รอรับสินค้า</span>;
      case 'Partial':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200"><AlertCircle className="w-3 h-3" /> รับบางส่วน</span>;
      case 'Completed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider border bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3" /> เสร็จสิ้น</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider border bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3" /> ยกเลิก</span>;
      default:
        return <span>{po.status}</span>;
    }
  };

  const calculateTotal = (po) => {
    return po.items.reduce((sum, item) => sum + (item.ordered * item.cost), 0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">{t('po.title')}</h2>
          <p className="text-gray-500 mt-1">{t('po.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/purchase-orders/new" className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('po.add')}
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 px-2 pt-2 bg-gray-50/50 gap-4 sm:gap-0">
          <div className="flex overflow-x-auto scrollbar-hide w-full sm:w-auto">
            {[
              { key: 'all', label: t('po.filter.all') },
              { key: 'pending', label: t('po.filter.pending') },
              { key: 'partial', label: t('po.filter.partial') },
              { key: 'completed', label: t('po.filter.completed') },
              { key: 'cancelled', label: t('po.filter.cancelled') }
            ].map(tab => (
              <button 
                key={tab.key} 
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3.5 text-sm font-bold border-b-2 whitespace-nowrap transition-all flex-1 sm:flex-none ${
                  activeTab === tab.key 
                    ? 'border-gray-900 text-gray-900 bg-white rounded-t-xl' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-t-xl'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-auto px-4 sm:px-0 sm:pr-4 pb-4 sm:pb-0">
            <Search className="w-4 h-4 absolute left-7 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('po.search')} 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm rounded-xl outline-none focus:border-gray-900 font-medium shadow-sm w-full sm:w-72 transition-shadow" 
            />
          </div>
        </div>

        {/* PO List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('po.col.id')}</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('po.col.supplier')}</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{t('po.col.date')}</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('po.col.total')}</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{t('po.col.status')}</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('po.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPOs.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 font-mono">{po.id}</p>
                        <p className="text-xs text-gray-500 font-medium">{po.items.length} รายการ</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-700">{po.supplier}</p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <p className="text-sm font-medium text-gray-900">{po.created_at}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">รับ: {po.expectedDate}</p>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-gray-900 font-mono text-sm">
                    ฿{calculateTotal(po).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {renderStatus(po)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPOs.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold mb-1">No Purchase Orders Found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

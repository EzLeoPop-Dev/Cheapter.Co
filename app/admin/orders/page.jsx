"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Printer, ExternalLink, PackageCheck, Eye, CreditCard, Box, Truck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminOrdersPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSlip, setShowSlip] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [printOrder, setPrintOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setOrders([
        {
          id: 'ORD-001', customer: 'สมชาย รักการอ่าน', customerPhone: '0891234567', date: '14/07/2026', amount: 450, status: 'รอชำระเงิน',
          address: '123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กทม. 10110', shippingMethod: 'EMS',
          items: [{ name: 'แฮร์รี่ พอตเตอร์ เล่ม 1', price: 395, qty: 1 }],
          subtotal: 395, shippingFee: 55, discount: 0, promo: '-',
          paymentMethod: 'โอนเงินผ่านธนาคาร', paymentTime: '-'
        },
        {
          id: 'ORD-002', customer: 'วิภาดา ใจดี', customerPhone: '0812345678', date: '14/07/2026', amount: 890, status: 'ตรวจสอบชำระเงิน',
          address: '45/6 หมู่ 2 ต.บางรัก อ.เมือง จ.เชียงใหม่ 50000', shippingMethod: 'Kerry Express',
          items: [{ name: 'ปรมาจารย์ลัทธิมาร เล่ม 1', price: 450, qty: 1 }, { name: 'ปรมาจารย์ลัทธิมาร เล่ม 2', price: 450, qty: 1 }],
          subtotal: 900, shippingFee: 40, discount: 50, promo: 'FLASH50',
          paymentMethod: 'โอนเงินผ่านธนาคาร', paymentTime: '14/07/2026 10:15',
          slipUrl: 'https://placehold.co/400x600/f3f4f6/111827?text=Payment+Slip'
        },
        {
          id: 'ORD-003', customer: 'ณเดชน์ สุดหล่อ', customerPhone: '0898765432', date: '13/07/2026', amount: 1200, status: 'รอจัดส่ง',
          address: '88 คอนโดหรู ถ.สาทร แขวงยานนาวา เขตสาทร กทม. 10120', shippingMethod: 'Kerry Express',
          items: [{ name: 'Boxset จูจูทสึ ไคเซ็น', price: 1200, qty: 1 }],
          subtotal: 1200, shippingFee: 0, discount: 0, promo: 'FREESHIP',
          paymentMethod: 'บัตรเครดิต', paymentTime: '13/07/2026 15:30'
        },
        {
          id: 'ORD-004', customer: 'ญาญ่า น่ารัก', customerPhone: '0854321098', date: '12/07/2026', amount: 350, status: 'จัดส่งแล้ว',
          address: '99/9 ถ.นิมมานเหมินทร์ ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200', shippingMethod: 'EMS',
          items: [{ name: 'คิดแบบยิว', price: 300, qty: 1 }],
          subtotal: 300, shippingFee: 50, discount: 0, promo: '-',
          paymentMethod: 'โอนเงินผ่านธนาคาร', paymentTime: '12/07/2026 09:45',
          slipUrl: 'https://placehold.co/400x600/f3f4f6/111827?text=Payment+Slip'
        }
      ]);
      setIsLoading(false);
    }, 400);
  }, []);

  React.useEffect(() => {
    if (printOrder) {
      setTimeout(() => {
        window.print();
      }, 100);
    }
  }, [printOrder]);

  React.useEffect(() => {
    const handleAfterPrint = () => setPrintOrder(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const updateStatus = (id, newStatus) => {
    setOrders((currentOrders) => currentOrders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'รอชำระเงิน': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'ตรวจสอบชำระเงิน': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'รอแพ็ค': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'รอจัดส่ง': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'จัดส่งแล้ว': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'รอชำระเงิน': return <CreditCard className="w-3.5 h-3.5" />;
      case 'ตรวจสอบชำระเงิน': return <Eye className="w-3.5 h-3.5" />;
      case 'รอแพ็ค': return <Box className="w-3.5 h-3.5" />;
      case 'รอจัดส่ง': return <Truck className="w-3.5 h-3.5" />;
      case 'จัดส่งแล้ว': return <CheckCircle2 className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const renderActionButtons = (order) => {
    switch (order.status) {
      case 'ตรวจสอบชำระเงิน': {
        return (
          <button onClick={() => updateStatus(order.id, 'รอแพ็ค')} className="px-4 py-2 text-xs font-bold bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors shadow-sm">
            {t('order.action.verify')}
          </button>
        );
      }
      case 'รอแพ็ค':
        return (
          <div className="flex items-center gap-2">
            <button onClick={() => setPrintOrder(order)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200" title={t('order.action.print')}>
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={() => updateStatus(order.id, 'รอจัดส่ง')} className="px-4 py-2 text-xs font-bold bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors shadow-sm">
              {t('order.action.packDone')}
            </button>
          </div>
        );
      case 'รอจัดส่ง':
        return (
          <div className="flex items-center gap-2">
             <button onClick={() => setPrintOrder(order)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200" title={t('order.action.print')}>
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={() => { setSelectedOrder(order); setTrackingInput(order.trackingNumber || ''); }} className="px-4 py-2 text-xs font-bold bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors shadow-sm flex items-center gap-2">
              <PackageCheck className="w-4 h-4" />
              {t('order.action.ship')}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const getTranslatedStatus = (status) => {
    switch (status) {
      case 'รอชำระเงิน': return t('order.tab.pending');
      case 'ตรวจสอบชำระเงิน': return t('order.tab.verify');
      case 'รอแพ็ค': return t('order.tab.processing');
      case 'รอจัดส่ง': return t('order.tab.ready');
      case 'จัดส่งแล้ว': return t('order.tab.shipped');
      default: return status;
    }
  };

  const filteredOrders = useMemo(() => activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab), [activeTab, orders]);

  return (
    <div>
      <div className="print:hidden space-y-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900">{t('order.title')}</h2>
            <p className="text-gray-500 mt-1">{t('order.subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder={t('order.search')} className="pl-9 pr-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg outline-none focus:border-gray-900 font-medium shadow-sm w-64" />
            </div>
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {t('order.filter')}
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide bg-gray-50/50 px-2 pt-2">
            {[
              { key: 'all', label: t('order.tab.all') },
              { key: 'รอชำระเงิน', label: t('order.tab.pending') },
              { key: 'ตรวจสอบชำระเงิน', label: t('order.tab.verify') },
              { key: 'รอแพ็ค', label: t('order.tab.processing') },
              { key: 'รอจัดส่ง', label: t('order.tab.ready') },
              { key: 'จัดส่งแล้ว', label: t('order.tab.shipped') }
            ].map((tab) => (
              <button 
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === tab.key ? 'border-gray-900 text-gray-900 bg-white rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-t-xl'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
                  <div className="text-gray-500 font-medium text-sm tracking-wide">Loading orders...</div>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-white">
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('order.col.id')}</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('order.col.date')}</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('order.col.customer')}</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('order.col.total')}</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('order.col.status')}</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('order.col.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group bg-white">
                      <td className="py-4 px-6 font-bold text-gray-900">{order.id}</td>
                      <td className="py-4 px-6 text-sm text-gray-500 font-medium">{order.date}</td>
                      <td className="py-4 px-6 font-semibold text-gray-700">{order.customer}</td>
                      <td className="py-4 px-6 text-sm font-black text-gray-900 text-right">฿{order.amount}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {getTranslatedStatus(order.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end items-center gap-3 whitespace-nowrap">
                          {renderActionButtons(order)}
                          <button onClick={() => setSelectedOrder(order)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!isLoading && filteredOrders.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <PackageCheck className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">{t('order.empty')}</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{t('order.detail.title')}</h3>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded-md border ${getStatusColor(selectedOrder.status)}`}>
                    {getTranslatedStatus(selectedOrder.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-mono font-medium">{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-gray-100">
                ✕
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-[#f8f9fa]">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-3 h-3" /> {t('order.detail.customer')}
                  </h4>
                  <p className="font-bold text-gray-900 text-lg mb-1">{selectedOrder.customer}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{selectedOrder.address}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                      <Truck className="w-3 h-3" /> {t('order.detail.shipMethod')}
                    </h4>
                    <p className="font-bold text-gray-900">{selectedOrder.shippingMethod}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{t('order.detail.placedOn')} {selectedOrder.date}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {selectedOrder.trackingNumber ? (
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{t('order.detail.tracking')}</span>
                        <span className="font-mono font-bold text-gray-900 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-sm block w-fit">
                          {selectedOrder.trackingNumber}
                        </span>
                      </div>
                    ) : (selectedOrder.status === 'รอจัดส่ง' || selectedOrder.status === 'รอแพ็ค') ? (
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">{t('order.detail.assignTracking')}</span>
                        <input type="text" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} placeholder="e.g. TH12345678" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-gray-900 focus:bg-white transition-colors" />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">-</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                  <Box className="w-3 h-3" /> {t('order.detail.items')}
                </h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-600 text-sm">
                          {item.qty}x
                        </div>
                        <span className="font-semibold text-gray-900">{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">฿{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.status !== 'รอชำระเงิน' && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                   <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">{t('order.detail.paymentVerified')}</h4>
                    <p className="text-sm text-gray-500 mt-1 font-medium">{t('order.detail.payMethod')} {selectedOrder.paymentMethod}</p>
                    <p className="text-sm text-gray-500 font-medium">{t('order.detail.payTime')} {selectedOrder.paymentTime}</p>
                  </div>
                  {selectedOrder.slipUrl && (
                    <button 
                      onClick={() => setShowSlip(true)} 
                      className="px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-900 rounded-xl text-sm font-bold transition-colors"
                    >
                      {t('order.detail.viewSlip')}
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            {selectedOrder.status === 'รอจัดส่ง' ? (
              <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end gap-3 sticky bottom-0">
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-colors text-sm"
                >
                  {t('order.detail.cancel')}
                </button>
                <button 
                  onClick={() => {
                    updateStatus(selectedOrder.id, 'จัดส่งแล้ว');
                    setOrders(current => current.map(o => o.id === selectedOrder.id ? {...o, trackingNumber: trackingInput} : o));
                    setSelectedOrder(null);
                  }} 
                  className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-colors text-sm shadow-md disabled:opacity-50 flex items-center gap-2"
                  disabled={!trackingInput.trim()}
                >
                  <PackageCheck className="w-4 h-4" />
                  {t('order.detail.confirmShip')}
                </button>
              </div>
            ) : (
              <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end sticky bottom-0">
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-colors text-sm shadow-md"
                >
                  {t('order.detail.done')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

       {/* Slip Image Modal */}
       {showSlip && selectedOrder?.slipUrl && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md" onClick={() => setShowSlip(false)}>
            <div className="relative max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setShowSlip(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors bg-white/10 p-2 rounded-full"
              >
                ✕
              </button>
              <img 
                src={selectedOrder.slipUrl} 
                alt="Payment Slip" 
                className="w-full h-auto rounded-2xl shadow-2xl border border-white/20 object-cover"
              />
            </div>
          </div>
        )}
      
      {/* Print Label Area - ใบปะหน้าพัสดุ */}
      {printOrder && (
        <div className="hidden print:block fixed inset-0 z-[999] bg-white text-black" style={{ width: '100vw', height: '100vh', margin: 0, padding: '1.5cm', boxSizing: 'border-box', fontFamily: "'Sarabun', 'Tahoma', sans-serif" }}>
          <div style={{ width: '14cm', border: '1px solid #000', padding: 0, position: 'relative', fontSize: '11pt' }}>
            
            {/* ===== ส่วนผู้ส่ง (Sender) ===== */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #000' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {/* Left: Sender Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '10pt' }}>ผู้ส่ง</span>
                    <span style={{ fontSize: '11pt' }}>(021111111)</span>
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>Cheapter.Co</div>
                  <div style={{ fontSize: '10pt', color: '#333', lineHeight: '1.5' }}>
                    123 ถ.สาทร แขวงยานนาวา<br />
                    เขตสาทร กทม. 10120
                  </div>
                </div>
                {/* Right: Order Info + Items */}
                <div style={{ textAlign: 'right', fontSize: '10pt', minWidth: '160px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 'bold', color: '#555' }}>#{printOrder.id.replace('ORD-', '')}</span>
                    <span style={{ fontSize: '9pt', color: '#888' }}>page1</span>
                  </div>
                  {/* Item List */}
                  <div style={{ borderTop: '1px dashed #ccc', paddingTop: '4px', marginTop: '2px' }}>
                    {printOrder.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '9pt', lineHeight: '1.6' }}>
                        <span style={{ textAlign: 'left' }}>{item.name}</span>
                        <span style={{ whiteSpace: 'nowrap' }}>{item.qty} ชิ้น</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px dashed #ccc', marginTop: '4px', paddingTop: '3px', fontSize: '9pt', color: '#555' }}>
                    สินค้า {printOrder.items.reduce((a, i) => a + i.qty, 0)} รายการ
                  </div>
                </div>
              </div>
            </div>

            {/* ===== ส่วนผู้รับ (Recipient) ===== */}
            <div style={{ padding: '12px 14px' }}>
              <div style={{ border: '2px solid #000', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '10pt', backgroundColor: '#eee', padding: '1px 8px', border: '1px solid #ccc' }}>ผู้รับ</span>
                  <span style={{ fontSize: '13pt', fontWeight: 'bold' }}>({printOrder.customerPhone || '0800000000'})</span>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '13pt', marginBottom: '2px' }}>{printOrder.customer}</div>
                <div style={{ fontSize: '11pt', lineHeight: '1.6' }}>
                  {printOrder.address}
                </div>
              </div>
            </div>

            {/* ===== ส่วนช่องทางจัดส่ง (Shipping Method) ===== */}
            <div style={{ padding: '6px 14px 10px', fontSize: '11pt' }}>
              ({printOrder.shippingMethod})
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useMockStore } from '../../context/MockStoreContext';
import { ArrowLeft, Save, Plus, Search, Trash2, Book, AlertCircle, X, Scan } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import MockBarcodeScannerModal from '../../components/MockBarcodeScannerModal';

export default function CreatePurchaseOrderPage() {
  const { t } = useLanguage();
  const { products, addProduct, addPO } = useMockStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSaving, setIsSaving] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [items, setItems] = useState([]);

  // Auto-add product from query parameter
  React.useEffect(() => {
    const preselectedProductId = searchParams?.get('product');
    if (preselectedProductId && products.length > 0) {
      const product = products.find(p => p.id === preselectedProductId);
      if (product) {
        setItems(prev => {
          if (prev.find(i => i.sku === product.sku)) return prev; // already added
          return [...prev, { sku: product.sku, name: product.name, ordered: 1, cost: product.cost || 0, previouslyReceived: 0 }];
        });
      }
    }
  }, [searchParams, products]);

  // Modals
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showQuickAddProduct, setShowQuickAddProduct] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Add Product Form
  const [quickProduct, setQuickProduct] = useState({ title: '', barcode: '', price: '' });

  const handleScanBarcode = (barcode) => {
    setQuickProduct(prev => ({ ...prev, barcode }));
  };

  // --- Search Logic ---
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q) ||
      p.barcode?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const handleAddItem = (product) => {
    if (items.find(i => i.sku === product.sku)) return; // prevent duplicate
    setItems([...items, { sku: product.sku, name: product.name, ordered: 1, cost: product.cost || 0, previouslyReceived: 0 }]);
    setShowProductSearch(false);
    setSearchQuery('');
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = Number(value);
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.ordered * item.cost), 0);
  };

  const handleQuickAddProduct = (e) => {
    e.preventDefault();
    const newSku = `SKU-QA${Math.floor(Math.random() * 1000)}`;
    const newProd = {
      id: newSku, name: quickProduct.title, barcode: quickProduct.barcode, price: Number(quickProduct.price), cost: 0,
      sku: newSku, type: 'physical', status: 'draft', cover: 'https://placehold.co/120x180/f3f4f6/111827?text=Book'
    };
    addProduct(newProd);
    
    // Select it for PO immediately
    setItems([...items, { sku: newSku, name: quickProduct.title, ordered: 1, cost: 0, previouslyReceived: 0 }]);
    
    setShowQuickAddProduct(false);
    setShowProductSearch(false);
    setQuickProduct({ title: '', barcode: '', price: '' });
  };

  const handleSavePO = (e) => {
    e.preventDefault();
    if (!supplier || items.length === 0) {
      alert("Please select a supplier and add at least one item.");
      return;
    }

    setIsSaving(true);
    const poNumber = `PO-${new Date().toISOString().slice(2,7).replace('-','')}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();
    
    const newPO = {
      id: poNumber,
      supplier,
      created_at: now.toLocaleDateString('th-TH'),
      created_by: 'Admin',
      expectedDate: expectedDate || now.toLocaleDateString('th-TH'),
      status: 'Pending',
      items: items
    };

    setTimeout(() => {
      addPO(newPO);
      setIsSaving(false);
      router.push('/admin/purchase-orders');
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 relative">
      
      {/* Product Search Modal */}
      {showProductSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-500" />
                ค้นหาหนังสือที่ต้องการสั่งซื้อ
              </h3>
              <button onClick={() => setShowProductSearch(false)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-100">
              <input 
                type="text" 
                autoFocus
                placeholder="พิมพ์ชื่อหนังสือ, SKU, หรือ บาร์โค้ด..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow" 
              />
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {filteredProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="flex items-center gap-3">
                    <img src={product.cover} alt="" className="w-10 h-14 object-cover rounded border border-gray-200" />
                    <div>
                      <p className="font-bold text-sm text-gray-900">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 rounded">{product.sku}</span>
                        {product.status === 'draft' && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 rounded uppercase tracking-wider">Draft</span>}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddItem(product)}
                    disabled={items.some(i => i.sku === product.sku)}
                    className="px-4 py-2 text-sm font-bold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {items.some(i => i.sku === product.sku) ? 'เลือกแล้ว' : 'เพิ่ม'}
                  </button>
                </div>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500 font-medium mb-3">ไม่พบหนังสือที่ค้นหา</p>
                  <button 
                    onClick={() => setShowQuickAddProduct(true)}
                    className="px-4 py-2 bg-blue-50 text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> สร้างหนังสือใหม่ด่วน (Draft)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Product Modal */}
      {showQuickAddProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Book className="w-5 h-5 text-gray-500" />
                เพิ่มหนังสือใหม่ด่วน (Quick Add)
              </h3>
              <button onClick={() => setShowQuickAddProduct(false)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleQuickAddProduct} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800 font-medium">หนังสือจะถูกสร้างในสถานะ <b>แบบร่าง (Draft)</b> และสามารถกลับไปใส่ข้อมูลรูปภาพ/รายละเอียดเพิ่มเติมได้ในภายหลัง</p>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">ชื่อหนังสือ <span className="text-red-500">*</span></label>
                <input required type="text" value={quickProduct.title} onChange={e => setQuickProduct({...quickProduct, title: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">ราคาขาย (บาท) <span className="text-red-500">*</span></label>
                <input required type="number" value={quickProduct.price} onChange={e => setQuickProduct({...quickProduct, price: e.target.value})} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900 font-mono" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">บาร์โค้ด / ISBN</label>
                <div className="relative">
                  <input type="text" value={quickProduct.barcode} onChange={e => setQuickProduct({...quickProduct, barcode: e.target.value})} className="w-full px-4 py-2 pr-10 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900 font-mono" />
                  <button 
                    type="button" 
                    onClick={() => setShowScanner(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                    title="Scan Barcode"
                  >
                    <Scan className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="pt-2">
                <button type="submit" className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
                  บันทึกและเพิ่มลงใบสั่งซื้อ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/purchase-orders" className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-gray-900 rounded-full transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900">{t('po.add')}</h2>
            <p className="text-gray-500 mt-1">ร่างใบสั่งซื้อไปยังซัพพลายเออร์</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/purchase-orders" className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
            ยกเลิก
          </Link>
          <button 
            onClick={handleSavePO}
            disabled={isSaving || items.length === 0 || !supplier}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            บันทึกใบสั่งซื้อ
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-200 p-6">
        <h3 className="text-lg font-black text-gray-900 mb-6">ข้อมูลใบสั่งซื้อ (PO Details)</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1.5">ซัพพลายเออร์ (Supplier) <span className="text-red-500">*</span></label>
            <select 
              value={supplier} 
              onChange={e => setSupplier(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow appearance-none cursor-pointer"
            >
              <option value="">-- เลือกซัพพลายเออร์ --</option>
              <option value="สำนักพิมพ์ แจ่มใส">สำนักพิมพ์ แจ่มใส</option>
              <option value="Se-ed Book Center">Se-ed Book Center</option>
              <option value="Nanmeebooks">Nanmeebooks</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1.5">วันที่คาดว่าจะได้รับ (Expected Date)</label>
            <input 
              type="date" 
              value={expectedDate} 
              onChange={e => setExpectedDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900">รายการหนังสือ (Line Items)</h3>
          <button 
            onClick={() => setShowProductSearch(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> ค้นหาหนังสือ
          </button>
        </div>
        
        <div className="overflow-x-auto min-h-[200px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest w-1/2">รายการ</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">จำนวน</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">ทุน/หน่วย</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">รวม</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center w-16">ลบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-6">
                    <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{item.sku}</p>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <input 
                      type="number" 
                      min="1"
                      value={item.ordered} 
                      onChange={e => handleItemChange(index, 'ordered', e.target.value)}
                      className="w-20 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:border-gray-900 font-mono inline-block"
                    />
                  </td>
                  <td className="py-3 px-6 text-right">
                    <input 
                      type="number" 
                      min="0"
                      value={item.cost} 
                      onChange={e => handleItemChange(index, 'cost', e.target.value)}
                      className="w-24 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:border-gray-900 font-mono inline-block"
                    />
                  </td>
                  <td className="py-3 px-6 text-right font-bold text-gray-900 font-mono text-sm">
                    ฿{(item.ordered * item.cost).toLocaleString()}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button onClick={() => handleRemoveItem(index)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400 text-sm font-medium">
                    ยังไม่มีรายการหนังสือในใบสั่งซื้อ กรุณากดปุ่ม "ค้นหาหนังสือ"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <div className="w-72">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500 font-bold text-sm">จำนวนทั้งหมด:</span>
              <span className="text-gray-900 font-bold font-mono">{items.reduce((sum, item) => sum + item.ordered, 0)} เล่ม</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-gray-900 font-black">ยอดรวมสุทธิ:</span>
              <span className="text-2xl font-black text-gray-900 font-mono tracking-tight">฿{calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      <MockBarcodeScannerModal 
        isOpen={showScanner} 
        onClose={() => setShowScanner(false)} 
        onScan={handleScanBarcode} 
      />
    </div>
  );
}

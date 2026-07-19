// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../../context/LanguageContext';
import { Image as ImageIcon, UploadCloud, ArrowLeft, Save, X, Book, Package, AlertCircle, Ban, Scan, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/client';
import MockBarcodeScannerModal from '../../../components/MockBarcodeScannerModal';
import ChapterModal from '../../../components/ChapterModal';
import { Layers, Edit, Trash2 } from 'lucide-react';

export default function AdminEditProductPage() {
  const { t } = useLanguage();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [coverImage, setCoverImage] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showDiscontinueConfirm, setShowDiscontinueConfirm] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    categoryId: '',
    description: '',
    price: '',
    cost: '',
    sku: '',
    barcode: '',
    type: 'physical',
    status: 'draft',
    quantity: 0,
    trialLimit: '',
    chapters: [],
    ebookFile: ''
  });

  const [isUploading, setIsUploading] = useState(false);
  const [ebookUploadProgress, setEbookUploadProgress] = useState<string | null>(null);

  const router = useRouter();

  const mapDbTypeToUiType = (bookType) => {
    if (bookType === 'EBook') return 'ebook';
    if (bookType === 'Manga') return 'serial';
    return 'physical';
  };

  const mapUiTypeToDbType = (type) => {
    if (type === 'ebook') return 'EBook';
    if (type === 'serial') return 'Manga';
    return 'Hardcover';
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        if (!res.ok) throw new Error('Failed to load categories');
        const data = await res.json();
        setCategories(data.categories ?? []);
      } catch (err) {
        console.error(err);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/books/${id}`);
        if (!res.ok) throw new Error('Failed to load product');
        const data = await res.json();
        const product = data?.book;

        if (!product) {
          router.push('/admin/products');
          return;
        }

        setFormData({
          title: product.title || '',
          author: product.author || '',
          publisher: product.publisherName || '',
          categoryId: product.categoryId ? String(product.categoryId) : '',
          description: product.description || '',
          price: product.price || '',
          cost: '',
          sku: String(product.id ?? ''),
          barcode: '',
          type: mapDbTypeToUiType(product.bookType),
          status: product.status || (product.stock > 0 ? 'active' : 'draft'),
          quantity: product.stock || 0,
          trialLimit: product.sampleLimit ? String(product.sampleLimit) : '',
          chapters: [],
          ebookFile: product.ebookFile || ''
        });
        if (product.image) {
          setCoverImage(product.image);
        }
      } catch (err) {
        console.error(err);
        setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScanBarcode = (barcode) => {
    setFormData(prev => ({ ...prev, barcode }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChapter = (chapter) => {
    if (editingChapter) {
      setFormData(prev => ({
        ...prev,
        chapters: prev.chapters.map(c => c.id === chapter.id ? chapter : c)
      }));
    } else {
      setFormData(prev => ({ ...prev, chapters: [...prev.chapters, chapter] }));
    }
  };

  const handleDeleteChapter = (chapterId) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.filter(c => c.id !== chapterId)
    }));
  };

  const handleEbookUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // File validation
    if (!['application/pdf', 'application/epub+zip'].includes(file.type) && !file.name.endsWith('.epub')) {
      alert('กรุณาอัปโหลดไฟล์ PDF หรือ EPUB เท่านั้น');
      return;
    }
    
    try {
      setEbookUploadProgress('กำลังอัปโหลดไฟล์...');
      const supabase = createClient();
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `ebooks/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('ebooks')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ebooks')
        .getPublicUrl(filePath);
        
      setFormData(prev => ({ ...prev, ebookFile: publicUrl }));
      setEbookUploadProgress('อัปโหลดสำเร็จแล้ว');
    } catch (err: any) {
      console.error('Error uploading ebook:', err);
      alert(`อัปโหลดไฟล์ไม่สำเร็จ: ${err.message || 'Unknown error'}`);
      setEbookUploadProgress(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.sku) return;
    setIsSaving(true);

    try {
      const payload = {
        title: formData.title,
        author: formData.author,
        publisherName: formData.publisher,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        description: formData.description,
        price: Number(formData.price),
        image: coverImage || null,
        bookType: mapUiTypeToDbType(formData.type),
        status: formData.status,
        ...(formData.type === 'ebook' ? { 
          ebookFile: formData.ebookFile, 
          sampleLimit: formData.trialLimit ? Number(formData.trialLimit) : null 
        } : {}),
      };

      const res = await fetch(`/api/admin/books/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Failed to update product');
      }

      setIsSaving(false);
      router.push('/admin/products');
    } catch (err) {
      console.error(err);
      setIsSaving(false);
      alert('ไม่สามารถบันทึกการแก้ไขได้');
    }
  };

  const handleDiscontinue = () => {
    setFormData(prev => ({ ...prev, status: 'discontinued' }));
    setShowDiscontinueConfirm(false);
  };

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
          <div className="text-gray-500 font-medium tracking-wide">Loading product...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <p className="text-sm text-red-500 font-semibold">{error}</p>
        <Link href="/admin/products" className="inline-block mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white font-semibold text-sm">
          กลับไปหน้ารายการสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Confirmation Modal */}
      {showDiscontinueConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการเลิกจำหน่าย?</h3>
              <p className="text-sm text-gray-500">
                คุณกำลังจะเปลี่ยนสถานะสินค้าเป็น "เลิกจำหน่าย" สำหรับการใช้งานในระบบหลังบ้าน
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowDiscontinueConfirm(false)}
                className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors text-sm"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleDiscontinue}
                className="px-4 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors text-sm shadow-sm"
              >
                ยืนยันเลิกจำหน่าย
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-gray-900 rounded-full transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900">แก้ไขข้อมูลสินค้า</h2>
            <p className="text-gray-500 mt-1">รหัสสินค้า: {id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {(formData.status === 'active' || formData.status === 'discontinued') && (
            <button 
              onClick={() => setShowDiscontinueConfirm(true)}
              disabled={formData.status === 'discontinued'}
              className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Ban className="w-4 h-4" />
              {formData.status === 'discontinued' ? 'เลิกจำหน่ายแล้ว' : 'เลิกจำหน่าย'}
            </button>
          )}
          <Link href="/admin/products" className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
            {t('prod.new.cancel')}
          </Link>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md flex items-center gap-2 disabled:opacity-70"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            บันทึกการแก้ไข
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-200 p-6">
            <h3 className="text-lg font-black text-gray-900 mb-6">{t('prod.new.basicInfo')}</h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">{t('prod.new.name')} <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={t('prod.new.namePh')} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow" 
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">{t('prod.new.author')}</label>
                  <input 
                    type="text" 
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder={t('prod.new.authorPh')} 
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow" 
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">{t('prod.new.publisher')}</label>
                  <input 
                    type="text" 
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    placeholder={t('prod.new.publisherPh')} 
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow" 
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">หมวดหมู่สินค้า</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow"
                >
                  <option value="">ไม่ระบุหมวดหมู่</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">{t('prod.new.desc')}</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t('prod.new.descPh')} 
                  rows={5}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow resize-none" 
                ></textarea>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-200 p-6">
            <h3 className="text-lg font-black text-gray-900 mb-6">{formData.type === 'serial' ? 'ราคาเหมาจ่าย (ถ้ามี)' : t('prod.new.pricing')}</h3>
            
            <div className="grid grid-cols-2 gap-5 mb-5">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">
                  {formData.type === 'serial' ? 'ราคาเหมาทุกตอน' : t('prod.new.price')} 
                  {formData.type !== 'serial' && <span className="text-red-500"> *</span>}
                </label>
                <input 
                  type="number" 
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder={formData.type === 'serial' ? "เว้นว่างได้" : "0.00"} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow font-mono" 
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">{t('prod.new.cost')}</label>
                <input 
                  type="number" 
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  placeholder="0.00" 
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow font-mono" 
                />
              </div>
            </div>
            {formData.type === 'physical' && (
              <div className="mb-5 p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">จำนวนสต็อก (Quantity)</label>
                  <input 
                    type="number" 
                    value={formData.quantity}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 font-mono cursor-not-allowed mb-1" 
                  />
                  <p className="text-xs text-gray-500 font-medium">
                    จำนวนสต็อกจะถูกอัปเดตผ่านเมนูรับสินค้า (Receive PO) หรือปรับปรุงสต็อกเท่านั้น
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">{t('prod.new.sku')} <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 font-mono cursor-not-allowed" 
                />
              </div>
              {formData.type === 'physical' && (
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">{t('prod.new.barcode')}</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      placeholder="978-X-XXXX-XXXX-X" 
                      className="w-full px-4 py-2.5 pr-12 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow font-mono" 
                    />
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
              )}
            </div>
          </div>

          {/* E-book Settings */}
          {formData.type === 'ebook' && (
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-200 p-6">
              <h3 className="text-lg font-black text-gray-900 mb-6">ตั้งค่า E-Book</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">อัปโหลดไฟล์ E-Book (PDF/EPUB) <span className="text-red-500">*</span></label>
                  {!formData.ebookFile ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.epub"
                        onChange={handleEbookUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        title="คลิกเพื่อเลือกไฟล์"
                        disabled={!!ebookUploadProgress && ebookUploadProgress !== 'อัปโหลดสำเร็จแล้ว'}
                      />
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">{ebookUploadProgress || 'คลิกเพื่อเลือกไฟล์หนังสือ'}</span>
                        <span className="text-xs text-gray-500 mt-1">รองรับไฟล์ .pdf, .epub</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 shrink-0">
                          <Book className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-green-900 truncate">ไฟล์อัปโหลดแล้ว</p>
                          <a href={formData.ebookFile} target="_blank" rel="noreferrer" className="text-xs text-green-700 hover:underline truncate block w-48 sm:w-auto">
                            {formData.ebookFile.split('/').pop()}
                          </a>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          setFormData(prev => ({...prev, ebookFile: ''}));
                          setEbookUploadProgress(null);
                        }}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors ml-2"
                        title="เปลี่ยนไฟล์"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">จำกัดการทดลองอ่าน (จำนวนหน้า)</label>
                  <input 
                    type="number" 
                    name="trialLimit"
                    value={formData.trialLimit}
                    onChange={handleInputChange}
                    placeholder="เช่น 15" 
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-shadow font-mono" 
                  />
                  <p className="text-xs text-gray-500 mt-1.5">เว้นว่างไว้หากไม่ต้องการให้ทดลองอ่าน</p>
                </div>
              </div>
            </div>
          )}

          {/* Serial Novel Settings */}
          {formData.type === 'serial' && (
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-gray-900" />
                  จัดการตอน (Chapters)
                </h3>
                <button 
                  onClick={(e) => { e.preventDefault(); setEditingChapter(null); setShowChapterModal(true); }}
                  className="px-4 py-2 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> เพิ่มตอนใหม่
                </button>
              </div>
              
              <div className="space-y-3">
                {(!formData.chapters || formData.chapters.length === 0) ? (
                  <div className="py-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                    <p className="text-gray-500 font-medium">ยังไม่มีตอนในนิยายนี้</p>
                  </div>
                ) : (
                  formData.chapters.map((chapter, index) => (
                    <div key={chapter.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-black text-sm">
                          {chapter.chapterNumber || index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{chapter.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-medium text-gray-500">รหัส: {chapter.id}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${chapter.price > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {chapter.price > 0 ? `฿${chapter.price}` : 'อ่านฟรี'}
                            </span>
                            {chapter.file && <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">มีไฟล์</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button"
                          onClick={(e) => { e.preventDefault(); setEditingChapter(chapter); setShowChapterModal(true); }}
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => { e.preventDefault(); handleDeleteChapter(chapter.id); }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-200 p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">{t('prod.new.status')}</h3>
            <div className="space-y-3">
              <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${formData.status === 'draft' ? 'bg-gray-50 border-gray-900' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" name="status" value="draft" checked={formData.status === 'draft'} onChange={handleInputChange} className="hidden" />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${formData.status === 'draft' ? 'border-gray-900' : 'border-gray-300'}`}>
                  {formData.status === 'draft' && <div className="w-2 h-2 bg-gray-900 rounded-full"></div>}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">แบบร่าง (Draft)</div>
                  <div className="text-xs text-gray-500">ซ่อนจากหน้าร้าน รอข้อมูลครบ</div>
                </div>
              </label>

              <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${formData.status === 'active' ? 'bg-gray-50 border-gray-900' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" name="status" value="active" checked={formData.status === 'active'} onChange={handleInputChange} className="hidden" />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${formData.status === 'active' ? 'border-gray-900' : 'border-gray-300'}`}>
                  {formData.status === 'active' && <div className="w-2 h-2 bg-gray-900 rounded-full"></div>}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">แสดงผล (Active)</div>
                  <div className="text-xs text-gray-500">พร้อมขายบนหน้าร้าน</div>
                </div>
              </label>
              
              <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${formData.status === 'discontinued' ? 'bg-red-50 border-red-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" name="status" value="discontinued" checked={formData.status === 'discontinued'} onChange={handleInputChange} className="hidden" />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${formData.status === 'discontinued' ? 'border-red-500' : 'border-gray-300'}`}>
                  {formData.status === 'discontinued' && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                </div>
                <div>
                  <div className="font-bold text-red-700 text-sm">เลิกจำหน่าย (Discontinued)</div>
                  <div className="text-xs text-red-500">ซ่อนจากรายการ แต่ลิงก์เดิมยังเข้าได้</div>
                </div>
              </label>
            </div>
          </div>

          {/* Product Type */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-200 p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">{t('prod.new.type')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'physical' }))}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-2 transition-colors ${formData.type === 'physical' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              >
                <Package className="w-5 h-5" />
                <span className="font-bold text-xs">{t('prod.new.typePhysical')}</span>
              </button>
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'ebook' }))}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-2 transition-colors ${formData.type === 'ebook' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              >
                <Book className="w-5 h-5" />
                <span className="font-bold text-xs">{t('prod.new.typeEbook')}</span>
              </button>
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'serial' }))}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-2 transition-colors ${formData.type === 'serial' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              >
                <Layers className="w-5 h-5" />
                <span className="font-bold text-xs text-center leading-tight">นิยายตอน</span>
              </button>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-200 p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">{t('prod.new.media')}</h3>
            
            <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden relative group bg-gray-50">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              
              {coverImage ? (
                <div className="relative aspect-3/4 w-full">
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-bold text-sm bg-black/50 px-3 py-1.5 rounded-lg">Change Image</span>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCoverImage(null); }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-20 shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="py-10 px-4 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100 group-hover:border-gray-300 transition-colors">
                    <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">{t('prod.new.upload')}</p>
                  <p className="text-xs text-gray-400 mt-1 px-4">{t('prod.new.uploadSub')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <MockBarcodeScannerModal 
        isOpen={showScanner} 
        onClose={() => setShowScanner(false)} 
        onScan={handleScanBarcode} 
      />
      <ChapterModal 
        isOpen={showChapterModal}
        onClose={() => setShowChapterModal(false)}
        onSave={handleSaveChapter}
        initialData={editingChapter}
        nextChapterNumber={formData.chapters ? formData.chapters.length + 1 : 1}
      />
    </div>
  );
}

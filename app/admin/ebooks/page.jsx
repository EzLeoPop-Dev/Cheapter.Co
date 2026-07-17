"use client";
import React, { useState } from 'react';

export default function StaffEbooksPage() {
  const [ebooks, setEbooks] = useState([
    { id: 'EB-001', title: 'ผ่าพิภพไททัน (Attack on Titan) Vol. 1', file: 'aot_v1.pdf', size: '45 MB', downloads: 120 },
    { id: 'EB-002', title: 'Clean Code (E-Book)', file: 'clean_code.epub', size: '12 MB', downloads: 85 },
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingEbookId, setEditingEbookId] = useState(null);
  const [ebookFormData, setEbookFormData] = useState({ title: '', file: null, fileName: '', size: '0 MB' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-black text-[#1A1A1A]">จัดการ E-book (E-book Management)</h2>
        <button 
          onClick={() => {
            setEditingEbookId(null);
            setEbookFormData({ title: '', file: null, fileName: '', size: '0 MB' });
            setShowUploadModal(true);
          }}
          className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary transition-colors shadow-sm flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          อัปโหลดไฟล์ใหม่
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/60 border-b border-[#e6e5e0] text-xs uppercase tracking-wider text-[#a09c92] font-bold">
                <th className="p-5">รหัสสินค้า</th>
                <th className="p-5">ชื่อหนังสือ</th>
                <th className="p-5">ชื่อไฟล์</th>
                <th className="p-5 text-center">ขนาด</th>
                <th className="p-5 text-center">ยอดดาวน์โหลด</th>
                <th className="p-5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e5e0]/50">
              {ebooks.map((eb, idx) => (
                <tr key={idx} className="hover:bg-white/80 transition-colors">
                  <td className="p-5 text-sm font-bold text-[#a09c92]">{eb.id}</td>
                  <td className="p-5 font-bold text-[#1A1A1A]">{eb.title}</td>
                  <td className="p-5 text-sm text-[#1A1A1A] font-mono"><span className="bg-white/60 border border-[#e6e5e0] px-2.5 py-1 rounded-lg">{eb.file}</span></td>
                  <td className="p-5 text-center text-sm font-bold text-[#1A1A1A]">{eb.size}</td>
                  <td className="p-5 text-center font-black text-primary text-lg">{eb.downloads}</td>
                  <td className="p-5 flex justify-center space-x-3">
                    <button 
                      onClick={() => {
                        setEditingEbookId(eb.id);
                        setEbookFormData({ title: eb.title, file: null, fileName: eb.file, size: eb.size });
                        setShowUploadModal(true);
                      }}
                      className="p-2.5 bg-white border border-[#e6e5e0] hover:bg-orange-50 text-[#1A1A1A] hover:text-primary hover:border-primary rounded-xl transition-all shadow-sm" title="แก้ไข"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('คุณต้องการลบ E-book เรื่องนี้ใช่หรือไม่?')) {
                          setEbooks(ebooks.filter(e => e.id !== eb.id));
                        }
                      }}
                      className="p-2.5 bg-white border border-[#e6e5e0] hover:bg-red-50 text-[#1A1A1A] hover:text-red-500 hover:border-red-200 rounded-xl transition-all shadow-sm" title="ลบ"
                    >
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload E-book Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}>
          <div className="bg-[#FDFBF7] rounded-[2rem] w-full max-w-lg shadow-xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[#e6e5e0] flex justify-between items-center bg-white">
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                {editingEbookId ? 'แก้ไขข้อมูล E-book' : 'อัปโหลด E-book ใหม่'}
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-[#a09c92] hover:text-red-500 bg-gray-100 hover:bg-red-50 p-2 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 bg-white space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">ชื่อหนังสือ <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={ebookFormData.title} 
                  onChange={e => setEbookFormData({...ebookFormData, title: e.target.value})} 
                  placeholder="เช่น ผ่าพิภพไททัน Vol. 1"
                  className="w-full px-4 py-3 border border-[#e6e5e0] rounded-xl focus:outline-none focus:border-primary text-sm font-bold text-[#1A1A1A]" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">ไฟล์ E-book (PDF, EPUB) <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-[#e6e5e0] rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                  <input 
                    type="file" 
                    accept=".pdf,.epub"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
                        setEbookFormData({...ebookFormData, file: file, fileName: file.name, size: sizeMB});
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center text-[#a09c92]">
                    <svg className="w-10 h-10 mb-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {ebookFormData.fileName ? (
                      <div>
                        <p className="font-bold text-primary">{ebookFormData.fileName}</p>
                        <p className="text-xs">({ebookFormData.size})</p>
                      </div>
                    ) : (
                      <>
                        <p className="font-bold text-[#1A1A1A]">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
                        <p className="text-xs mt-1">รองรับไฟล์ .pdf, .epub ขนาดไม่เกิน 50MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#e6e5e0] bg-white flex justify-end gap-3">
              <button 
                onClick={() => setShowUploadModal(false)} 
                className="px-5 py-2.5 bg-[#F2EEE7] hover:bg-gray-200 text-[#1A1A1A] rounded-xl font-bold transition-colors text-sm"
              >
                ยกเลิก
              </button>
              <button 
                onClick={() => {
                  if (ebookFormData.title && ebookFormData.fileName) {
                    if (editingEbookId) {
                      setEbooks(ebooks.map(eb => eb.id === editingEbookId ? { ...eb, title: ebookFormData.title, file: ebookFormData.fileName, size: ebookFormData.size } : eb));
                    } else {
                      const newId = `EB-${String(ebooks.length + 1).padStart(3, '0')}`;
                      setEbooks([...ebooks, { id: newId, title: ebookFormData.title, file: ebookFormData.fileName, size: ebookFormData.size, downloads: 0 }]);
                    }
                    setShowUploadModal(false);
                  }
                }} 
                className={`px-5 py-2.5 rounded-xl font-bold transition-colors text-sm ${(ebookFormData.title && ebookFormData.fileName) ? 'bg-primary hover:bg-[#b07515] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={!(ebookFormData.title && ebookFormData.fileName)}
              >
                {editingEbookId ? 'บันทึกการแก้ไข' : 'อัปโหลด'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

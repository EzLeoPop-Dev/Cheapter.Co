// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { X, ScanLine } from 'lucide-react';

export default function MockBarcodeScannerModal({ isOpen, onClose, onScan }) {
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let timeoutId;
    let foundTimeoutId;
    if (isOpen) {
      setScanning(true);
      // Simulate scanning delay
      timeoutId = setTimeout(() => {
        setScanning(false);
        const mockedBarcode = `978${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        // Delay closing slightly so user sees the "Found" state
        foundTimeoutId = setTimeout(() => {
          onScan(mockedBarcode);
          onClose();
        }, 800);
      }, 2000);
    }
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(foundTimeoutId);
    };
  }, [isOpen, onScan, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-gray-500" />
            แสกนบาร์โค้ด
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative aspect-square w-full max-w-[240px] mx-auto bg-gray-900 rounded-2xl overflow-hidden border-4 border-gray-800 flex items-center justify-center shadow-inner">
            {/* Camera mock background */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}></div>
            
            {scanning ? (
              <>
                {/* Laser line animation */}
                <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.6)] animate-[scan_2s_ease-in-out_infinite]" style={{ top: '10%' }}></div>
                <div className="absolute inset-0 border-2 border-white/20 m-6 rounded-lg pointer-events-none">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-400 rounded-tl-sm"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-400 rounded-tr-sm"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-400 rounded-bl-sm"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-400 rounded-br-sm"></div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-green-400">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                  <ScanLine className="w-6 h-6 text-green-400" />
                </div>
                <span className="font-bold tracking-widest text-sm">DETECTED</span>
              </div>
            )}
          </div>

          <div className="text-center mt-6">
            <p className="text-sm font-bold text-gray-900">
              {scanning ? 'กำลังค้นหาบาร์โค้ด...' : 'พบข้อมูลบาร์โค้ด!'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {scanning ? 'กรุณาวางบาร์โค้ดให้อยู่ในกรอบ' : 'กำลังนำเข้าสู่ระบบ...'}
            </p>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(180px); }
        }
      `}} />
    </div>
  );
}

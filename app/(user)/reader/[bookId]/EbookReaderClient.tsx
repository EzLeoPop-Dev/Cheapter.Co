"use client";

import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ChevronLeft, ChevronRight, ArrowLeft, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Set up pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface EbookReaderClientProps {
  bookId: number;
  title: string;
  pdfUrl: string;
  initialPage: number;
}

export default function EbookReaderClient({ bookId, title, pdfUrl, initialPage }: EbookReaderClientProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(initialPage || 1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  
  // Track last saved page to avoid spamming the API
  const lastSavedPageRef = useRef<number>(initialPage || 1);

  useEffect(() => {
    // Only save if the page has changed
    if (pageNumber !== lastSavedPageRef.current && numPages > 0) {
      const timer = setTimeout(() => {
        saveProgress(pageNumber, numPages);
        lastSavedPageRef.current = pageNumber;
      }, 2000); // Debounce for 2 seconds

      return () => clearTimeout(timer);
    }
  }, [pageNumber, numPages]);

  const saveProgress = async (page: number, totalPages: number) => {
    try {
      const progressPercent = Math.min(100, Math.round((page / totalPages) * 100));
      await fetch("/api/user/library/progress", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId,
          pageNumber: page,
          progressPercent,
        }),
      });
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    setLoading(false);
  };

  const previousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const nextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.5));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  const progressPercent = numPages > 0 ? Math.round((pageNumber / numPages) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#ece6de] text-stone-800 font-sans">
      {/* Top Navbar */}
      <div className="h-16 bg-[#faf8f4] border-b border-[#e6dbcc] flex items-center justify-between px-4 sm:px-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/profile/ebooks" className="p-2 -ml-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-stone-800 line-clamp-1">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={zoomOut} className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded transition-colors">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-stone-500 w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn} className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-bold bg-[#e6dbcc] text-[#8b5a45] px-2.5 py-1 rounded-full">
              {progressPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Reader Content */}
      <div className="flex-1 flex flex-col items-center justify-start py-8 px-4 overflow-y-auto relative">
        <div className="shadow-2xl bg-white transition-transform duration-200 ease-out" style={{ minHeight: "60vh" }}>
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex flex-col items-center justify-center h-[60vh] text-stone-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="text-sm font-medium">กำลังโหลดหนังสือ...</p>
              </div>
            }
          >
            {!loading && (
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                className="pdf-page"
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            )}
          </Document>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="h-20 bg-[#faf8f4] border-t border-[#e6dbcc] flex items-center justify-center px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sticky bottom-0 z-10 gap-6">
        <button 
          onClick={previousPage} 
          disabled={pageNumber <= 1}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e6dbcc] text-stone-700 rounded-xl font-bold hover:bg-stone-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">หน้าก่อนหน้า</span>
        </button>
        
        <div className="flex flex-col items-center justify-center min-w-[120px]">
          <span className="text-sm font-bold text-stone-800">หน้า {pageNumber}</span>
          <span className="text-xs text-stone-500">จาก {numPages || '-'}</span>
        </div>

        <button 
          onClick={nextPage} 
          disabled={pageNumber >= numPages && numPages > 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#8b5a45] text-white rounded-xl font-bold hover:bg-[#724a38] disabled:opacity-50 disabled:hover:bg-[#8b5a45] transition-colors shadow-sm"
        >
          <span className="hidden sm:inline">หน้าถัดไป</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

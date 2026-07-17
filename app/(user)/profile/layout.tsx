"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, FileText, Heart, BookOpen, AlertCircle } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const sidebarItems = [
  { name: 'ข้อมูลส่วนตัว', icon: User, href: '/profile' },
  { name: 'ประวัติการสั่งซื้อ', icon: FileText, href: '/profile/orders' },
  { name: 'หนังสือที่อยากได้', icon: Heart, href: '/profile/wishlist' },
  { name: 'คลัง E-book', icon: BookOpen, href: '/profile/ebooks' },
  { name: 'เเจ้งปัญหา', icon: AlertCircle, href: '/profile/support' },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f9f8f6] font-sans text-stone-800">
      <Navbar />
      
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">การตั้งค่าบัญชี</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white text-[#bc876e] font-medium shadow-sm border-l-4 border-[#bc876e]'
                        : 'text-gray-600 hover:bg-white/60 hover:text-gray-900 border-l-4 border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

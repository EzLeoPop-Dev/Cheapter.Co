// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderTree, 
  Tag, 
  PieChart, 
  Users, 
  ShoppingBag, 
  PackageSearch, 
  BookOpen, 
  MessageSquare, 
  Ticket, 
  Star, 
  LogOut,
  ChevronRight,
  Bell,
  Globe,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { signOut } from 'next-auth/react'; 
import { createClient } from '@/src/lib/supabase/client';

function AdminLayoutInner({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  
  const { user, isLoading } = useAuth();
  const [dbUser, setDbUser] = useState<any>(null);
  // 👇 1. เพิ่ม State สำหรับเช็คว่าดึงข้อมูลจาก DB เสร็จหรือยัง (ตั้งต้นเป็น true เพื่อให้หมุนรอเลย)
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [stockInItems, setStockInItems] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifTab, setNotifTab] = useState<'lowStock' | 'stockIn'>('lowStock');

  useEffect(() => {
    if (user) {
      setIsFetchingProfile(true); // เริ่มดึงข้อมูล
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (!data.error) setDbUser(data);
        })
        .catch(err => console.error("Failed to fetch user DB:", err))
        .finally(() => {
          setIsFetchingProfile(false); // ดึงข้อมูลเสร็จแล้ว (ไม่ว่าจะสำเร็จหรือพัง) ให้เลิกโหลด
        });
    } else if (!isLoading && !user) {
      setIsFetchingProfile(false); // ถ้าโหลด Auth เสร็จแล้วแต่ไม่มี user ก็เลิกโหลด
    }
  }, [user, isLoading]);

  useEffect(() => {
    // Fetch notifications if user is admin or staff
    if (user && (user.role === 'ADMIN' || user.role === 'STAFF')) {
      const fetchNotifications = () => {
        fetch('/api/admin/notifications/low-stock')
          .then(res => res.json())
          .then(data => {
            if (!data.error) {
              setLowStockItems(data.lowStock?.items || []);
              setStockInItems(data.stockIn?.items || []);
            }
          })
          .catch(err => console.error(err));
      };

      // Initial fetch
      fetchNotifications();

      // Subscribe to real-time changes
      const supabase = createClient();
      const channel = supabase
        .channel('realtime-stock')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, () => fetchNotifications())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_movements' }, () => fetchNotifications())
        .subscribe();

      // Fallback Polling
      const pollInterval = setInterval(fetchNotifications, 5000);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(pollInterval);
      };
    }
  }, [user]);

  const totalNotifCount = lowStockItems.length + stockInItems.length;

  const handleLogout = async (e) => {
    e.preventDefault();
    await signOut({ callbackUrl: '/auth/login' }); 
  };

  const toggleLanguage = () => {
    setLang(lang === 'th' ? 'en' : 'th');
  };

  const menuItems = [
    { category: t('layout.overview'), items: [
      { name: t('layout.dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
      { name: t('layout.reports'), path: '/admin/reports', icon: PieChart },
    ]},
    { category: t('layout.storeManagement'), items: [
      { name: t('layout.products'), path: '/admin/products', icon: BookOpen },
      { name: t('layout.bookPacks'), path: '/admin/book-packs', icon: PackageSearch },
      { name: t('layout.orders'), path: '/admin/orders', icon: ShoppingBag },
      { name: t('layout.purchaseOrders'), path: '/admin/purchase-orders', icon: ShoppingBag },
      { name: t('layout.stock'), path: '/admin/stock', icon: PackageSearch },
      { name: t('layout.ebooks'), path: '/admin/ebooks', icon: BookOpen },
      { name: t('layout.categories'), path: '/admin/categories', icon: FolderTree },
      { name: t('layout.promotions'), path: '/admin/promotions', icon: Tag },
    ]},
    { category: t('layout.customerRelation'), items: [
      { name: t('layout.users'), path: '/admin/users', icon: Users },
      { name: t('layout.chat'), path: '/admin/chat', icon: MessageSquare },
      { name: t('layout.tickets'), path: '/admin/tickets', icon: Ticket },
      { name: t('layout.reviews'), path: '/admin/reviews', icon: Star },
    ]}
  ];

  const staffAllowedPaths = [
    '/admin/products',
    '/admin/book-packs',
    '/admin/orders',
    '/admin/stock',
    '/admin/ebooks',
    '/admin/chat',
    '/admin/tickets',
    '/admin/reviews'
  ];

  const filteredMenuItems = menuItems.map(group => {
    if (user?.role === 'ADMIN') return group;
    return {
      ...group,
      items: group.items.filter(item => staffAllowedPaths.includes(item.path))
    };
  }).filter(group => group.items.length > 0);

  // 👇 2. เพิ่ม isFetchingProfile เข้าไปในเงื่อนไข เพื่อให้รอข้อมูลจาก DB ก่อนค่อยแสดง Layout
  if (isLoading || isFetchingProfile || !user) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#1a1a1a] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-[#1a1a1a] font-medium tracking-wide">Loading Workspace...</div>
        </div>
      </div>
    );
  }

  const currentName = dbUser?.name || user?.name || 'Admin';
  const currentEmail = dbUser?.email || user?.email || '';
  const currentRole = dbUser?.role || user?.role || '';
  const profileImage = dbUser?.profileImage || user?.image || user?.profileImage;

  const avatarLetter = currentName ? currentName.charAt(0).toUpperCase() : 'A';

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-gray-800 font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white flex flex-col fixed left-0 top-0 h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50">
        <div className="h-20 flex items-center px-8 border-b border-gray-100">
          <span className="text-2xl font-black tracking-tighter text-[#1a1a1a]">CHEAPTER<span className="text-gray-400 font-medium">.CO</span></span>
          <span className="ml-3 text-[10px] font-bold bg-[#1a1a1a] text-white px-2 py-1 rounded uppercase tracking-wider">
            {currentRole}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <nav className="px-4 space-y-8">
            {filteredMenuItems.map((group, idx) => (
              <div key={idx}>
                <h3 className="px-4 text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-widest">
                  {group.category}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                    const Icon = item.icon;
                    return (
                      <Link 
                        key={item.name} 
                        href={item.path} 
                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                          isActive 
                            ? 'bg-[#1a1a1a] text-white shadow-md' 
                            : 'text-gray-500 hover:bg-gray-50 hover:text-[#1a1a1a]'
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#1a1a1a]'}`} strokeWidth={isActive ? 2.5 : 2} />
                          <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
                        </div>
                        {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between mb-3">
            <div className="flex items-center overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-sm shadow-inner flex-shrink-0 overflow-hidden relative">
                {profileImage && profileImage.trim() !== "" ? (
                  <img src={profileImage} alt={currentName} className="w-full h-full object-cover" />
                ) : (
                  avatarLetter
                )}
              </div>
              <div className="ml-3 truncate">
                <p className="text-sm font-bold text-gray-900 truncate">{currentName}</p>
                <p className="text-xs text-gray-500 truncate">{currentEmail}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center px-4 py-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-semibold transition-colors group"
          >
            <LogOut className="w-4 h-4 mr-2 group-hover:text-red-500" />
            {t('layout.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-72 flex flex-col min-h-screen bg-[#f8f9fa]">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-8 sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">{t('layout.title')}</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{t('layout.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-5">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors text-xs font-bold uppercase tracking-wider"
            >
              <Globe className="w-4 h-4" />
              {lang === 'th' ? 'EN' : 'TH'}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-gray-400 hover:text-[#1a1a1a] transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <Bell className="w-5 h-5" />
                {totalNotifCount > 0 && (
                  <span className="absolute top-1 right-1.5 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border border-white">
                    {totalNotifCount > 99 ? '99+' : totalNotifCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-semibold">{totalNotifCount}</span>
                  </div>
                  {/* Tabs */}
                  <div className="flex border-b border-gray-100">
                    <button
                      onClick={() => setNotifTab('lowStock')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors ${
                        notifTab === 'lowStock' ? 'text-red-600 border-b-2 border-red-500 bg-red-50/30' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Low Stock ({lowStockItems.length})
                    </button>
                    <button
                      onClick={() => setNotifTab('stockIn')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors ${
                        notifTab === 'stockIn' ? 'text-green-600 border-b-2 border-green-500 bg-green-50/30' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Stock In ({stockInItems.length})
                    </button>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                    {notifTab === 'lowStock' && (
                      lowStockItems.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-400">ไม่มีสินค้าใกล้หมด</div>
                      ) : (
                        lowStockItems.map(item => (
                          <Link 
                            key={item.id} 
                            href="/admin/stock"
                            onClick={() => setShowNotifications(false)}
                            className="flex gap-3 px-4 py-3 hover:bg-red-50/50 border-b border-gray-50 last:border-0 transition-colors"
                          >
                            <div className="w-10 h-14 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                              {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                              <p className="text-xs text-red-600 font-medium mt-1">⚠️ เหลือ {item.stock} เล่ม</p>
                            </div>
                          </Link>
                        ))
                      )
                    )}
                    {notifTab === 'stockIn' && (
                      stockInItems.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-400">ไม่มีสินค้าเข้าคลังล่าสุด</div>
                      ) : (
                        stockInItems.map(item => (
                          <div 
                            key={item.id}
                            className="flex gap-3 px-4 py-3 hover:bg-green-50/50 border-b border-gray-50 last:border-0 transition-colors"
                          >
                            <div className="w-10 h-14 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                              {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                              <p className="text-xs text-green-600 font-medium mt-0.5">📦 เข้า +{item.quantity} เล่ม</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">จาก {item.reference} • {new Date(item.createdAt).toLocaleString('th-TH')}</p>
                            </div>
                          </div>
                        ))
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <Link 
              href="/" 
              className="text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white px-5 py-2.5 rounded-full transition-all shadow-sm"
            >
              {t('layout.storefront')}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthProvider>
  );
}

"use client";
import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, ShoppingCart, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const [data, setData] = useState({
    stats: [],
    chartData: [],
    topProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock Dashboard Data
    const mockData = {
      stats: [
        { titleKey: "dash.stat1", value: "฿124,500", percent: "+12.5%", isUp: true, icon: TrendingUp },
        { titleKey: "dash.stat2", value: "142", percent: "+5.2%", isUp: true, icon: ShoppingCart },
        { titleKey: "dash.stat3", value: "89", percent: "-2.4%", isUp: false, icon: Users },
        { titleKey: "dash.stat4", value: "12,450", percent: "0.0%", isUp: null, icon: Eye },
      ],
      chartData: [45, 60, 30, 80, 50, 90, 75, 65, 85, 40, 70, 95],
      topProducts: [
        { name: "Atomic Habits", sold: 145, price: 350 },
        { name: "The Psychology of Money", sold: 120, price: 295 },
        { name: "Sapiens", sold: 98, price: 490 },
        { name: "Thinking, Fast and Slow", sold: 85, price: 450 },
        { name: "1984", sold: 76, price: 250 },
      ]
    };

    setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
    }, 400);
  }, []);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
          <div className="text-gray-500 font-medium tracking-wide">Loading metrics...</div>
        </div>
      </div>
    );
  }

  const { stats, chartData, topProducts } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">{t('dash.title')}</h2>
          <p className="text-gray-500 mt-1">{t('dash.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-4 py-2 outline-none focus:border-gray-900 font-medium cursor-pointer shadow-sm">
            <option>{t('dash.30days')}</option>
            <option>{t('dash.7days')}</option>
            <option>{t('dash.thisMonth')}</option>
            <option>{t('dash.thisYear')}</option>
          </select>
          <button className="px-5 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm text-sm">
            {t('dash.export')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-gray-50 rounded-xl text-gray-700 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                {stat.isUp !== null ? (
                  <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${stat.isUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.percent}
                  </div>
                ) : (
                  <div className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                    {stat.percent}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-gray-500 font-medium text-sm mb-1">{t(stat.titleKey)}</h3>
                <span className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts / Data Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 bg-white border border-gray-200 p-8 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('dash.trendTitle')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('dash.trendSub')}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center text-xs font-medium text-gray-500"><span className="w-2 h-2 rounded-full bg-gray-900 mr-2"></span>{t('dash.trendSales')}</span>
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-3 mt-auto pt-4 relative">
            <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between pointer-events-none pb-6">
              {[4,3,2,1,0].map(line => (
                <div key={line} className="w-full border-b border-gray-100 border-dashed relative">
                </div>
              ))}
            </div>
            
            {chartData.map((h, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-3 group relative z-10">
                <div className="w-full bg-gray-50 rounded-md relative h-56 flex items-end overflow-hidden group-hover:bg-gray-100 transition-colors">
                  <div 
                    className="w-full bg-gray-900 rounded-md transition-all duration-700 ease-out group-hover:opacity-80"
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">{t('dash.topProducts')}</h3>
            <button className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">{t('dash.viewAll')}</button>
          </div>
          <div className="space-y-5 flex-1">
            {topProducts.length > 0 ? topProducts.map((book, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-gray-400 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-colors">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 max-w-[150px] truncate" title={book.name}>{book.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">฿{book.price}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{book.sold}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('dash.sold')}</p>
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-400 text-center py-8">{t('dash.noData')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

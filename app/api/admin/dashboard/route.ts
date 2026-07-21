import { NextResponse } from 'next/server';
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30days';

    const now = new Date();
    let startDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();

    if (range === '7days') {
      startDate.setDate(now.getDate() - 7);
      prevStartDate.setDate(startDate.getDate() - 7);
      prevEndDate = startDate;
    } else if (range === 'thisMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEndDate = startDate;
    } else if (range === 'thisYear') {
      startDate = new Date(now.getFullYear(), 0, 1);
      prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
      prevEndDate = startDate;
    } else { 
      startDate.setDate(now.getDate() - 30);
      prevStartDate.setDate(startDate.getDate() - 30);
      prevEndDate = startDate;
    }

    // 1. Stats เบื้องต้น
    const currentSalesAggr = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: 'COMPLETED', createdAt: { gte: startDate } }
    });
    const prevSalesAggr = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: 'COMPLETED', createdAt: { gte: prevStartDate, lt: prevEndDate } }
    });
    const currentSales = Number(currentSalesAggr._sum.totalAmount || 0);
    const prevSales = Number(prevSalesAggr._sum.totalAmount || 0);

    const currentOrders = await prisma.order.count({ where: { createdAt: { gte: startDate } } });
    const prevOrders = await prisma.order.count({ where: { createdAt: { gte: prevStartDate, lt: prevEndDate } } });

    const currentUsers = await prisma.user.count({ where: { createdAt: { gte: startDate } } });
    const prevUsers = await prisma.user.count({ where: { createdAt: { gte: prevStartDate, lt: prevEndDate } } });

    // 🌟 ดึงข้อมูล ออเดอร์ที่รอจัดการ (รอชำระเงิน, ตรวจสอบชำระเงิน, เตรียมจัดส่ง)
    const pendingOrdersCount = await prisma.order.count({
      where: { status: { in: ['PENDING', 'VERIFYING', 'PREPARING'] } }
    });

    const calcPercent = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? "+100.0%" : "0.0%";
      const diff = ((curr - prev) / prev) * 100;
      return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
    };
    const isUp = (curr: number, prev: number) => (curr >= prev ? true : curr === prev ? null : false);

    // 2. Top Products
    const topItems = await prisma.orderItem.groupBy({
      by: ['bookId'],
      _sum: { quantity: true },
      where: { order: { status: 'COMPLETED', createdAt: { gte: startDate } } },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const topProducts = [];
    for (const item of topItems) {
      if (!item.bookId) continue;
      const book = await prisma.book.findUnique({ where: { id: item.bookId } });
      if (book) {
        topProducts.push({
          name: book.title,
          sold: item._sum.quantity || 0,
          price: Number(book.price)
        });
      }
    }

    // 3. Chart Data (กราฟยอดขายรายวัน)
    const recentOrdersForChart = await prisma.order.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: startDate } },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    const dailyMap: Record<string, number> = {};
    recentOrdersForChart.forEach(order => {
      const dateKey = order.createdAt.toISOString().slice(0, 10);
      if (!dailyMap[dateKey]) dailyMap[dateKey] = 0;
      dailyMap[dateKey] += Number(order.totalAmount);
    });

    const chartData = Object.keys(dailyMap).map(date => ({
      name: new Date(date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
      revenue: dailyMap[date]
    }));

    // 4. ออเดอร์ล่าสุด
    const recentOrdersList = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, recipientName: true, totalAmount: true, status: true, createdAt: true }
    });

    const formatCurrency = (num: number) => `฿${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    const formatNumber = (num: number) => num.toLocaleString('en-US');

    return NextResponse.json({
      stats: [
        { titleKey: "dash.stat1", defaultTitle: "ยอดขายช่วงนี้", value: formatCurrency(currentSales), percent: calcPercent(currentSales, prevSales), isUp: isUp(currentSales, prevSales) },
        { titleKey: "dash.stat2", defaultTitle: "ออเดอร์ใหม่", value: formatNumber(currentOrders), percent: calcPercent(currentOrders, prevOrders), isUp: isUp(currentOrders, prevOrders) },
        { titleKey: "dash.stat3", defaultTitle: "ผู้ใช้ใหม่", value: formatNumber(currentUsers), percent: calcPercent(currentUsers, prevUsers), isUp: isUp(currentUsers, prevUsers) }, 
        // 🌟 เปลี่ยนกล่องที่ 4 เป็น "ออเดอร์รอจัดการ"
        { titleKey: "dash.stat4", defaultTitle: "ออเดอร์รอจัดการ", value: pendingOrdersCount.toString(), percent: "ต้องดำเนินการ", isUp: null, isAlert: pendingOrdersCount > 0 }, 
      ],
      chartData,
      topProducts,
      recentOrders: recentOrdersList.map(o => ({
        id: o.id, customer: o.recipientName, amount: Number(o.totalAmount), status: o.status,
        date: o.createdAt.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })
      }))
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30days";

    const now = new Date();
    let startDate = new Date();

    if (range === "7days") startDate.setDate(now.getDate() - 7);
    else if (range === "thisMonth") startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (range === "thisYear") startDate = new Date(now.getFullYear(), 0, 1);
    else startDate.setDate(now.getDate() - 30); // 30days

    // ==========================================
    // 1. SALES DATA (ข้อมูลยอดขาย)
    // ==========================================
    const orders = await prisma.order.findMany({
      where: { status: "COMPLETED", createdAt: { gte: startDate } },
      select: {
        totalAmount: true,
        discountAmount: true,
        paymentMethod: true,
        createdAt: true,
      }
    });

    let totalRevenue = 0;
    let totalDiscount = 0;
    const dailyMap: Record<string, { orders: number; revenue: number; discount: number }> = {};
    const paymentMap: Record<string, number> = { promptpay: 0, credit_card: 0, bank_transfer: 0, cod: 0 };

    orders.forEach((o) => {
      const rev = Number(o.totalAmount);
      const disc = Number(o.discountAmount);
      totalRevenue += rev;
      totalDiscount += disc;

      const method = String(o.paymentMethod);
      if (paymentMap[method] !== undefined) paymentMap[method] += rev;

      const dateStr = o.createdAt.toISOString().slice(0, 10);
      if (!dailyMap[dateStr]) dailyMap[dateStr] = { orders: 0, revenue: 0, discount: 0 };
      
      dailyMap[dateStr].orders += 1;
      dailyMap[dateStr].revenue += rev;
      dailyMap[dateStr].discount += disc;
    });

    const trendData = Object.keys(dailyMap).sort().map(date => ({
      date,
      orders: dailyMap[date].orders,
      revenue: dailyMap[date].revenue,
      discount: dailyMap[date].discount,
    }));

    const paymentData = [
      { name: 'พร้อมเพย์', value: paymentMap.promptpay, color: '#111827' },
      { name: 'บัตรเครดิต', value: paymentMap.credit_card, color: '#bc876e' },
      { name: 'โอนเงิน', value: paymentMap.bank_transfer, color: '#9ca3af' },
      { name: 'เก็บปลายทาง', value: paymentMap.cod, color: '#f3f4f6' },
    ].filter(p => p.value > 0);

    const completedItems = await prisma.orderItem.findMany({
      where: { order: { status: "COMPLETED", createdAt: { gte: startDate } } },
      include: { book: { include: { category: true } } }
    });

    const categoryMap: Record<string, number> = {};
    completedItems.forEach(item => {
      const catName = item.book?.category?.name || 'ไม่มีหมวดหมู่';
      const itemRev = Number(item.unitPrice) * item.quantity;
      categoryMap[catName] = (categoryMap[catName] || 0) + itemRev;
    });

    const categoryData = Object.keys(categoryMap)
      .map(name => ({ name, revenue: categoryMap[name] }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

   // ==========================================
    // 2. INVENTORY DATA (ข้อมูลสต็อกสินค้า)
    // ==========================================
    const totalTitles = await prisma.book.count();
    const stockAgg = await prisma.book.aggregate({ _sum: { stock: true } });
    const totalItemsInStock = stockAgg._sum.stock || 0;

    // กำหนดว่าสต็อกเหลือน้อยคือจำนวนเท่าไหร่ (เช่น <= 10)
    const LOW_STOCK_THRESHOLD = 10; 

    // 🌟 ดึงข้อมูลโดยเช็กจากตัวเลขสต็อกที่แท้จริง
    const problemBooks = await prisma.book.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD } }, 
      select: { id: true, title: true, stock: true, price: true }, // ไม่ต้องดึง stockStatus มาแล้ว
      orderBy: { stock: 'asc' }
    });

    // 🌟 นับจำนวนจากตัวเลข stock แทน
    const lowStockCount = problemBooks.filter(b => b.stock > 0).length; // มีของแต่น้อยกว่า Threshold
    const outOfStockCount = problemBooks.filter(b => b.stock === 0).length; // หมดเกลี้ยง = 0

    const inventoryData = {
      summary: {
        totalTitles,
        totalItemsInStock,
        lowStockCount,
        outOfStockCount
      },
      problemBooks: problemBooks.map(b => ({
        id: b.id,
        title: b.title,
        stock: b.stock,
        // 🌟 บังคับตั้งสถานะใหม่ตามตัวเลขสต็อก เพื่อส่งไปให้หน้าบ้านโชว์ได้อย่างถูกต้อง
        status: b.stock === 0 ? 'OutOfStock' : 'LowStock', 
        price: Number(b.price)
      }))
    };
    
    return NextResponse.json({
      salesData: {
        summary: {
          totalRevenue,
          totalDiscount,
          netRevenue: totalRevenue - totalDiscount,
          totalOrders: orders.length,
        },
        trendData,
        paymentData,
        categoryData,
      },
      inventoryData
    });

  } catch (error) {
    console.error("Report API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
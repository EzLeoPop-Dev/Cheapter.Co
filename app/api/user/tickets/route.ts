import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { subject, orderId, message, customerName } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    // Generate a simple ID like "TK-123456"
    const id = `TK-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

    // Validate orderId if provided
    let validOrderId = null;
    if (orderId) {
      const orderExists = await prisma.order.findUnique({ where: { id: orderId } });
      if (orderExists) {
        validOrderId = orderId;
        
        // Check for active ticket
        const activeTicket = await prisma.ticket.findFirst({
          where: {
            orderId: validOrderId,
            status: { not: 'CLOSED' }
          }
        });
        
        if (activeTicket) {
          return NextResponse.json(
            { error: `คุณมีรายการแจ้งปัญหาที่กำลังดำเนินการอยู่สำหรับคำสั่งซื้อนี้ (หมายเลข ${activeTicket.id}) กรุณารอแอดมินตอบกลับ` }, 
            { status: 400 }
          );
        }
      }
    }

    const ticket = await prisma.ticket.create({
      data: {
        id,
        subject,
        message,
        orderId: validOrderId,
        customerName: customerName || session?.user?.name || 'Guest',
        userId: session?.user?.id || null,
      },
    });

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ error: error.message || "Failed to create ticket", stack: error.stack }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await prisma.ticket.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch tickets" }, { status: 500 });
  }
}

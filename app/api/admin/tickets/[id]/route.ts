import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    // Add admin check if needed

    const { id } = await params;
    const body = await req.json();
    const { adminNote, status } = body;

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        ...(adminNote !== undefined && { adminNote }),
        ...(status !== undefined && { status }),
        ...(status === 'CLOSED' && { resolvedAt: new Date() }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}

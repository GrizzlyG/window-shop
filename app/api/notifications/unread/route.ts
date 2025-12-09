import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const notifications = await (prisma.notification as any).findMany({
      where: { read: false },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Fetch unread notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

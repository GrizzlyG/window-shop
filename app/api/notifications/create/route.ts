import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { title, body: message, orderId } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Missing title or body" }, { status: 400 });
    }

    const notification = await (prisma.notification as any).create({
      data: {
        title,
        body: message,
        orderId: orderId || null,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

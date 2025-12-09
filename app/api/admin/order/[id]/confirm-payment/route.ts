import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";
import getAdminUser from "@/actions/get-admin-user";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const orderId = params.id;

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Mark payment as confirmed by admin
    const updatedOrder = await (prisma.order as any).update({
      where: { id: orderId },
      data: {
        paymentConfirmed: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Admin confirm payment error:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}

import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orderId = params.id;

    // Fetch order to verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify order belongs to current user
    if (order.userId !== currentUser.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Accept a claimed boolean in the body to allow toggling customer's claim
    const body = await request.json().catch(() => ({}));
    const claimed = typeof body.claimed === "boolean" ? body.claimed : true;

    // Update paymentClaimed (use any cast until Prisma client is regenerated)
    const updatedOrder = await (prisma.order as any).update({
      where: { id: orderId },
      data: {
        paymentClaimed: claimed,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Mark payment confirmed error:", error);
    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}

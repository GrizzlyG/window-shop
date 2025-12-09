import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";
import { CartProductType } from "@/app/product/[productId]/product-details";
import getCurrentUser from "@/actions/get-current-user";

const calculateOrderAmount = (items: CartProductType[]) => {
  const totalPrice = items.reduce((acc, item) => {
    const itemTotal = item.price * item.quantity;

    return acc + itemTotal;
  }, 0);

  return totalPrice;
};

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      );
    }

    // Pre-check stock availability for all items
    for (const item of items) {
      if (!item.id) continue;
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 400 });
      }

      const available = (product as any).remainingStock ?? (product as any).stock ?? 0;
      const desired = item.quantity || 0;
      if (available < desired) {
        return NextResponse.json({
          error: `Insufficient stock for product ${product.name || product.id}. Available: ${available}`,
        }, { status: 400 });
      }
    }

    const total = Math.round(calculateOrderAmount(items));
    const mockPaymentIntentId = `mock_payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Filter items to only include fields defined in CartProductType schema
    const filteredProducts = items.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      brand: item.brand,
      selectedImg: item.selectedImg,
      quantity: item.quantity,
      price: item.price,
    }));

    // Create order
    const order = await prisma.order.create({
      data: {
        user: { connect: { id: currentUser.id } },
        amount: total,
        currency: "NGN",
        status: "pending",
        deliveryStatus: "pending",
        paymentIntentId: mockPaymentIntentId,
        products: filteredProducts,
      },
    });

    // Decrement product remainingStock for each purchased item
    try {
      for (const item of items) {
        if (!item.id) continue;
        const product = await prisma.product.findUnique({ where: { id: item.id } });
        if (!product) continue;

        const currentRemaining = (product as any).remainingStock ?? (product as any).stock ?? 0;
        const newRemaining = Math.max(0, currentRemaining - (item.quantity || 0));

        await (prisma.product as any).update({
          where: { id: product.id },
          data: {
            remainingStock: newRemaining,
            inStock: newRemaining > 0,
          },
        });
      }
    } catch (e) {
      console.error('Error updating product stock after order:', e);
    }

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("Create payment intent error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

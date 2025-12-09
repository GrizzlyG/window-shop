import getCurrentUser from "@/actions/get-current-user";
import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.error();
  }

  const product = await prisma.product.delete({
    where: { id: params.id },
  });

  return NextResponse.json(product);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.error();
  }

  const body = await request.json();
  const {
    name,
    description,
    price,
    brand,
    category,
    inStock,
    images,
    list,
    stock,
    remainingStock,
  } = body;

  // Determine remaining and inStock flag
  const stockNum = stock !== undefined ? parseInt(stock as any, 10) : undefined;
  const remainingNum =
    remainingStock !== undefined
      ? parseInt(remainingStock as any, 10)
      : stockNum !== undefined
      ? stockNum
      : undefined;

  const inStockFlag = remainingNum !== undefined ? remainingNum > 0 : inStock;

  const updateData: any = {
    name,
    description,
    brand,
    category,
    images,
    price: parseFloat(price),
    list: parseFloat(list),
  };

  if (inStockFlag !== undefined) updateData.inStock = inStockFlag;
  if (stockNum !== undefined) updateData.stock = stockNum;
  if (remainingNum !== undefined) updateData.remainingStock = remainingNum;

  const product = await prisma.product.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json(product);
}

import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";

export async function POST(request: Request) {
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
  } = body;

  const stockNum = stock ? parseInt(stock as any, 10) : 0;
  const remaining = stockNum;
  const inStockFlag = remaining > 0;

  const product = await prisma.product.create({
    data: {
      name,
      description,
      brand,
      category,
      inStock: inStockFlag,
      stock: stockNum,
      remainingStock: remaining,
      images,
      price: parseFloat(price),
      list: parseFloat(list),
    },
  });

  return NextResponse.json(product);
}

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) return NextResponse.error();

  if (currentUser.role !== "ADMIN") {
    return NextResponse.error();
  }
  const body = await request.json();
  const { id, inStock } = body;

  const product = await prisma.product.update({
    where: { id: id },
    data: { inStock },
  });

  return NextResponse.json(product);
}

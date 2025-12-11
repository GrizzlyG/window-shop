import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";

const MONGO_URI = process.env.DATABASE_URL?.replace("?replicaSet=rs0", "") || "mongodb://localhost:27017/ecommerce-nextjs-app";

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { nextDeliveryTime } = body;

  if (!nextDeliveryTime) {
    return NextResponse.json({ error: "Delivery time is required" }, { status: 400 });
  }

  const mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  const db = mongoClient.db("ecommerce-nextjs-app");

  try {
    await db.collection("Settings").updateOne(
      { _id: "settings" } as any,
      { 
        $set: { 
          nextDeliveryTime: new Date(nextDeliveryTime),
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );

    await mongoClient.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    await mongoClient.close();
    console.error("Update delivery time error:", error);
    return NextResponse.json({ error: "Failed to update delivery time" }, { status: 500 });
  }
}

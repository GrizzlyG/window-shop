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
  const { spf } = body;

  if (spf === undefined || spf < 0) {
    return NextResponse.json({ error: "Invalid SPF value" }, { status: 400 });
  }

  const mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  const db = mongoClient.db("ecommerce-nextjs-app");

  try {
    await db.collection("Settings").updateOne(
      { _id: "settings" } as any,
      { 
        $set: { 
          spf: spf,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );

    await mongoClient.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    await mongoClient.close();
    console.error("Update SPF error:", error);
    return NextResponse.json({ error: "Failed to update SPF" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";
import { getMongoDb } from "@/libs/mongodb";

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { whatsappNumber } = await request.json();

    if (!whatsappNumber) {
      return NextResponse.json(
        { error: "WhatsApp number is required" },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    await db.collection("Settings").updateOne(
      { _id: "settings" } as any,
      {
        $set: {
          whatsappNumber,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: "WhatsApp number updated successfully" });
  } catch (error) {
    console.error("Error updating WhatsApp number:", error);
    return NextResponse.json(
      { error: "Failed to update WhatsApp number" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";
import { getMongoDb } from "@/libs/mongodb";

export async function GET() {
  try {
    const db = await getMongoDb();
    const settings = await db.collection("Settings").findOne({ _id: "settings" });

    if (!settings) {
      return NextResponse.json({
        bankName: "",
        bankAccountNumber: "",
        accountHolderName: "",
      });
    }

    return NextResponse.json({
      id: settings._id,
      bankName: settings.bankName || "",
      bankAccountNumber: settings.bankAccountNumber || "",
      accountHolderName: settings.accountHolderName || "",
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    // Return empty settings if there's an error
    return NextResponse.json({
      bankName: "",
      bankAccountNumber: "",
      accountHolderName: "",
    });
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    // Only admins can update settings
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bankName, bankAccountNumber, accountHolderName } = body;

    const db = await getMongoDb();
    
    await db.collection("Settings").updateOne(
      { _id: "settings" },
      {
        $set: {
          bankName,
          bankAccountNumber,
          accountHolderName,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    const settings = await db.collection("Settings").findOne({ _id: "settings" });

    return NextResponse.json({
      id: settings?._id,
      bankName: settings?.bankName || "",
      bankAccountNumber: settings?.bankAccountNumber || "",
      accountHolderName: settings?.accountHolderName || "",
      updatedAt: settings?.updatedAt,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

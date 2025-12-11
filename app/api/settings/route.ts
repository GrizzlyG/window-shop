import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";
import { getMongoDb } from "@/libs/mongodb";

export async function GET() {
  try {
    const db = await getMongoDb();
    const settings = await db.collection("Settings").findOne({ _id: "settings" } as any);

    if (!settings) {
      return NextResponse.json({
        bankName: "",
        bankAccountNumber: "",
        accountHolderName: "",
        hostels: [],
        spf: 100,
      });
    }

    return NextResponse.json({
      id: settings._id,
      bankName: settings.bankName || "",
      bankAccountNumber: settings.bankAccountNumber || "",
      accountHolderName: settings.accountHolderName || "",
      hostels: settings.hostels || [],
      spf: settings.spf || 100,
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    // Return empty settings if there's an error
    return NextResponse.json({
      bankName: "",
      bankAccountNumber: "",
      accountHolderName: "",
      hostels: [],
      spf: 100,
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
    const { bankName, bankAccountNumber, accountHolderName, hostels } = body;

    const db = await getMongoDb();
    
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (bankName !== undefined) updateData.bankName = bankName;
    if (bankAccountNumber !== undefined) updateData.bankAccountNumber = bankAccountNumber;
    if (accountHolderName !== undefined) updateData.accountHolderName = accountHolderName;
    if (hostels !== undefined) updateData.hostels = hostels;
    
    await db.collection("Settings").updateOne(
      { _id: "settings" } as any,
      {
        $set: updateData,
      },
      { upsert: true }
    );

    const settings = await db.collection("Settings").findOne({ _id: "settings" } as any);

    return NextResponse.json({
      id: settings?._id,
      bankName: settings?.bankName || "",
      bankAccountNumber: settings?.bankAccountNumber || "",
      accountHolderName: settings?.accountHolderName || "",
      hostels: settings?.hostels || [],
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

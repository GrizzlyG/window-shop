import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";
import prisma from "@/libs/prismadb";

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: "settings" },
    });

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
      id: settings.id,
      bankName: settings.bankName || "",
      bankAccountNumber: settings.bankAccountNumber || "",
      accountHolderName: settings.accountHolderName || "",
      hostels: settings.hostels || [],
      spf: settings.spf || 100,
      nextDeliveryTime: settings.nextDeliveryTime,
      whatsappNumber: settings.whatsappNumber,
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

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (bankName !== undefined) updateData.bankName = bankName;
    if (bankAccountNumber !== undefined) updateData.bankAccountNumber = bankAccountNumber;
    if (accountHolderName !== undefined) updateData.accountHolderName = accountHolderName;
    if (hostels !== undefined) updateData.hostels = hostels;
    
    const settings = await prisma.settings.upsert({
      where: { id: "settings" },
      update: updateData,
      create: {
        id: "settings",
        bankName: bankName || "",
        bankAccountNumber: bankAccountNumber || "",
        accountHolderName: accountHolderName || "",
        hostels: hostels || [],
        spf: 100,
      },
    });

    return NextResponse.json({
      id: settings.id,
      bankName: settings.bankName || "",
      bankAccountNumber: settings.bankAccountNumber || "",
      accountHolderName: settings.accountHolderName || "",
      hostels: settings.hostels || [],
      spf: settings.spf,
      nextDeliveryTime: settings.nextDeliveryTime,
      whatsappNumber: settings.whatsappNumber,
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

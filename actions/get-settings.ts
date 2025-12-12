import prisma from "@/libs/prismadb";

export default async function getSettings() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: "settings" },
    });

    if (!settings) {
      return {
        id: "settings",
        bankName: "",
        bankAccountNumber: "",
        accountHolderName: "",
        hostels: [],
        spf: 100,
        bannerTitle: "Summer Sale!",
        bannerSubtitle: "Enjoy discounts on selected items",
        bannerDiscount: "GET 20% OFF",
        bannerImage: "/banner-image.png",
        bannerColors: ["blue", "indigo"],
        nextDeliveryTime: null,
        whatsappNumber: null,
        updatedAt: new Date(),
      };
    }

    return {
      id: settings.id,
      bankName: settings.bankName || "",
      bankAccountNumber: settings.bankAccountNumber || "",
      accountHolderName: settings.accountHolderName || "",
      hostels: settings.hostels || [],
      spf: settings.spf || 100,
      bannerTitle: settings.bannerTitle || "Summer Sale!",
      bannerSubtitle: settings.bannerSubtitle || "Enjoy discounts on selected items",
      bannerDiscount: settings.bannerDiscount || "GET 20% OFF",
      bannerImage: settings.bannerImage || "/banner-image.png",
      bannerColors: settings.bannerColors || ["blue", "indigo"],
      nextDeliveryTime: settings.nextDeliveryTime || null,
      whatsappNumber: settings.whatsappNumber || null,
      updatedAt: settings.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {
      id: "settings",
      bankName: "",
      bankAccountNumber: "",
      accountHolderName: "",
      hostels: [],
      spf: 100,
      bannerTitle: "Summer Sale!",
      bannerSubtitle: "Enjoy discounts on selected items",
      bannerDiscount: "GET 20% OFF",
      bannerImage: "/banner-image.png",
      bannerColors: ["blue", "indigo"],
      nextDeliveryTime: null,
      whatsappNumber: null,
      updatedAt: new Date(),
    };
  }
}

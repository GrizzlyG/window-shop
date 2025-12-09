import prisma from "@/libs/prismadb";

export default async function getSettings() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: "settings" },
    });

    if (!settings) {
      return {
        bankName: "",
        bankAccountNumber: "",
        accountHolderName: "",
      };
    }

    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {
      bankName: "",
      bankAccountNumber: "",
      accountHolderName: "",
    };
  }
}

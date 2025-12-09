import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    // Hash the password using bcryptjs
    const hashedPassword = await bcrypt.hash("adminpass", 10);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists. Skipping seed.");
      return;
    }

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("✓ Admin user created successfully!");
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Password: adminpass`);
    console.log(`  Role: ${adminUser.role}`);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();

import { PrismaClient } from "@prisma/client";

// Direct MongoDB access through Prisma's internal client
const mongoUri = process.env.DATABASE_URL;

if (!mongoUri) {
  throw new Error("DATABASE_URL is not set");
}

// MongoDB connection using native driver through Prisma
let cachedConnection: any = null;

export async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  // Use Prisma's $executeRawUnsafe for direct MongoDB operations
  const prisma = new PrismaClient();
  
  cachedConnection = {
    prisma,
    async executeRaw(operation: string, params?: any[]) {
      return prisma.$executeRawUnsafe(operation, ...(params || []));
    },
  };

  return cachedConnection;
}

// For MongoDB operations, we'll use Prisma's queryRaw with aggregation
export async function getMongoDb() {
  const mongoUri = process.env.DATABASE_URL;
  if (!mongoUri) throw new Error("DATABASE_URL not set");

  // Dynamically import mongodb module
  const { MongoClient } = await import("mongodb");
  
  if (!global.mongoClient) {
    global.mongoClient = new MongoClient(mongoUri);
    await (global.mongoClient as any).connect();
  }
  
  return (global.mongoClient as any).db("ecommerce-nextjs-app");
}

declare global {
  var mongoClient: any;
}

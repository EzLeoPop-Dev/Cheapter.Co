import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

// Next.js hot-reloading can create multiple Prisma instances.
// We only want to create one connection pool.
const pool = globalForPrisma.pgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Limit connections per Next.js app instance
});

if (process.env.NODE_ENV !== "production") globalForPrisma.pgPool = pool;

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
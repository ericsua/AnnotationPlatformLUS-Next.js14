import { PrismaClient } from "@prisma/client";

// A singleton for PrismaClient so it can be shared in development
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// Check if PrismaClient is already defined, in development it will also print queries to the console
// ?? is the nullish coalescing operator, it returns the right-hand operand if the left-hand operand is null or undefined
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query'] : []});

// If not in production, set the global prisma object to the PrismaClient instance to avoid multiple instances of PrismaClient during hot-reloading
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

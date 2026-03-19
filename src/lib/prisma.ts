import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client singleton pattern for Next.js
 * Prevents multiple instances in development due to hot reloading
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const runtimeDatabaseUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.DIRECT_URL || process.env.DATABASE_URL
    : process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: runtimeDatabaseUrl
      ? {
          db: {
            url: runtimeDatabaseUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client singleton pattern for Next.js
 * Prevents multiple instances in development due to hot reloading
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function normalizeRuntimeDatabaseUrl(url: string | undefined) {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    const isSupabasePooler = parsed.hostname.includes('.pooler.supabase.com');

    if (!isSupabasePooler) {
      return url;
    }

    if (!parsed.searchParams.has('pgbouncer')) {
      parsed.searchParams.set('pgbouncer', 'true');
    }

    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '1');
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

const runtimeDatabaseUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.DIRECT_URL || process.env.DATABASE_URL
    : normalizeRuntimeDatabaseUrl(process.env.DATABASE_URL);

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

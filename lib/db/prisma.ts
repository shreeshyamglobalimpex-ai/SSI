import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Builds the datasource URL with serverless-friendly pool settings.
 *
 * The database runs on Neon behind its connection pooler (PgBouncer, the
 * `-pooler` endpoint). The pooler is designed to accept many concurrent client
 * connections and multiplex them onto a small number of real Postgres
 * connections, so a modest client-side pool is both safe and necessary:
 *
 *   1. `connection_limit=10` — enough headroom for Next.js to render pages in
 *      parallel at build time (static generation) without serialising every
 *      query through a single connection (which caused pool timeouts at 1).
 *   2. `pool_timeout` / `connect_timeout` — fail fast instead of hanging so the
 *      `withDbRetry` wrapper can reconnect cleanly.
 *
 * Any params already present in DATABASE_URL are preserved; ours only fill
 * gaps so a manually-tuned production URL still wins.
 */
function datasourceUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return raw; // Non-URL string — hand it to Prisma untouched.
  }

  if (!url.searchParams.has("connection_limit"))
    url.searchParams.set("connection_limit", "10");
  if (!url.searchParams.has("pool_timeout"))
    url.searchParams.set("pool_timeout", "20");
  if (!url.searchParams.has("connect_timeout"))
    url.searchParams.set("connect_timeout", "10");

  return url.toString();
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url: datasourceUrl() } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/**
 * Runs a Prisma operation, retrying once on transient connection failures.
 *
 * Neon serverless closes idle connections between requests, so the first query
 * after a quiet period can fail with a "connection closed" style error even
 * though the database is healthy. Those errors are safe to retry because the
 * query never executed. We only retry the known-transient Prisma error codes
 * (P1001 can't reach DB, P2024 timed out acquiring a connection) and give up
 * immediately on everything else so real errors surface fast.
 */
const RETRYABLE = new Set(["P1001", "P1002", "P2024"]);

export async function withDbRetry<T>(
  operation: () => Promise<T>,
  attempts = 2,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const code = (error as { code?: string } | null)?.code;
      const isTransient =
        RETRYABLE.has(code ?? "") ||
        // Neon's driver sometimes surfaces a bare "Closed" without a Prisma code.
        String((error as { message?: string } | null)?.message ?? "").includes(
          "Closed",
        );
      if (!isTransient || i === attempts - 1) break;
      // Small backoff before reconnecting.
      await new Promise((r) => setTimeout(r, 150 * (i + 1)));
    }
  }
  throw lastError;
}

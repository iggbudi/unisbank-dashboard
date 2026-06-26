// ============================================
// Database Connection: Turso (SQLite Edge)
// ============================================

import { createClient, type Client } from "@libsql/client";

// Helper functions untuk query
export async function query<T = any>(
  sql: string,
  args?: any[]
): Promise<T[]> {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const result = await db.execute({ sql, args: args || [] });
  return result.rows as T[];
}

export async function queryOne<T = any>(
  sql: string,
  args?: any[]
): Promise<T | null> {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const result = await db.execute({ sql, args: args || [] });
  return (result.rows[0] as T) || null;
}

export async function execute(
  sql: string,
  args?: any[]
): Promise<void> {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  await db.execute({ sql, args: args || [] });
}

export async function executeBatch(
  statements: { sql: string; args?: any[] }[]
): Promise<void> {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  await db.batch(statements.map(s => ({
    sql: s.sql,
    args: s.args || []
  })));
}

// ============================================
// Database Connection: Turso (SQLite Edge)
// ============================================

import { createClient, type Client } from "@libsql/client";

// Singleton pattern untuk connection
let client: Client | null = null;

export function getDb(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

// Helper functions untuk query
export async function query<T = any>(
  sql: string,
  args?: any[]
): Promise<T[]> {
  const db = getDb();
  const result = await db.execute({ sql, args: args || [] });
  return result.rows as T[];
}

export async function queryOne<T = any>(
  sql: string,
  args?: any[]
): Promise<T | null> {
  const db = getDb();
  const result = await db.execute({ sql, args: args || [] });
  return (result.rows[0] as T) || null;
}

export async function execute(
  sql: string,
  args?: any[]
): Promise<void> {
  const db = getDb();
  await db.execute({ sql, args: args || [] });
}

export async function executeBatch(
  statements: { sql: string; args?: any[] }[]
): Promise<void> {
  const db = getDb();
  await db.batch(statements.map(s => ({
    sql: s.sql,
    args: s.args || []
  })));
}

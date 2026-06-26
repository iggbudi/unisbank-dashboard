// ============================================
// Database Connection: Turso (SQLite Edge)
// ============================================

import { createClient, type Client } from "@libsql/client";

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL) throw new Error("Missing TURSO_DATABASE_URL env var");

function getClient(): Client {
  return createClient({ url: TURSO_URL!, authToken: TURSO_TOKEN });
}

// Helper functions untuk query
export async function query<T = any>(
  sql: string,
  args?: any[]
): Promise<T[]> {
  const db = getClient();
  const result = await db.execute({ sql, args: args || [] });
  return result.rows as T[];
}

export async function queryOne<T = any>(
  sql: string,
  args?: any[]
): Promise<T | null> {
  const db = getClient();
  const result = await db.execute({ sql, args: args || [] });
  return (result.rows[0] as T) || null;
}

export async function execute(
  sql: string,
  args?: any[]
): Promise<void> {
  const db = getClient();
  await db.execute({ sql, args: args || [] });
}

export async function executeBatch(
  statements: { sql: string; args?: any[] }[]
): Promise<void> {
  const db = getClient();
  await db.batch(statements.map(s => ({
    sql: s.sql,
    args: s.args || []
  })));
}

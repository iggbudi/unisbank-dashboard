// ============================================
// Script: Initialize Database Schema & Seed
// Run: npx tsx scripts/init-db.ts
// ============================================

import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// Load .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env.local") });

// Helper to clean SQL statements
function cleanSQL(sql: string): string {
  return sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .trim();
}

function splitStatements(sql: string): string[] {
  return sql
    .split(';')
    .map(s => cleanSQL(s))
    .filter(s => s.length > 0)
    .filter(s => !s.match(/^\s*$/));
}

async function main() {
  console.log("🚀 Initializing database...");

  const dbUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!dbUrl || !authToken) {
    console.error("❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local");
    process.exit(1);
  }

  console.log("📡 Connecting to:", dbUrl);

  const client = createClient({
    url: dbUrl,
    authToken: authToken,
  });

  try {
    // Test connection
    await client.execute("SELECT 1");
    console.log("✅ Connected to Turso successfully!");

    // Baca schema SQL
    const schemaSQL = readFileSync(
      join(__dirname, "schema.sql"),
      "utf-8"
    );

    // Execute schema
    console.log("📝 Creating tables...");
    const schemaStatements = splitStatements(schemaSQL);
    console.log(`   Found ${schemaStatements.length} statements`);

    for (const sql of schemaStatements) {
      if (sql.trim()) {
        try {
          await client.execute(sql);
        } catch (e: any) {
          console.log(`   ⚠️ Skipping: ${e.message?.substring(0, 50)}`);
        }
      }
    }
    console.log("✅ Tables created successfully");

    // Baca seed SQL
    const seedSQL = readFileSync(
      join(__dirname, "seed.sql"),
      "utf-8"
    );

    // Execute seed
    console.log("🌱 Seeding data...");
    const seedStatements = splitStatements(seedSQL);
    console.log(`   Found ${seedStatements.length} statements`);

    for (const sql of seedStatements) {
      if (sql.trim()) {
        try {
          await client.execute(sql);
        } catch (e: any) {
          // Skip duplicate errors
          if (!e.message?.includes('UNIQUE')) {
            console.log(`   ⚠️ ${e.message?.substring(0, 80)}`);
          }
        }
      }
    }
    console.log("✅ Data seeded successfully");

    // Verify
    const result = await client.execute("SELECT COUNT(*) as count FROM dosen");
    console.log(`\n📊 Total dosen in database: ${result.rows[0].count}`);

    // Show all dosen
    const dosenList = await client.execute("SELECT id, nama FROM dosen ORDER BY id");
    console.log("\n👥 Dosen List:");
    for (const d of dosenList.rows) {
      console.log(`   ${d.id}. ${d.nama}`);
    }

    console.log("\n✨ Database initialization complete!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();

// ============================================
// Script: Sync publikasi dari Google Scholar ke DB
// Run: npx tsx scripts/sync-scholar.ts
// ============================================

import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env.local") });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

interface ScholarPub {
  title: string;
  authors: string;
  journal: string;
  year: number;
  citations: number;
}

// Parse publications from Google Scholar HTML
function parsePublications(html: string): ScholarPub[] {
  const pubs: ScholarPub[] = [];

  // Match each table row in the publications list
  // Pattern: title in <a> tag, then authors/journal line, then citations and year
  const rowRegex =
    /class="gsc_a_t"[\s\S]*?<a[^>]*class="gsc_a_at"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<div class="gs_gray">([\s\S]*?)<\/div>[\s\S]*?<div class="gs_gray">([\s\S]*?)<\/div>[\s\S]*?class="gsc_a_c"><a[^>]*>(\d*)<\/a>[\s\S]*?class="gsc_a_y"><span class="gsc_a_h">(\d*)/g;

  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const title = stripHtml(match[1]).trim();
    const authors = stripHtml(match[2]).trim();
    const journal = stripHtml(match[3]).trim();
    const citations = parseInt(match[4]) || 0;
    const year = parseInt(match[5]) || 0;

    if (title) {
      pubs.push({ title, authors, journal, year, citations });
    }
  }

  return pubs;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchScholarPage(
  scholarId: string,
  start: number
): Promise<string> {
  const url = `https://scholar.google.com/citations?user=${scholarId}&hl=en&cstart=${start}&pagesize=100`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function fetchAllPublications(scholarId: string): Promise<ScholarPub[]> {
  const allPubs: ScholarPub[] = [];
  let start = 0;
  const maxPages = 10; // safety limit

  for (let page = 0; page < maxPages; page++) {
    console.log(`    Fetching page ${page + 1} (start=${start})...`);
    const html = await fetchScholarPage(scholarId, start);
    const pubs = parsePublications(html);

    if (pubs.length === 0) break;
    allPubs.push(...pubs);

    // Check if there's a "Show more" button
    if (!html.includes("gsc_bpf_more") || pubs.length < 100) break;
    start += 100;

    // Delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 2000));
  }

  return allPubs;
}

// Normalize title for dedup comparison
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  console.log("🔄 Sync publikasi dari Google Scholar\n");

  // Get all dosen with valid google_scholar_id
  const dosenList = await db.execute(`
    SELECT id, nama, google_scholar_id 
    FROM dosen 
    WHERE google_scholar_id IS NOT NULL AND google_scholar_id != ''
    ORDER BY nama
  `);

  console.log(`📋 Dosen dengan Google Scholar ID: ${dosenList.rows.length}\n`);

  let totalInserted = 0;

  for (const dosen of dosenList.rows) {
    const dosenId = dosen.id as number;
    const nama = dosen.nama as string;
    const scholarId = dosen.google_scholar_id as string;

    console.log(`\n👤 ${nama} (${scholarId})`);

    // Get existing publications
    const existing = await db.execute(
      "SELECT judul FROM publikasi WHERE dosen_id = ?",
      [dosenId]
    );
    const existingTitles = new Set(
      existing.rows.map((r) => normalizeTitle(r.judul as string))
    );

    console.log(`   DB: ${existing.rows.length} publikasi`);

    try {
      // Fetch from Scholar
      const scholarPubs = await fetchAllPublications(scholarId);
      console.log(`   Scholar: ${scholarPubs.length} publikasi`);

      // Find missing
      const missing = scholarPubs.filter(
        (p) => !existingTitles.has(normalizeTitle(p.title))
      );
      console.log(`   Missing: ${missing.length}`);

      if (missing.length > 0) {
        // Insert missing publications
        for (const pub of missing) {
          try {
            await db.execute(
              `INSERT INTO publikasi (dosen_id, judul, tahun, sitasi, jurnal, is_top)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                dosenId,
                pub.title,
                pub.year || null,
                pub.citations || 0,
                pub.journal || null,
                pub.citations >= 50 ? 1 : 0,
              ]
            );
            totalInserted++;
          } catch (e: any) {
            if (!e.message?.includes("UNIQUE")) {
              console.log(`   ⚠️ Insert error: ${e.message?.slice(0, 80)}`);
            }
          }
        }
        console.log(`   ✅ ${missing.length} publikasi ditambahkan`);
      } else {
        console.log(`   ✅ Sudah sinkron`);
      }
    } catch (e: any) {
      console.log(`   ❌ Error: ${e.message?.slice(0, 100)}`);
    }

    // Delay between dosen
    await new Promise((r) => setTimeout(r, 3000));
  }

  // Update metrics (jumlah_publikasi)
  console.log("\n📊 Update jumlah_publikasi di metrics_dosen...");
  await db.execute(`
    UPDATE metrics_dosen
    SET jumlah_publikasi = (
      SELECT COUNT(*) FROM publikasi WHERE publikasi.dosen_id = metrics_dosen.dosen_id
    )
  `);

  console.log(`\n✨ Selesai! Total ${totalInserted} publikasi ditambahkan.`);
  await db.close();
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});

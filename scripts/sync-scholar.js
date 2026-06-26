const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function stripHtml(html) {
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

function normalizeTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function parsePubs(html) {
  const pubs = [];
  const rows = html.split('class="gsc_a_t"');
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const titleMatch = row.match(/class="gsc_a_at"[^>]*>([\s\S]*?)<\/a>/);
    if (!titleMatch) continue;
    const title = stripHtml(titleMatch[1]);
    const grayMatches = [...row.matchAll(/class="gs_gray">([\s\S]*?)<\/div>/g)];
    const journal = grayMatches[1] ? stripHtml(grayMatches[1][1]) : "";
    const citMatch = row.match(/class="gsc_a_c"><a[^>]*>(\d*)<\/a>/);
    const citations = citMatch ? parseInt(citMatch[1]) || 0 : 0;
    const yearMatch = row.match(/class="gsc_a_y"><span class="gsc_a_h">(\d*)/);
    const year = yearMatch ? parseInt(yearMatch[1]) || 0 : 0;
    if (title) pubs.push({ title, journal, year, citations });
  }
  return pubs;
}

async function fetchScholar(scholarId, start) {
  const url = `https://scholar.google.com/citations?user=${scholarId}&hl=en&cstart=${start}&pagesize=100`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const reader = res.body.getReader();
  const chunks = [];
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(decoder.decode(value, { stream: true }));
  }
  return chunks.join("");
}

async function fetchAllPubs(scholarId) {
  const allPubs = [];
  for (let start = 0; start < 2000; start += 100) {
    process.stdout.write(`    Page ${start / 100 + 1}...`);
    const html = await fetchScholar(scholarId, start);
    const pubs = parsePubs(html);
    console.log(` ${pubs.length} pubs`);
    if (pubs.length === 0) break;
    allPubs.push(...pubs);
    if (!html.includes("gsc_bpf_more") || pubs.length < 100) break;
    await new Promise((r) => setTimeout(r, 2000));
  }
  return allPubs;
}

(async () => {
  console.log("🔄 Sync publikasi dari Google Scholar\n");

  const dosenList = await db.execute(`
    SELECT id, nama, google_scholar_id 
    FROM dosen 
    WHERE google_scholar_id IS NOT NULL AND google_scholar_id != ''
    ORDER BY nama
  `);
  console.log(`📋 ${dosenList.rows.length} dosen dengan Scholar ID\n`);

  let totalInserted = 0;

  for (const dosen of dosenList.rows) {
    const dosenId = dosen.id;
    const nama = dosen.nama;
    const scholarId = dosen.google_scholar_id;
    console.log(`\n👤 ${nama} (${scholarId})`);

    const existing = await db.execute(
      "SELECT judul FROM publikasi WHERE dosen_id = ?",
      [dosenId]
    );
    const existingTitles = new Set(
      existing.rows.map((r) => normalizeTitle(r.judul))
    );
    console.log(`   DB: ${existing.rows.length} publikasi`);

    try {
      const scholarPubs = await fetchAllPubs(scholarId);
      console.log(`   Scholar: ${scholarPubs.length} publikasi`);

      const missing = scholarPubs.filter(
        (p) => !existingTitles.has(normalizeTitle(p.title))
      );
      console.log(`   Missing: ${missing.length}`);

      for (const pub of missing) {
        try {
          await db.execute(
            "INSERT INTO publikasi (dosen_id, judul, tahun, sitasi, jurnal, is_top) VALUES (?, ?, ?, ?, ?, ?)",
            [dosenId, pub.title, pub.year || null, pub.citations || 0, pub.journal || null, pub.citations >= 50 ? 1 : 0]
          );
          totalInserted++;
        } catch (e) {
          if (!String(e).includes("UNIQUE"))
            console.log(`   ⚠️ ${String(e).slice(0, 80)}`);
        }
      }
      if (missing.length > 0) console.log(`   ✅ ${missing.length} ditambahkan`);
      else console.log(`   ✅ Sinkron`);
    } catch (e) {
      console.log(`   ❌ ${String(e).slice(0, 100)}`);
    }

    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log("\n📊 Update jumlah_publikasi...");
  await db.execute(`
    UPDATE metrics_dosen 
    SET jumlah_publikasi = (
      SELECT COUNT(*) FROM publikasi WHERE publikasi.dosen_id = metrics_dosen.dosen_id
    )
  `);

  console.log(`\n✨ Selesai! Total ${totalInserted} publikasi ditambahkan`);
  await db.close();
})();

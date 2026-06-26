const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function fetchScholar(scholarId) {
  const url = `https://scholar.google.com/citations?user=${scholarId}&hl=en`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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

function parseTrenSitasi(html) {
  const years = [...html.matchAll(/<span class="gsc_g_t"[^>]*>(\d{4})<\/span>/g)].map(m => parseInt(m[1]));
  const cits = [...html.matchAll(/<span class="gsc_g_al">(\d+)<\/span>/g)].map(m => parseInt(m[1]));
  return years.map((y, i) => ({ tahun: y, sitasi: cits[i] || 0 }));
}

(async () => {
  console.log("🔄 Sync tren sitasi dari Google Scholar\n");

  const dosenList = await db.execute(`
    SELECT id, nama, google_scholar_id 
    FROM dosen 
    WHERE google_scholar_id IS NOT NULL AND google_scholar_id != ''
    ORDER BY nama
  `);
  console.log(`📋 ${dosenList.rows.length} dosen\n`);

  let totalInserted = 0;

  for (const dosen of dosenList.rows) {
    const dosenId = dosen.id;
    const nama = dosen.nama;
    const scholarId = dosen.google_scholar_id;
    process.stdout.write(`👤 ${nama}... `);

    try {
      const html = await fetchScholar(scholarId);
      const tren = parseTrenSitasi(html);
      console.log(`${tren.length} tahun`);

      // Delete existing and re-insert
      await db.execute("DELETE FROM tren_sitasi WHERE dosen_id = ?", [dosenId]);

      for (const t of tren) {
        await db.execute(
          "INSERT OR REPLACE INTO tren_sitasi (dosen_id, tahun, sitasi) VALUES (?, ?, ?)",
          [dosenId, t.tahun, t.sitasi]
        );
        totalInserted++;
      }
    } catch (e) {
      console.log(`❌ ${String(e).slice(0, 80)}`);
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n✨ Selesai! ${totalInserted} data tren ditambahkan`);
  await db.close();
})();

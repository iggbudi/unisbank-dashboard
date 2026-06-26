import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function parsePubs(html: string) {
  const pubs: { title: string; journal: string; year: number; citations: number }[] = [];
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

function parseTren(html: string) {
  const years = [...html.matchAll(/<span class="gsc_g_t"[^>]*>(\d{4})<\/span>/g)].map((m) => parseInt(m[1]));
  const cits = [...html.matchAll(/<span class="gsc_g_al">(\d+)<\/span>/g)].map((m) => parseInt(m[1]));
  return years.map((y, i) => ({ tahun: y, sitasi: cits[i] || 0 }));
}

async function fetchScholar(scholarId: string): Promise<string> {
  const url = `https://scholar.google.com/citations?user=${scholarId}&hl=en&pagesize=100`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.body) throw new Error("No body");
  const reader = res.body.getReader();
  const chunks: string[] = [];
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(decoder.decode(value, { stream: true }));
  }
  return chunks.join("");
}

export async function POST(request: Request) {
  try {
    const { dosen_id, type } = await request.json();

    if (type === "tren" && dosen_id) {
      // Sync tren sitasi for one dosen
      const dosen = await query<{ id: number; nama: string; google_scholar_id: string }>(
        "SELECT id, nama, google_scholar_id FROM dosen WHERE id = ?",
        [dosen_id]
      );
      if (!dosen[0]?.google_scholar_id) {
        return NextResponse.json({ success: false, error: "Dosen tidak punya Google Scholar ID" }, { status: 400 });
      }

      const html = await fetchScholar(dosen[0].google_scholar_id);
      const tren = parseTren(html);
      await execute("DELETE FROM tren_sitasi WHERE dosen_id = ?", [dosen_id]);
      for (const t of tren) {
        await execute("INSERT INTO tren_sitasi (dosen_id, tahun, sitasi) VALUES (?, ?, ?)", [dosen_id, t.tahun, t.sitasi]);
      }
      return NextResponse.json({ success: true, count: tren.length, dosen: dosen[0].nama });
    }

    if (type === "publikasi" && dosen_id) {
      // Sync publikasi for one dosen
      const dosen = await query<{ id: number; nama: string; google_scholar_id: string }>(
        "SELECT id, nama, google_scholar_id FROM dosen WHERE id = ?",
        [dosen_id]
      );
      if (!dosen[0]?.google_scholar_id) {
        return NextResponse.json({ success: false, error: "Dosen tidak punya Google Scholar ID" }, { status: 400 });
      }

      const existing = await query<{ judul: string }>("SELECT judul FROM publikasi WHERE dosen_id = ?", [dosen_id]);
      const existingTitles = new Set(existing.map((r) => normalizeTitle(r.judul)));

      // Fetch all pages
      const allPubs: { title: string; journal: string; year: number; citations: number }[] = [];
      for (let start = 0; start < 2000; start += 100) {
        const url = `https://scholar.google.com/citations?user=${dosen[0].google_scholar_id}&hl=en&cstart=${start}&pagesize=100`;
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
        });
        if (!res.ok) break;
        if (!res.body) throw new Error("No body");
  const reader = res.body.getReader();
        const chunks: string[] = [];
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(decoder.decode(value, { stream: true }));
        }
        const html = chunks.join("");
        const pubs = parsePubs(html);
        if (pubs.length === 0) break;
        allPubs.push(...pubs);
        if (!html.includes("gsc_bpf_more") || pubs.length < 100) break;
        await new Promise((r) => setTimeout(r, 2000));
      }

      const missing = allPubs.filter((p) => !existingTitles.has(normalizeTitle(p.title)));
      let inserted = 0;
      for (const pub of missing) {
        try {
          await execute(
            "INSERT INTO publikasi (dosen_id, judul, tahun, sitasi, jurnal, is_top) VALUES (?, ?, ?, ?, ?, ?)",
            [dosen_id, pub.title, pub.year || null, pub.citations || 0, pub.journal || null, pub.citations >= 50 ? 1 : 0]
          );
          inserted++;
        } catch {
          // skip duplicates
        }
      }

      // Update jumlah_publikasi
      await execute(
        "UPDATE metrics_dosen SET jumlah_publikasi = (SELECT COUNT(*) FROM publikasi WHERE dosen_id = ?) WHERE dosen_id = ?",
        [dosen_id, dosen_id]
      );

      return NextResponse.json({ success: true, total: allPubs.length, inserted, dosen: dosen[0].nama });
    }

    return NextResponse.json({ success: false, error: "Parameter tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ success: false, error: String(error).slice(0, 100) }, { status: 500 });
  }
}

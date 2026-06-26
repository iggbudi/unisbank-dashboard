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

async function fetchPage(url: string, timeoutMs = 15000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!res.body) throw new Error("No response body");
    const reader = res.body.getReader();
    const chunks: string[] = [];
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(decoder.decode(value, { stream: true }));
    }
    return chunks.join("");
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

export async function POST(request: Request) {
  try {
    const { dosen_id, type } = await request.json();

    if (!dosen_id) {
      return NextResponse.json({ success: false, error: "dosen_id wajib diisi" }, { status: 400 });
    }

    const dosen = await query<{ id: number; nama: string; google_scholar_id: string }>(
      "SELECT id, nama, google_scholar_id FROM dosen WHERE id = ?",
      [dosen_id]
    );

    if (!dosen[0]) {
      return NextResponse.json({ success: false, error: "Dosen tidak ditemukan" }, { status: 404 });
    }

    if (!dosen[0].google_scholar_id) {
      return NextResponse.json({ success: false, error: "Dosen tidak punya Google Scholar ID" }, { status: 400 });
    }

    const scholarId = dosen[0].google_scholar_id;
    const nama = dosen[0].nama;

    if (type === "tren") {
      const url = `https://scholar.google.com/citations?user=${scholarId}&hl=en`;
      const html = await fetchPage(url);
      const tren = parseTren(html);

      if (tren.length === 0) {
        return NextResponse.json({
          success: false,
          error: "Gagal parse tren sitasi. Mungkin Scholar memblokir request.",
          debug: { htmlLength: html.length, hasGscGt: html.includes("gsc_g_t"), hasGscGal: html.includes("gsc_g_al") },
        });
      }

      await execute("DELETE FROM tren_sitasi WHERE dosen_id = ?", [dosen_id]);
      for (const t of tren) {
        await execute("INSERT INTO tren_sitasi (dosen_id, tahun, sitasi) VALUES (?, ?, ?)", [dosen_id, t.tahun, t.sitasi]);
      }
      return NextResponse.json({ success: true, count: tren.length, dosen: nama });
    }

    if (type === "publikasi") {
      const existing = await query<{ judul: string }>("SELECT judul FROM publikasi WHERE dosen_id = ?", [dosen_id]);
      const existingTitles = new Set(existing.map((r) => normalizeTitle(r.judul)));

      const allPubs: { title: string; journal: string; year: number; citations: number }[] = [];
      let page = 0;

      for (let start = 0; start < 2000; start += 100) {
        page++;
        const url = `https://scholar.google.com/citations?user=${scholarId}&hl=en&cstart=${start}&pagesize=100`;
        const html = await fetchPage(url);
        const pubs = parsePubs(html);

        if (pubs.length === 0) {
          if (page === 1) {
            return NextResponse.json({
              success: false,
              error: "Gagal parse publikasi. Mungkin Scholar memblokir request.",
              debug: { htmlLength: html.length, hasGscAt: html.includes("gsc_a_at"), hasGscT: html.includes("gsc_a_t"), snippet: html.slice(0, 500) },
            });
          }
          break;
        }

        allPubs.push(...pubs);
        if (!html.includes("gsc_bpf_more") || pubs.length < 100) break;
        await new Promise((r) => setTimeout(r, 1500));
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

      await execute(
        "UPDATE metrics_dosen SET jumlah_publikasi = (SELECT COUNT(*) FROM publikasi WHERE dosen_id = ?) WHERE dosen_id = ?",
        [dosen_id, dosen_id]
      );

      return NextResponse.json({ success: true, total: allPubs.length, inserted, existing: existingTitles.size, dosen: nama });
    }

    return NextResponse.json({ success: false, error: "Type tidak valid. Gunakan 'publikasi' atau 'tren'." }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Sync error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

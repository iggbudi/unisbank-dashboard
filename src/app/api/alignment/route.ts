import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { extractKeywords, getDomain, synonymMatch } from "@/lib/scoring";

interface DosenData {
  id: number;
  nama: string;
}

interface MataKuliahData {
  id: number;
  nama: string;
}

interface PublikasiData {
  judul: string;
}

interface KompetensiData {
  bidang: string;
  tingkat: number;
}

interface ScoreBreakdown {
  keyword: number;
  sinonim: number;
  domain: number;
  kompetensi: number;
  publikasi: number;
  total: number;
}

interface MatkulDetail {
  matkul: string;
  score: number;
  breakdown: ScoreBreakdown;
  matchedPapers: string[];
  matchedDomains: string[];
}

// ============================================
// SCORING FORMULA
// ============================================

function computeScore(
  mk: MataKuliahData,
  publikasi: PublikasiData[],
  kompetensi: KompetensiData[]
): MatkulDetail {
  const mkKeywords = extractKeywords(mk.nama);
  const mkDomains = getDomain(mk.nama);
  const matchedPapers: string[] = [];
  const matchedDomains: string[] = [];

  // --- F1: PAPER RELEVANCE (max 70) ---
  let paperRelevance = 0;
  for (const p of publikasi) {
    let paperScore = 0;
    const pKeywords = extractKeywords(p.judul);

    const keywordOverlap = mkKeywords.filter((w) => pKeywords.includes(w)).length;
    if (keywordOverlap > 0) paperScore += keywordOverlap * 12;

    if (synonymMatch(mk.nama, p.judul)) paperScore += 15;

    if (mkDomains.length > 0) {
      const pDomains = getDomain(p.judul);
      const shared = mkDomains.filter((d) => pDomains.includes(d));
      if (shared.length > 0) {
        paperScore += shared.length * 10;
        matchedDomains.push(...shared);
      }
    }

    if (paperScore > 0) {
      matchedPapers.push(p.judul);
      paperRelevance += paperScore;
    }
  }
  paperRelevance = Math.min(paperRelevance, 70);

  // --- F2: KOMPETENSI BONUS (max 20) ---
  let kompetensiScore = 0;
  for (const k of kompetensi) {
    const kompKeywords = extractKeywords(k.bidang);
    const overlap = mkKeywords.filter((w) => kompKeywords.includes(w)).length;
    const synMatch = synonymMatch(mk.nama, k.bidang);
    const domainMatch = getDomain(k.bidang).some((d) => mkDomains.includes(d));

    if (overlap > 0 || synMatch || domainMatch) {
      kompetensiScore += (k.tingkat / 100) * 10;
    }
  }
  kompetensiScore = Math.min(Math.round(kompetensiScore), 20);

  // --- F3: DEPTH BONUS (max 10) ---
  const depthBonus = Math.min(matchedPapers.length * 3, 10);

  // --- TOTAL ---
  const total = Math.min(paperRelevance + kompetensiScore + depthBonus, 100);

  return {
    matkul: mk.nama,
    score: total,
    breakdown: {
      keyword: paperRelevance,
      sinonim: 0,
      domain: 0,
      kompetensi: kompetensiScore,
      publikasi: depthBonus,
      total,
    },
    matchedPapers: [...new Set(matchedPapers)],
    matchedDomains: [...new Set(matchedDomains)],
  };
}

// ============================================
// API ROUTE
// ============================================

export async function GET() {
  try {
    const dosenList = await query<DosenData>(
      "SELECT id, nama FROM dosen ORDER BY nama"
    );

    const allMataKuliah = await query<MataKuliahData>(
      "SELECT id, nama FROM mata_kuliah ORDER BY nama"
    );

    // Batch fetch all data per dosen
    const allPublikasi = await query<PublikasiData & { dosen_id: number }>(
      "SELECT dosen_id, judul FROM publikasi"
    );
    const allKompetensi = await query<KompetensiData & { dosen_id: number }>(
      "SELECT dosen_id, bidang, tingkat FROM kompetensi_dosen"
    );
    const allMapping = await query<{ dosen_id: number; mk_id: number }>(
      "SELECT dosen_id, mk_id FROM mapping_dosen_mk"
    );

    // Group by dosen_id
    const pubMap = new Map<number, PublikasiData[]>();
    for (const p of allPublikasi) {
      if (!pubMap.has(p.dosen_id)) pubMap.set(p.dosen_id, []);
      pubMap.get(p.dosen_id)!.push({ judul: p.judul });
    }

    const kompMap = new Map<number, KompetensiData[]>();
    for (const k of allKompetensi) {
      if (!kompMap.has(k.dosen_id)) kompMap.set(k.dosen_id, []);
      kompMap.get(k.dosen_id)!.push({ bidang: k.bidang, tingkat: k.tingkat });
    }

    const mkMap = new Map<number, number[]>();
    for (const m of allMapping) {
      if (!mkMap.has(m.dosen_id)) mkMap.set(m.dosen_id, []);
      mkMap.get(m.dosen_id)!.push(m.mk_id);
    }

    const mkById = new Map(allMataKuliah.map((mk) => [mk.id, mk]));

    const matrix: Record<number, Record<number, number>> = {};
    const breakdownMatrix: Record<number, Record<number, ScoreBreakdown>> = {};
    const dosenStats: Record<
      number,
      {
        nama: string;
        totalScore: number;
        matkulCount: number;
        avgScore: number;
        details: MatkulDetail[];
      }
    > = {};

    for (const dosen of dosenList) {
      const publikasi = pubMap.get(dosen.id) || [];
      const kompetensi = kompMap.get(dosen.id) || [];
      const mkIds = mkMap.get(dosen.id) || [];

      const dosenScores: Record<number, number> = {};
      const dosenBreakdown: Record<number, ScoreBreakdown> = {};
      const details: MatkulDetail[] = [];

      for (const mkId of mkIds) {
        const mk = mkById.get(mkId);
        if (!mk) continue;
        const result = computeScore(mk, publikasi, kompetensi);
        dosenScores[mkId] = result.score;
        dosenBreakdown[mkId] = result.breakdown;
        details.push(result);
      }

      matrix[dosen.id] = dosenScores;
      breakdownMatrix[dosen.id] = dosenBreakdown;

      const matkulCount = details.length;
      const totalScore = details.reduce((a, b) => a + b.score, 0);
      dosenStats[dosen.id] = {
        nama: dosen.nama,
        totalScore,
        matkulCount,
        avgScore: matkulCount > 0 ? Math.round(totalScore / matkulCount) : 0,
        details,
      };
    }

    // Matkul-level stats
    const matkulStats: Record<
      number,
      { nama: string; avgScore: number; dosenCount: number; scores: number[] }
    > = {};
    for (const mk of allMataKuliah) {
      const scores: number[] = [];
      for (const dosen of dosenList) {
        const score = matrix[dosen.id]?.[mk.id];
        if (score !== undefined) scores.push(score);
      }
      matkulStats[mk.id] = {
        nama: mk.nama,
        avgScore:
          scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0,
        dosenCount: scores.length,
        scores,
      };
    }

    // Overall stats
    const allScores = Object.values(dosenStats).flatMap((d) =>
      d.details.map((d) => d.score)
    );
    const overallAvg =
      allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        overallAvg,
        formula: {
          description:
            "score = paper_relevance(0-70) + kompetensi_bonus(0-20) + depth(0-10)",
          factors: [
            { name: "paper_relevance", max: 70, desc: "Apakah ada paper yang relevan dengan matkul? (keyword + sinonim + domain)" },
            { name: "kompetensi_bonus", max: 20, desc: "Bidang kompetensi dosen mendukung matkul, dikali tingkat/100" },
            { name: "depth", max: 10, desc: "Semakin banyak paper relevan, semakin dalam penelitian" },
          ],
        },
        dosen: dosenList.map((d) => ({
          id: d.id,
          ...dosenStats[d.id],
        })),
        mataKuliah: allMataKuliah.map((mk) => ({
          id: mk.id,
          ...matkulStats[mk.id],
        })),
        matrix,
        breakdown: breakdownMatrix,
      },
    });
  } catch (error) {
    console.error("Error computing alignment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compute alignment" },
      { status: 500 }
    );
  }
}

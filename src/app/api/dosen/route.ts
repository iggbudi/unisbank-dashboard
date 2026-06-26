import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { DosenWithMetrics } from "@/lib/types";

export async function GET() {
  try {
    const [dosenRes, kompRes, mkRes] = await Promise.all([
      query<DosenWithMetrics>(`
        SELECT d.*, m.total_sitasi, m.h_index, m.i10_index,
               m.sitasi_sejak_2021, m.jumlah_publikasi
        FROM dosen d
        LEFT JOIN metrics_dosen m ON d.id = m.dosen_id
        ORDER BY m.total_sitasi DESC
      `),
      query<{ dosen_id: number; bidang: string; tingkat: number }>(
        "SELECT dosen_id, bidang, tingkat FROM kompetensi_dosen"
      ),
      query<{ dosen_id: number; id: number; nama: string }>(
        `SELECT m.dosen_id, mk.id, mk.nama
         FROM mapping_dosen_mk m
         INNER JOIN mata_kuliah mk ON mk.id = m.mk_id`
      ),
    ]);

    const kompMap = new Map<number, { bidang: string; tingkat: number }[]>();
    for (const k of kompRes) {
      if (!kompMap.has(k.dosen_id)) kompMap.set(k.dosen_id, []);
      kompMap.get(k.dosen_id)!.push({ bidang: k.bidang, tingkat: k.tingkat });
    }

    const mkMap = new Map<number, { id: number; nama: string }[]>();
    for (const m of mkRes) {
      if (!mkMap.has(m.dosen_id)) mkMap.set(m.dosen_id, []);
      mkMap.get(m.dosen_id)!.push({ id: m.id, nama: m.nama });
    }

    const result = dosenRes.map((d) => ({
      ...d,
      kompetensi: kompMap.get(d.id) || [],
      mata_kuliah: mkMap.get(d.id) || [],
    }));

    const response = NextResponse.json({ success: true, data: result, count: result.length });
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch (error) {
    console.error("Error fetching dosen:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dosen" },
      { status: 500 }
    );
  }
}

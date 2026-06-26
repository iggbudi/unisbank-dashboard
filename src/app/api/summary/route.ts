// ============================================
// API Route: GET /api/summary
// ============================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const [statsRow, topDosen, distribusiKompetensi] = await Promise.all([
      query<{ cnt: number; total: number; avg_h: number; avg_i: number }>(`
        SELECT
          (SELECT COUNT(*) FROM dosen) AS cnt,
          COALESCE((SELECT SUM(total_sitasi) FROM metrics_dosen), 0) AS total,
          COALESCE((SELECT AVG(h_index) FROM metrics_dosen), 0) AS avg_h,
          COALESCE((SELECT AVG(i10_index) FROM metrics_dosen), 0) AS avg_i
      `),
      query(`
        SELECT d.id, d.nama, d.bidang_keahlian, m.total_sitasi, m.h_index
        FROM dosen d
        LEFT JOIN metrics_dosen m ON d.id = m.dosen_id
        ORDER BY m.total_sitasi DESC
        LIMIT 5
      `),
      query<{ bidang: string; jumlah: number }>(`
        SELECT bidang, COUNT(*) as jumlah
        FROM kompetensi_dosen
        GROUP BY bidang
        ORDER BY jumlah DESC
        LIMIT 10
      `),
    ]);

    const stats = statsRow[0];

    return NextResponse.json({
      success: true,
      data: {
        total_dosen: stats?.cnt || 0,
        total_sitasi: stats?.total || 0,
        avg_h_index: Math.round((stats?.avg_h || 0) * 10) / 10,
        avg_i10_index: Math.round((stats?.avg_i || 0) * 10) / 10,
        top_dosen: topDosen,
        distribusi_kompetensi: distribusiKompetensi,
      },
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}

// ============================================
// API Route: GET /api/summary
// ============================================

import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  try {
    // Total dosen
    const totalDosen = await queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM dosen"
    );

    // Total sitasi
    const totalSitasi = await queryOne<{ total: number }>(
      "SELECT COALESCE(SUM(total_sitasi), 0) as total FROM metrics_dosen"
    );

    // Rata-rata h-index
    const avgHIndex = await queryOne<{ avg: number }>(
      "SELECT COALESCE(AVG(h_index), 0) as avg FROM metrics_dosen"
    );

    // Rata-rata i10-index
    const avgI10Index = await queryOne<{ avg: number }>(
      "SELECT COALESCE(AVG(i10_index), 0) as avg FROM metrics_dosen"
    );

    // Top 5 dosen berdasarkan sitasi
    const topDosen = await query(`
      SELECT 
        d.id,
        d.nama,
        d.bidang_keahlian,
        m.total_sitasi,
        m.h_index
      FROM dosen d
      LEFT JOIN metrics_dosen m ON d.id = m.dosen_id
      ORDER BY m.total_sitasi DESC
      LIMIT 5
    `);

    // Distribusi kompetensi
    const distribusiKompetensi = await query(`
      SELECT bidang, COUNT(*) as jumlah
      FROM kompetensi_dosen
      GROUP BY bidang
      ORDER BY jumlah DESC
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      data: {
        total_dosen: totalDosen?.count || 0,
        total_sitasi: totalSitasi?.total || 0,
        avg_h_index: Math.round((avgHIndex?.avg || 0) * 10) / 10,
        avg_i10_index: Math.round((avgI10Index?.avg || 0) * 10) / 10,
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

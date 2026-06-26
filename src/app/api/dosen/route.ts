// ============================================
// API Route: GET /api/dosen
// ============================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { DosenWithMetrics } from "@/lib/types";

export async function GET() {
  try {
    // Ambil semua dosen beserta metrics
    const dosen = await query<DosenWithMetrics>(`
      SELECT 
        d.*,
        m.total_sitasi,
        m.h_index,
        m.i10_index,
        m.sitasi_sejak_2021,
        m.jumlah_publikasi
      FROM dosen d
      LEFT JOIN metrics_dosen m ON d.id = m.dosen_id
      ORDER BY m.total_sitasi DESC
    `);

    // Ambil kompetensi untuk setiap dosen
    const dosenWithKompetensi = await Promise.all(
      dosen.map(async (d) => {
        const kompetensi = await query(
          "SELECT * FROM kompetensi_dosen WHERE dosen_id = ?",
          [d.id]
        );
        return { ...d, kompetensi };
      })
    );

    return NextResponse.json({
      success: true,
      data: dosenWithKompetensi,
      count: dosenWithKompetensi.length,
    });
  } catch (error) {
    console.error("Error fetching dosen:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dosen" },
      { status: 500 }
    );
  }
}

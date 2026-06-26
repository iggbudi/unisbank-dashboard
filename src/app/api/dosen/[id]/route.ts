// ============================================
// API Route: GET /api/dosen/[id]
// ============================================

import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import type { DosenDetail } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dosenId = parseInt(id);

    if (isNaN(dosenId)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    // Ambil data dosen
    const dosen = await queryOne<DosenDetail>(
      `
      SELECT 
        d.*,
        m.total_sitasi,
        m.h_index,
        m.i10_index,
        m.sitasi_sejak_2021,
        m.h_index_sejak_2021,
        m.i10_index_sejak_2021,
        m.jumlah_publikasi
      FROM dosen d
      LEFT JOIN metrics_dosen m ON d.id = m.dosen_id
      WHERE d.id = ?
      `,
      [dosenId]
    );

    if (!dosen) {
      return NextResponse.json(
        { success: false, error: "Dosen not found" },
        { status: 404 }
      );
    }

    // Ambil kompetensi
    const kompetensi = await query(
      "SELECT * FROM kompetensi_dosen WHERE dosen_id = ?",
      [dosenId]
    );

    // Ambil tren sitasi
    const tren_sitasi = await query(
      "SELECT * FROM tren_sitasi WHERE dosen_id = ? ORDER BY tahun ASC",
      [dosenId]
    );

    // Ambil publikasi top
    const publikasi = await query(
      "SELECT * FROM publikasi WHERE dosen_id = ? ORDER BY sitasi DESC LIMIT 5",
      [dosenId]
    );

    const dosenDetail: DosenDetail = {
      ...dosen,
      kompetensi,
      tren_sitasi,
      publikasi,
    };

    return NextResponse.json({
      success: true,
      data: dosenDetail,
    });
  } catch (error) {
    console.error("Error fetching dosen detail:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dosen detail" },
      { status: 500 }
    );
  }
}

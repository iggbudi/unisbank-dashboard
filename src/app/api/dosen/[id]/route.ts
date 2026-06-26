import { NextResponse } from "next/server";
import { query } from "@/lib/db";
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

    const [dosenRes, kompRes, trenRes, pubRes, mkRes] = await Promise.all([
      query<DosenDetail>(`
        SELECT d.*, m.total_sitasi, m.h_index, m.i10_index,
               m.sitasi_sejak_2021, m.h_index_sejak_2021,
               m.i10_index_sejak_2021, m.jumlah_publikasi
        FROM dosen d
        LEFT JOIN metrics_dosen m ON d.id = m.dosen_id
        WHERE d.id = ?
      `, [dosenId]),
      query("SELECT bidang, tingkat FROM kompetensi_dosen WHERE dosen_id = ?", [dosenId]),
      query("SELECT tahun, sitasi FROM tren_sitasi WHERE dosen_id = ? ORDER BY tahun ASC", [dosenId]),
      query("SELECT judul, tahun, sitasi, jurnal, doi, url, is_top FROM publikasi WHERE dosen_id = ? ORDER BY tahun DESC, sitasi DESC", [dosenId]),
      query(`
        SELECT mk.id, mk.nama FROM mata_kuliah mk
        INNER JOIN mapping_dosen_mk m ON mk.id = m.mk_id
        WHERE m.dosen_id = ? ORDER BY mk.nama
      `, [dosenId]),
    ]);

    const dosen = dosenRes[0];
    if (!dosen) {
      return NextResponse.json(
        { success: false, error: "Dosen not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: {
        ...dosen,
        kompetensi: kompRes,
        tren_sitasi: trenRes,
        publikasi: pubRes,
        mata_kuliah: mkRes,
      },
    });
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch (error) {
    console.error("Error fetching dosen detail:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dosen detail" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dosenId = searchParams.get("dosen_id");

    let publikasi;
    if (dosenId) {
      publikasi = await query(
        `SELECT p.*, d.nama as dosen_nama
         FROM publikasi p
         JOIN dosen d ON p.dosen_id = d.id
         WHERE p.dosen_id = ?
         ORDER BY p.tahun DESC, p.sitasi DESC`,
        [parseInt(dosenId)]
      );
    } else {
      publikasi = await query(`
        SELECT p.*, d.nama as dosen_nama
        FROM publikasi p
        JOIN dosen d ON p.dosen_id = d.id
        ORDER BY p.tahun DESC, p.sitasi DESC
        LIMIT 200
      `);
    }

    return NextResponse.json({ success: true, data: publikasi });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, judul, tahun, sitasi, jurnal } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "ID wajib diisi" }, { status: 400 });
    }

    await execute(
      `UPDATE publikasi SET judul=?, tahun=?, sitasi=?, jurnal=? WHERE id=?`,
      [judul, tahun || null, sitasi || 0, jurnal || null, id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengupdate publikasi" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "ID wajib diisi" }, { status: 400 });
    }

    await execute(`DELETE FROM publikasi WHERE id=?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus publikasi" }, { status: 500 });
  }
}

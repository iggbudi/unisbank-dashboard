import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function GET() {
  try {
    const matkul = await query(`
      SELECT mk.*, COUNT(m.dosen_id) as dosen_count
      FROM mata_kuliah mk
      LEFT JOIN mapping_dosen_mk m ON mk.id = m.mk_id
      GROUP BY mk.id
      ORDER BY mk.nama
    `);
    return NextResponse.json({ success: true, data: matkul });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nama } = await request.json();
    if (!nama) {
      return NextResponse.json({ success: false, error: "Nama wajib diisi" }, { status: 400 });
    }

    const result = await execute(`INSERT INTO mata_kuliah (nama) VALUES (?)`, [nama]);
    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: "Gagal menambah mata kuliah" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, nama } = await request.json();
    if (!id || !nama) {
      return NextResponse.json({ success: false, error: "ID dan nama wajib diisi" }, { status: 400 });
    }

    await execute(`UPDATE mata_kuliah SET nama=? WHERE id=?`, [nama, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengupdate mata kuliah" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "ID wajib diisi" }, { status: 400 });
    }

    // Delete mapping first
    await execute(`DELETE FROM mapping_dosen_mk WHERE mk_id=?`, [id]);
    await execute(`DELETE FROM mata_kuliah WHERE id=?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus mata kuliah" }, { status: 500 });
  }
}

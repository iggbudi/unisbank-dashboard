import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function GET() {
  try {
    const dosen = await query(`
      SELECT d.*, m.total_sitasi, m.h_index, m.i10_index
      FROM dosen d
      LEFT JOIN metrics_dosen m ON d.id = m.dosen_id
      ORDER BY d.nama
    `);
    return NextResponse.json({ success: true, data: dosen });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, email, google_scholar_id, bidang_keahlian } = body;

    if (!nama) {
      return NextResponse.json({ success: false, error: "Nama wajib diisi" }, { status: 400 });
    }

    const result = await execute(
      `INSERT INTO dosen (nama, email, google_scholar_id, bidang_keahlian) VALUES (?, ?, ?, ?)`,
      [nama, email || null, google_scholar_id || null, bidang_keahlian || null]
    );

    // Create empty metrics
    await execute(
      `INSERT INTO metrics_dosen (dosen_id) VALUES (?)`,
      [Number(result.lastInsertRowid)]
    );

    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: "Gagal menambah dosen" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nama, email, google_scholar_id, bidang_keahlian } = body;

    if (!id || !nama) {
      return NextResponse.json({ success: false, error: "ID dan nama wajib diisi" }, { status: 400 });
    }

    await execute(
      `UPDATE dosen SET nama=?, email=?, google_scholar_id=?, bidang_keahlian=? WHERE id=?`,
      [nama, email || null, google_scholar_id || null, bidang_keahlian || null, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengupdate dosen" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "ID wajib diisi" }, { status: 400 });
    }

    await execute(`DELETE FROM dosen WHERE id=?`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus dosen" }, { status: 500 });
  }
}

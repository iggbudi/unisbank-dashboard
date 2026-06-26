"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Search, RefreshCw } from "lucide-react";

interface Dosen {
  id: number;
  nama: string;
  email: string;
  google_scholar_id: string;
  bidang_keahlian: string;
  total_sitasi: number;
  h_index: number;
}

const EMPTY = { nama: "", email: "", google_scholar_id: "", bidang_keahlian: "" };

export default function AdminDosenPage() {
  const [dosen, setDosen] = useState<Dosen[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "add" | "edit">(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDosen = () => {
    fetch("/api/admin/dosen")
      .then((r) => r.json())
      .then((d) => setDosen(d.data));
  };

  useEffect(() => { fetchDosen(); }, []);

  const filtered = dosen.filter(
    (d) =>
      d.nama.toLowerCase().includes(search.toLowerCase()) ||
      d.bidang_keahlian?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal("add"); };
  const openEdit = (d: Dosen) => {
    setForm({ nama: d.nama, email: d.email || "", google_scholar_id: d.google_scholar_id || "", bidang_keahlian: d.bidang_keahlian || "" });
    setEditId(d.id); setModal("edit");
  };

  const handleSave = async () => {
    setLoading(true);
    const method = modal === "add" ? "POST" : "PUT";
    const body = modal === "add" ? form : { ...form, id: editId };
    await fetch("/api/admin/dosen", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setModal(null); setLoading(false); fetchDosen();
  };

  const handleSync = async (dosenId: number, type: "publikasi" | "tren") => {
    setSyncing(dosenId);
    try {
      const res = await fetch("/api/admin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dosen_id: dosenId, type }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Sync ${type} berhasil! ${type === "publikasi" ? `${data.inserted} publikasi ditambahkan` : `${data.count} data tren`}`);
        fetchDosen();
      } else {
        alert(data.error || "Sync gagal");
      }
    } catch {
      alert("Sync gagal");
    }
    setSyncing(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus dosen ini? Semua data terkait akan ikut terhapus.")) return;
    await fetch("/api/admin/dosen", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchDosen();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari dosen..." className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" />
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Nama</th>
              <th className="px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 font-medium text-gray-600">Scholar ID</th>
              <th className="px-4 py-3 font-medium text-gray-600">Sitasi</th>
              <th className="px-4 py-3 font-medium text-gray-600">h-index</th>
              <th className="px-4 py-3 font-medium text-gray-600 w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{d.nama}</td>
                <td className="px-4 py-3 text-gray-600">{d.email || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{d.google_scholar_id || "-"}</td>
                <td className="px-4 py-3">{d.total_sitasi?.toLocaleString() || 0}</td>
                <td className="px-4 py-3">{d.h_index || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(d)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleSync(d.id, "publikasi")} disabled={syncing === d.id} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded disabled:opacity-50" title="Sync publikasi dari Scholar"><RefreshCw className={`w-4 h-4 ${syncing === d.id ? "animate-spin" : ""}`} /></button>
                    <button onClick={() => handleDelete(d.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{modal === "add" ? "Tambah" : "Edit"} Dosen</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Scholar ID</label>
                <input value={form.google_scholar_id} onChange={(e) => setForm({ ...form, google_scholar_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. fGuDH54AAAAJ" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bidang Keahlian</label>
                <input value={form.bidang_keahlian} onChange={(e) => setForm({ ...form, bidang_keahlian: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Pisahkan dengan koma" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleSave} disabled={loading || !form.nama} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

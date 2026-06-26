"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";

interface Matkul {
  id: number;
  nama: string;
  dosen_count: number;
}

export default function AdminMatkulPage() {
  const [matkul, setMatkul] = useState<Matkul[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "add" | "edit">(null);
  const [formNama, setFormNama] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMatkul = () => {
    fetch("/api/admin/matkul")
      .then((r) => r.json())
      .then((d) => setMatkul(d.data));
  };

  useEffect(() => { fetchMatkul(); }, []);

  const filtered = matkul.filter((m) => m.nama.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setFormNama(""); setEditId(null); setModal("add"); };
  const openEdit = (m: Matkul) => { setFormNama(m.nama); setEditId(m.id); setModal("edit"); };

  const handleSave = async () => {
    setLoading(true);
    const method = modal === "add" ? "POST" : "PUT";
    const body = modal === "add" ? { nama: formNama } : { id: editId, nama: formNama };
    await fetch("/api/admin/matkul", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setModal(null); setLoading(false); fetchMatkul();
  };

  const handleDelete = async (id: number, nama: string, count: number) => {
    const msg = count > 0
      ? `"${nama}" masih terkait dengan ${count} dosen. Tetap hapus?`
      : `Hapus mata kuliah "${nama}"?`;
    if (!confirm(msg)) return;
    await fetch("/api/admin/matkul", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchMatkul();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari mata kuliah..." className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" />
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Nama Mata Kuliah</th>
              <th className="px-4 py-3 font-medium text-gray-600">Jumlah Dosen</th>
              <th className="px-4 py-3 font-medium text-gray-600 w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{m.nama}</td>
                <td className="px-4 py-3 text-gray-600">{m.dosen_count} dosen</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(m)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(m.id, m.nama, m.dosen_count)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
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
              <h3 className="font-semibold text-lg">{modal === "add" ? "Tambah" : "Edit"} Mata Kuliah</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Mata Kuliah *</label>
              <input value={formNama} onChange={(e) => setFormNama(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" autoFocus />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleSave} disabled={loading || !formNama} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

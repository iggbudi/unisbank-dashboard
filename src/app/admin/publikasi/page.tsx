"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, X, Search, Filter, RefreshCw } from "lucide-react";

interface Publikasi {
  id: number;
  dosen_id: number;
  dosen_nama: string;
  judul: string;
  tahun: number;
  sitasi: number;
  jurnal: string;
}

interface DosenOption { id: number; nama: string; }

export default function AdminPublikasiPage() {
  const [publikasi, setPublikasi] = useState<Publikasi[]>([]);
  const [dosenList, setDosenList] = useState<DosenOption[]>([]);
  const [search, setSearch] = useState("");
  const [filterDosen, setFilterDosen] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ id: 0, judul: "", tahun: 0, sitasi: 0, jurnal: "" });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const dosenRes = await fetch("/api/admin/dosen");
      const dosenData = await dosenRes.json();
      const withScholar = (dosenData.data || []).filter((d: { google_scholar_id?: string }) => d.google_scholar_id);
      let total = 0;
      for (const d of withScholar) {
        const res = await fetch("/api/admin/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dosen_id: d.id, type: "publikasi" }),
        });
        const data = await res.json();
        if (data.success) total += data.inserted || 0;
      }
      alert(`Sync selesai! ${total} publikasi baru ditambahkan`);
      fetchPubs();
    } catch {
      alert("Sync gagal");
    }
    setSyncing(false);
  };

  const fetchPubs = () => {
    const url = filterDosen ? `/api/admin/publikasi?dosen_id=${filterDosen}` : "/api/admin/publikasi";
    fetch(url).then((r) => r.json()).then((d) => setPublikasi(d.data));
  };

  useEffect(() => {
    fetch("/api/admin/dosen").then((r) => r.json()).then((d) => setDosenList(d.data.map((x: { id: number; nama: string }) => ({ id: x.id, nama: x.nama }))));
  }, []);

  useEffect(() => { fetchPubs(); }, [filterDosen]);

  const filtered = publikasi.filter((p) =>
    p.judul?.toLowerCase().includes(search.toLowerCase()) ||
    p.dosen_nama?.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (p: Publikasi) => {
    setForm({ id: p.id, judul: p.judul, tahun: p.tahun || 0, sitasi: p.sitasi || 0, jurnal: p.jurnal || "" });
    setModal(true);
  };

  const handleSave = async () => {
    setLoading(true);
    await fetch("/api/admin/publikasi", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setModal(false); setLoading(false); fetchPubs();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus publikasi ini?")) return;
    await fetch("/api/admin/publikasi", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchPubs();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul atau dosen..." className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select value={filterDosen} onChange={(e) => setFilterDosen(e.target.value)} className="pl-9 pr-8 py-2 border rounded-lg text-sm appearance-none cursor-pointer">
            <option value="">Semua Dosen</option>
            {dosenList.map((d) => <option key={d.id} value={d.id}>{d.nama}</option>)}
          </select>
        </div>
        <button onClick={handleSyncAll} disabled={syncing} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Scholar"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Judul</th>
              <th className="px-4 py-3 font-medium text-gray-600">Dosen</th>
              <th className="px-4 py-3 font-medium text-gray-600">Tahun</th>
              <th className="px-4 py-3 font-medium text-gray-600">Sitasi</th>
              <th className="px-4 py-3 font-medium text-gray-600">Jurnal</th>
              <th className="px-4 py-3 font-medium text-gray-600 w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.slice(0, 100).map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 max-w-xs truncate">{p.judul}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.dosen_nama}</td>
                <td className="px-4 py-3">{p.tahun || "-"}</td>
                <td className="px-4 py-3">{p.sitasi || 0}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{p.jurnal || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 100 && (
          <p className="px-4 py-3 text-xs sm:text-sm text-gray-500 text-center">Menampilkan 100 dari {filtered.length} publikasi. Gunakan filter untuk menyempitkan.</p>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Edit Publikasi</h3>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <textarea value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                  <input type="number" value={form.tahun || ""} onChange={(e) => setForm({ ...form, tahun: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sitasi</label>
                  <input type="number" value={form.sitasi || ""} onChange={(e) => setForm({ ...form, sitasi: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jurnal</label>
                <input value={form.jurnal} onChange={(e) => setForm({ ...form, jurnal: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleSave} disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Dosen {
  id: number;
  nama: string;
  bidang_keahlian: string;
  total_sitasi: number;
  h_index: number;
  i10_index: number;
  kompetensi: Array<{
    bidang: string;
    tingkat: number;
  }>;
}

export default function DosenPage() {
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [filteredDosen, setFilteredDosen] = useState<Dosen[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dosen")
      .then((res) => res.json())
      .then((data) => {
        setDosenList(data.data);
        setFilteredDosen(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = dosenList.filter(
      (d) =>
        d.nama.toLowerCase().includes(search.toLowerCase()) ||
        d.bidang_keahlian.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredDosen(filtered);
  }, [search, dosenList]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data dosen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">👨‍🏫 Daftar Dosen</h1>
        <p className="text-gray-600">
          Program Studi Sistem Informasi - Universitas Stikubank
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama atau bidang keahlian..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Dosen Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDosen.map((dosen) => (
          <Link
            key={dosen.id}
            href={`/dosen/${dosen.id}`}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all hover:-translate-y-1"
          >
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {dosen.nama
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{dosen.nama}</h3>
                <p className="text-sm text-gray-500">Unisbank, FTII</p>
              </div>
            </div>

            {/* Bidang Keahlian */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                Bidang Keahlian
              </p>
              <div className="flex flex-wrap gap-1">
                {dosen.bidang_keahlian
                  .split(",")
                  .slice(0, 3)
                  .map((bidang, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {bidang.trim()}
                    </span>
                  ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">
                  {dosen.total_sitasi?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500">Sitasi</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">
                  {dosen.h_index || 0}
                </p>
                <p className="text-xs text-gray-500">h-index</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">
                  {dosen.i10_index || 0}
                </p>
                <p className="text-xs text-gray-500">i10-index</p>
              </div>
            </div>

            {/* Kompetensi Radar Preview */}
            {dosen.kompetensi && dosen.kompetensi.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                  Kompetensi Utama
                </p>
                <div className="space-y-1">
                  {dosen.kompetensi.slice(0, 3).map((k, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-20 truncate">
                        {k.bidang}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                          style={{ width: `${k.tingkat}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-8">
                        {k.tingkat}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lihat Detail */}
            <div className="flex items-center justify-end text-blue-600 text-sm font-medium">
              Lihat Detail <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredDosen.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Tidak ada dosen yang cocok dengan pencarian &quot;{search}&quot;
          </p>
        </div>
      )}
    </div>
  );
}

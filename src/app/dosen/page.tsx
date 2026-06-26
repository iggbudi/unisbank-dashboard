"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, ArrowRight, BookOpen, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Loading, ErrorState } from "../components/ui";

interface Dosen {
  id: number;
  nama: string;
  bidang_keahlian: string;
  total_sitasi: number;
  h_index: number;
  i10_index: number;
  kompetensi: Array<{ bidang: string; tingkat: number }>;
  mata_kuliah: Array<{ id: number; nama: string }>;
}

type SortKey = "sitasi" | "h_index" | "i10_index" | "nama";

export default function DosenPage() {
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [search, setSearch] = useState("");
  const [bidangFilter, setBidangFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("sitasi");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(false);
    fetch("/api/dosen")
      .then((res) => res.json())
      .then((data) => {
        setDosenList(data.data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Collect unique bidang for filter dropdown
  const allBidang = useMemo(() => {
    const set = new Set<string>();
    for (const d of dosenList) {
      for (const k of d.kompetensi || []) set.add(k.bidang);
    }
    return [...set].sort();
  }, [dosenList]);

  const filteredDosen = useMemo(() => {
    let list = dosenList;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.nama.toLowerCase().includes(q) ||
          d.bidang_keahlian.toLowerCase().includes(q) ||
          d.mata_kuliah?.some((mk) => mk.nama.toLowerCase().includes(q))
      );
    }

    if (bidangFilter) {
      list = list.filter((d) =>
        d.kompetensi?.some((k) => k.bidang === bidangFilter)
      );
    }

    const sorted = [...list];
    switch (sortKey) {
      case "sitasi":
        sorted.sort((a, b) => (b.total_sitasi || 0) - (a.total_sitasi || 0));
        break;
      case "h_index":
        sorted.sort((a, b) => (b.h_index || 0) - (a.h_index || 0));
        break;
      case "i10_index":
        sorted.sort((a, b) => (b.i10_index || 0) - (a.i10_index || 0));
        break;
      case "nama":
        sorted.sort((a, b) => a.nama.localeCompare(b.nama));
        break;
    }
    return sorted;
  }, [search, bidangFilter, sortKey, dosenList]);

  if (loading) return <Loading text="Memuat daftar dosen..." />;
  if (error) return <ErrorState onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Daftar Dosen Prodi SI
        </h1>
        <p className="text-gray-600">
          Profil, metrik, dan kompetensi {dosenList.length} dosen
        </p>
      </div>

      {/* Search + Filter + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, bidang, mata kuliah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={bidangFilter}
            onChange={(e) => setBidangFilter(e.target.value)}
            className="pl-9 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm appearance-none cursor-pointer"
          >
            <option value="">Semua Bidang</option>
            {allBidang.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm appearance-none cursor-pointer"
        >
          <option value="sitasi">Urut: Sitasi</option>
          <option value="h_index">Urut: h-index</option>
          <option value="i10_index">Urut: i10-index</option>
          <option value="nama">Urut: Nama</option>
        </select>
      </div>

      <p className="text-sm text-gray-500">
        Menampilkan {filteredDosen.length} dosen
      </p>

      {/* Grid */}
      {filteredDosen.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Tidak ada dosen yang cocok
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDosen.map((dosen) => (
            <Link
              key={dosen.id}
              href={`/dosen/${dosen.id}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {dosen.nama.charAt(0)}
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </div>

              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {dosen.nama}
              </h3>

              {/* Bidang Keahlian */}
              <div className="mb-4">
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

              {/* Kompetensi Preview */}
              {dosen.kompetensi && dosen.kompetensi.length > 0 && (
                <div className="mb-4">
                  <div className="space-y-1">
                    {dosen.kompetensi.slice(0, 3).map((k, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${k.tingkat}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-24 truncate">
                          {k.bidang}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mata Kuliah */}
              {dosen.mata_kuliah && dosen.mata_kuliah.length > 0 && (
                <div className="flex items-center gap-2 pt-3 border-t">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <div className="flex flex-wrap gap-1">
                    {dosen.mata_kuliah.slice(0, 2).map((mk) => (
                      <span
                        key={mk.id}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {mk.nama}
                      </span>
                    ))}
                    {dosen.mata_kuliah.length > 2 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                        +{dosen.mata_kuliah.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

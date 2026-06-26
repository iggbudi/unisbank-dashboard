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
      .then((data) => { setDosenList(data.data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const allBidang = useMemo(() => {
    const set = new Set<string>();
    for (const d of dosenList) for (const k of d.kompetensi || []) set.add(k.bidang);
    return [...set].sort();
  }, [dosenList]);

  const filteredDosen = useMemo(() => {
    let list = dosenList;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) => d.nama.toLowerCase().includes(q) || d.bidang_keahlian.toLowerCase().includes(q) || d.mata_kuliah?.some((mk) => mk.nama.toLowerCase().includes(q))
      );
    }
    if (bidangFilter) list = list.filter((d) => d.kompetensi?.some((k) => k.bidang === bidangFilter));
    const sorted = [...list];
    switch (sortKey) {
      case "sitasi": sorted.sort((a, b) => (b.total_sitasi || 0) - (a.total_sitasi || 0)); break;
      case "h_index": sorted.sort((a, b) => (b.h_index || 0) - (a.h_index || 0)); break;
      case "i10_index": sorted.sort((a, b) => (b.i10_index || 0) - (a.i10_index || 0)); break;
      case "nama": sorted.sort((a, b) => a.nama.localeCompare(b.nama)); break;
    }
    return sorted;
  }, [search, bidangFilter, sortKey, dosenList]);

  if (loading) return <Loading text="Memuat dosen..." />;
  if (error) return <ErrorState onRetry={fetchData} />;

  return (
    <div className="space-y-3 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Dosen Prodi SI</h1>
        <p className="text-xs sm:text-sm text-gray-600">{dosenList.length} dosen</p>
      </div>

      {/* Search + Filter — compact */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none"
          />
        </div>
        <select
          value={bidangFilter}
          onChange={(e) => setBidangFilter(e.target.value)}
          className="px-2 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm appearance-none cursor-pointer max-w-[100px] sm:max-w-none truncate"
        >
          <option value="">Bidang</option>
          {allBidang.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="px-2 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm appearance-none cursor-pointer"
        >
          <option value="sitasi">Sitasi</option>
          <option value="h_index">h-index</option>
          <option value="i10_index">i10</option>
          <option value="nama">A-Z</option>
        </select>
      </div>

      <p className="text-xs text-gray-500">{filteredDosen.length} dosen</p>

      {filteredDosen.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">Tidak ada dosen</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
          {filteredDosen.map((dosen) => (
            <Link
              key={dosen.id}
              href={`/dosen/${dosen.id}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-3 sm:p-6 group"
            >
              {/* Header: avatar + nama + arrow */}
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#800000] to-[#D4AF37] rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shrink-0">
                  {dosen.nama.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-[#800000] transition-colors truncate">
                    {dosen.nama}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dosen.bidang_keahlian.split(",").slice(0, 2).map((bidang, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-red-100 text-[#800000] text-[10px] sm:text-xs rounded-full truncate max-w-[120px]">
                        {bidang.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#800000] transition-colors shrink-0 mt-1" />
              </div>

              {/* Metrics — 3 kolom */}
              <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2">
                <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm sm:text-lg font-bold text-gray-900">{dosen.total_sitasi?.toLocaleString() || 0}</p>
                  <p className="text-[9px] sm:text-xs text-gray-500">Sitasi</p>
                </div>
                <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm sm:text-lg font-bold text-gray-900">{dosen.h_index || 0}</p>
                  <p className="text-[9px] sm:text-xs text-gray-500">h-index</p>
                </div>
                <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm sm:text-lg font-bold text-gray-900">{dosen.i10_index || 0}</p>
                  <p className="text-[9px] sm:text-xs text-gray-500">i10</p>
                </div>
              </div>

              {/* Kompetensi bars — compact */}
              {dosen.kompetensi && dosen.kompetensi.length > 0 && (
                <div className="mb-2">
                  <div className="space-y-1">
                    {dosen.kompetensi.slice(0, 2).map((k, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#800000] to-[#D4AF37] rounded-full" style={{ width: `${k.tingkat}%` }} />
                        </div>
                        <span className="text-[9px] sm:text-xs text-gray-500 w-16 sm:w-24 truncate">{k.bidang}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matkul */}
              {dosen.mata_kuliah && dosen.mata_kuliah.length > 0 && (
                <div className="flex items-center gap-1.5 pt-2 border-t">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                  <div className="flex flex-wrap gap-1 min-w-0">
                    {dosen.mata_kuliah.slice(0, 2).map((mk) => (
                      <span key={mk.id} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] sm:text-xs rounded-full truncate max-w-[100px]">
                        {mk.nama}
                      </span>
                    ))}
                    {dosen.mata_kuliah.length > 2 && (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] sm:text-xs rounded-full">+{dosen.mata_kuliah.length - 2}</span>
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

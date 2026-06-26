"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, TrendingUp, Award, ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Loading, ErrorState } from "./components/ui";

interface SummaryData {
  total_dosen: number;
  total_sitasi: number;
  avg_h_index: number;
  avg_i10_index: number;
  top_dosen: Array<{
    id: number;
    nama: string;
    bidang_keahlian: string;
    total_sitasi: number;
    h_index: number;
  }>;
  distribusi_kompetensi: Array<{
    bidang: string;
    jumlah: number;
  }>;
}

const MAROON_SHADES = ["#800000", "#5c0000", "#a52a2a", "#b22222", "#4a0000", "#6b0000", "#8b0000", "#cd5c5c"];

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(false);
    fetch("/api/summary")
      .then((res) => res.json())
      .then((data) => { setSummary(data.data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Loading />;
  if (error || !summary) return <ErrorState onRetry={fetchData} />;

  const stats = [
    { label: "Dosen", value: summary.total_dosen, icon: Users, color: "bg-[#800000]" },
    { label: "Sitasi", value: summary.total_sitasi.toLocaleString(), icon: BookOpen, color: "bg-[#5c0000]" },
    { label: "h-index", value: summary.avg_h_index, icon: TrendingUp, color: "bg-[#a52a2a]" },
    { label: "i10-index", value: summary.avg_i10_index, icon: Award, color: "bg-[#b22222]" },
  ];

  const chartData = summary.distribusi_kompetensi.slice(0, 6).map((item) => ({
    nama: item.bidang.length > 14 ? item.bidang.slice(0, 12) + "…" : item.bidang,
    jumlah: item.jumlah,
  }));

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Visi Card — compact di mobile */}
      <div className="bg-gradient-to-r from-[#800000] to-[#4a0000] rounded-xl p-3 sm:p-6 text-white">
        <h2 className="text-sm sm:text-xl font-bold mb-1 sm:mb-2">🎯 Visi Prodi</h2>
        <p className="text-xs sm:text-sm leading-relaxed text-red-100 line-clamp-2 sm:line-clamp-none">
          Tahun 2035 menjadi prodi unggul dalam pengembangan sistem informasi dan analisis data yang inovatif, adaptif, berjiwa kewirausahaan, dan berdaya saing internasional.
        </p>
      </div>

      {/* Stats 2x2 grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className={`${stat.color} p-2 sm:p-3 rounded-lg shrink-0`}>
                <stat.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-gray-500 truncate">{stat.label}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top 3 Dosen — compact list di mobile, full di desktop */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900">🏆 Top Dosen</h3>
          <Link href="/dosen" className="text-xs sm:text-sm text-[#800000] hover:text-[#5c0000] flex items-center gap-1">
            Semua <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>
        <div className="space-y-1 sm:space-y-3">
          {summary.top_dosen.slice(0, 3).map((dosen, index) => (
            <Link
              key={dosen.id}
              href={`/dosen/${dosen.id}`}
              className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-white text-xs sm:text-sm shrink-0 ${
                  index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-400"
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{dosen.nama}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">{dosen.bidang_keahlian}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-900">{dosen.total_sitasi.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-gray-400">sitasi</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Chart — hidden di mobile, tampil di sm+ */}
      <div className="hidden sm:block bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Distribusi Kompetensi</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="nama" type="category" width={130} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [`${v} dosen`, "Jumlah"]} />
            <Bar dataKey="jumlah" radius={[0, 4, 4, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={MAROON_SHADES[i % MAROON_SHADES.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart versi mobile — horizontal bar sederhana */}
      <div className="sm:hidden bg-white rounded-xl shadow-sm p-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">📊 Kompetensi</h3>
        <div className="space-y-2">
          {summary.distribusi_kompetensi.slice(0, 5).map((item, i) => (
            <div key={item.bidang} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 w-20 truncate shrink-0">{item.bidang}</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((item.jumlah / (summary.distribusi_kompetensi[0]?.jumlah || 1)) * 100, 100)}%`,
                    backgroundColor: MAROON_SHADES[i % MAROON_SHADES.length],
                  }}
                />
              </div>
              <span className="text-[10px] font-medium text-gray-700 w-4 text-right">{item.jumlah}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions — 3 kolom di mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Link href="/dosen" className="p-2 sm:p-4 border border-gray-200 rounded-xl hover:border-[#800000] hover:bg-red-50 transition-all text-center">
          <Users className="w-5 h-5 sm:w-8 sm:h-8 text-[#800000] mx-auto mb-1 sm:mb-2" />
          <p className="text-[10px] sm:text-sm font-medium text-gray-900">Dosen</p>
          <p className="text-[9px] sm:text-xs text-gray-500 hidden sm:block">{summary.total_dosen} dosen</p>
        </Link>
        <Link href="/analisis" className="p-2 sm:p-4 border border-gray-200 rounded-xl hover:border-[#800000] hover:bg-red-50 transition-all text-center">
          <TrendingUp className="w-5 h-5 sm:w-8 sm:h-8 text-[#800000] mx-auto mb-1 sm:mb-2" />
          <p className="text-[10px] sm:text-sm font-medium text-gray-900">Analisis</p>
          <p className="text-[9px] sm:text-xs text-gray-500 hidden sm:block">Kesesuaian</p>
        </Link>
        <Link href="/" className="p-2 sm:p-4 border border-gray-200 rounded-xl hover:border-[#800000] hover:bg-red-50 transition-all text-center">
          <Award className="w-5 h-5 sm:w-8 sm:h-8 text-[#800000] mx-auto mb-1 sm:mb-2" />
          <p className="text-[10px] sm:text-sm font-medium text-gray-900">Metrik</p>
          <p className="text-[9px] sm:text-xs text-gray-500 hidden sm:block">Prodi</p>
        </Link>
      </div>
    </div>
  );
}

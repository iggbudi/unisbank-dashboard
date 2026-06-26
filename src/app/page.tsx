"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, TrendingUp, Award, ArrowRight } from "lucide-react";
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

const CHART_COLORS = [
  "#800000",
  "#5c0000",
  "#a52a2a",
  "#b22222",
  "#4a0000",
  "#6b0000",
  "#8b0000",
  "#cd5c5c",
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(false);
    fetch("/api/summary")
      .then((res) => res.json())
      .then((data) => {
        setSummary(data.data);
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

  if (loading) return <Loading />;
  if (error || !summary) return <ErrorState onRetry={fetchData} />;

  const stats = [
    { label: "Total Dosen", value: summary.total_dosen, icon: Users, color: "bg-[#800000]" },
    { label: "Total Sitasi", value: summary.total_sitasi.toLocaleString(), icon: BookOpen, color: "bg-[#5c0000]" },
    { label: "Rata-rata h-index", value: summary.avg_h_index, icon: TrendingUp, color: "bg-[#a52a2a]" },
    { label: "Rata-rata i10-index", value: summary.avg_i10_index, icon: Award, color: "bg-[#b22222]" },
  ];

  const chartData = summary.distribusi_kompetensi.slice(0, 8).map((item) => ({
    nama: item.bidang.length > 18 ? item.bidang.slice(0, 16) + "…" : item.bidang,
    jumlah: item.jumlah,
  }));

  return (
    <div className="space-y-8">
      {/* Visi-Misi Card */}
      <div className="bg-gradient-to-r from-[#800000] to-[#4a0000] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <h2 className="text-base sm:text-xl font-bold mb-2">🎯 Visi Program Studi</h2>
        <p className="text-blue-100 leading-relaxed">
          Pada tahun 2035 menjadi program studi unggul, mandiri dan profesional
          dalam bidang pengembangan sistem informasi dan analisis data yang
          inovatif dan adaptif berjiwa kewirausahaan serta berdaya saing
          internasional.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Dosen & Distribusi Kompetensi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Dosen */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">🏆 Top 5 Dosen</h3>
            <Link href="/dosen" className="text-sm text-[#800000] hover:text-[#5c0000] flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {summary.top_dosen.map((dosen, index) => (
              <Link
                key={dosen.id}
                href={`/dosen/${dosen.id}`}
                className="flex items-center gap-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-orange-400" : "bg-gray-300"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{dosen.nama}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{dosen.bidang_keahlian}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{dosen.total_sitasi.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">sitasi</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Distribusi Kompetensi — Recharts */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">📊 Distribusi Kompetensi</h3>
          <ResponsiveContainer width="100%" height="100%" className="!h-[220px] sm:!h-[320px]">
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="nama" type="category" width={130} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v} dosen`, "Jumlah"]} />
              <Bar dataKey="jumlah" radius={[0, 4, 4, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">🔍 Eksplorasi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link href="/dosen" className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#800000] hover:bg-red-50 transition-all text-center">
            <Users className="w-8 h-8 text-[#800000] mx-auto mb-2" />
            <p className="font-medium text-gray-900">Lihat Semua Dosen</p>
            <p className="text-xs sm:text-sm text-gray-500">Profil lengkap {summary.total_dosen} dosen</p>
          </Link>
          <Link href="/analisis" className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#800000] hover:bg-red-50 transition-all text-center">
            <TrendingUp className="w-8 h-8 text-[#800000] mx-auto mb-2" />
            <p className="font-medium text-gray-900">Analisis Kesesuaian</p>
            <p className="text-xs sm:text-sm text-gray-500">Kompetensi vs Visi-Misi</p>
          </Link>
          <Link href="/" className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#800000] hover:bg-red-50 transition-all text-center">
            <Award className="w-8 h-8 text-[#800000] mx-auto mb-2" />
            <p className="font-medium text-gray-900">Metrik Program Studi</p>
            <p className="text-xs sm:text-sm text-gray-500">Ringkasan pencapaian</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

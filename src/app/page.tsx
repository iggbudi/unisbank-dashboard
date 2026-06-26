"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, TrendingUp, Award, ArrowRight } from "lucide-react";
import Link from "next/link";

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

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/summary")
      .then((res) => res.json())
      .then((data) => {
        setSummary(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Gagal memuat data</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Dosen",
      value: summary.total_dosen,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Total Sitasi",
      value: summary.total_sitasi.toLocaleString(),
      icon: BookOpen,
      color: "bg-purple-500",
    },
    {
      label: "Rata-rata h-index",
      value: summary.avg_h_index,
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      label: "Rata-rata i10-index",
      value: summary.avg_i10_index,
      icon: Award,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Visi-Misi Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">🎯 Visi Program Studi</h2>
        <p className="text-blue-100 leading-relaxed">
          Pada tahun 2035 menjadi program studi unggul, mandiri dan profesional
          dalam bidang pengembangan sistem informasi dan analisis data yang
          inovatif dan adaptif berjiwa kewirausahaan serta berdaya saing
          internasional.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Dosen & Distribusi Kompetensi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Dosen */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              🏆 Top 5 Dosen
            </h3>
            <Link
              href="/dosen"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {summary.top_dosen.map((dosen, index) => (
              <Link
                key={dosen.id}
                href={`/dosen/${dosen.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0
                      ? "bg-yellow-500"
                      : index === 1
                      ? "bg-gray-400"
                      : index === 2
                      ? "bg-orange-400"
                      : "bg-gray-300"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{dosen.nama}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {dosen.bidang_keahlian}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {dosen.total_sitasi.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">sitasi</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Distribusi Kompetensi */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Distribusi Kompetensi
          </h3>
          <div className="space-y-3">
            {summary.distribusi_kompetensi.slice(0, 8).map((item, index) => {
              const maxJumlah = summary.distribusi_kompetensi[0]?.jumlah || 1;
              const percentage = (item.jumlah / maxJumlah) * 100;
              const colors = [
                "bg-blue-500",
                "bg-purple-500",
                "bg-pink-500",
                "bg-indigo-500",
                "bg-cyan-500",
                "bg-teal-500",
                "bg-green-500",
                "bg-yellow-500",
              ];
              return (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {item.bidang}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.jumlah} dosen
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔍 Eksplorasi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dosen"
            className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
          >
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Lihat Semua Dosen</p>
            <p className="text-sm text-gray-500">
              Profil lengkap {summary.total_dosen} dosen
            </p>
          </Link>
          <Link
            href="/analisis"
            className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
          >
            <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Analisis Kesesuaian</p>
            <p className="text-sm text-gray-500">Kompetensi vs Visi-Misi</p>
          </Link>
          <Link
            href="/"
            className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center"
          >
            <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Metrik Program Studi</p>
            <p className="text-sm text-gray-500">Ringkasan pencapaian</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

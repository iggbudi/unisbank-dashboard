"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react";

interface Summary {
  total_dosen: number;
  total_sitasi: number;
  avg_h_index: number;
  avg_i10_index: number;
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [counts, setCounts] = useState({ matkul: 0, publikasi: 0 });

  useEffect(() => {
    fetch("/api/summary")
      .then((r) => r.json())
      .then((d) => setSummary(d.data));

    fetch("/api/dosen")
      .then((r) => r.json())
      .then((dosenData) => {
        const dosen = dosenData.data || [];
        setCounts({
          matkul: dosen.reduce((a: number, d: { mata_kuliah?: unknown[] }) => a + (d.mata_kuliah?.length || 0), 0),
          publikasi: dosen.reduce((a: number, d: { jumlah_publikasi?: number }) => a + (d.jumlah_publikasi || 0), 0),
        });
      });
  }, []);

  if (!summary) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500">Memuat data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:p-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="space-y-2">
                  <div className="w-20 h-3 bg-gray-200 rounded" />
                  <div className="w-16 h-6 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Dosen", value: summary.total_dosen || 0, icon: Users, color: "bg-blue-500" },
    { label: "Total Sitasi", value: summary.total_sitasi?.toLocaleString() || 0, icon: TrendingUp, color: "bg-purple-500" },
    { label: "Avg h-index", value: summary.avg_h_index || 0, icon: BookOpen, color: "bg-green-500" },
    { label: "Mata Kuliah", value: counts.matkul, icon: GraduationCap, color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500">Kelola data dosen, mata kuliah, dan publikasi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:p-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface KompetensiItem {
  bidang: string;
  jumlah: number;
}

interface VisiMisi {
  kompetensi_dibutuhkan: string[];
  kesesuaian: { bidang: string; skor: number; status: string }[];
}

export default function AnalisisPage() {
  const [kompetensi, setKompetensi] = useState<KompetensiItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Mapping kompetensi vs visi-misi PS
  const visiMisiMapping: VisiMisi = {
    kompetensi_dibutuhkan: [
      "Pengembangan Sistem Informasi",
      "Analisis Data",
      "Web Development",
      "Mobile Development",
      "Machine Learning",
      "Database",
      "IT Governance",
      "E-Commerce",
      "Digital Marketing",
      "Kriptografi",
      "Networking",
      "AI",
    ],
    kesesuaian: [],
  };

  useEffect(() => {
    fetch("/api/summary")
      .then((res) => res.json())
      .then((data) => {
        setKompetensi(data.data.distribusi_kompetensi || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Hitung kesesuaian
  const hitungKesesuaian = () => {
    return visiMisiMapping.kompetensi_dibutuhkan.map((kd) => {
      const found = kompetensi.find(
        (k) =>
          k.bidang.toLowerCase().includes(kd.toLowerCase()) ||
          kd.toLowerCase().includes(k.bidang.toLowerCase())
      );
      const skor = found ? Math.min((found.jumlah / 3) * 100, 100) : 0;
      const status =
        skor >= 70 ? "Sangat Sesuai" : skor >= 40 ? "Sesuai" : "Perlu Dikembangkan";
      return { bidang: kd, skor: Math.round(skor), status };
    });
  };

  const kesesuaian = hitungKesesuaian();
  const rataRataSkor = Math.round(
    kesesuaian.reduce((a, b) => a + b.skor, 0) / kesesuaian.length
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          🎯 Analisis Kesesuaian
        </h1>
        <p className="text-gray-600">
          Kesesuaian Kompetensi Dosen dengan Visi-Misi Prodi SI
        </p>
      </div>

      {/* Skor Keseluruhan */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Skor Kesesuaian Keseluruhan</h2>
            <p className="text-green-100">
              Berdasarkan {kompetensi.length} kompetensi yang tersedia
            </p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold">{rataRataSkor}%</p>
            <p className="text-green-100">
              {rataRataSkor >= 70 ? "Sangat Sesuai" : rataRataSkor >= 40 ? "Sesuai" : "Perlu Dikembangkan"}
            </p>
          </div>
        </div>
      </div>

      {/* Matriks Kesesuaian */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Matriks Kesesuaian Kompetensi vs Visi-Misi PS
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Kompetensi yang Dibutuhkan
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Skor
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Visual
                </th>
              </tr>
            </thead>
            <tbody>
              {kesesuaian.map((item, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{item.bidang}</td>
                  <td className="py-3 px-4 text-center font-semibold">
                    {item.skor}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === "Sangat Sesuai"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Sesuai"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status === "Sangat Sesuai" && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {item.status === "Sesuai" && (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      {item.status === "Perlu Dikembangkan" && (
                        <XCircle className="w-4 h-4" />
                      )}
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.skor >= 70
                            ? "bg-green-500"
                            : item.skor >= 40
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${item.skor}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Keterangan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Sangat Sesuai (≥70%)</p>
              <p className="text-sm text-green-600">
                Kompetensi sudah terpenuhi dengan baik
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Sesuai (40-69%)</p>
              <p className="text-sm text-yellow-600">
                Kompetensi cukup, perlu penguatan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-medium text-red-800">
                Perlu Dikembangkan (&lt;40%)
              </p>
              <p className="text-sm text-red-600">
                Kompetensi perlu ditambah/dikembangkan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rekomendasi */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          💡 Rekomendasi
        </h2>
        <div className="space-y-3">
          {kesesuaian
            .filter((k) => k.skor < 70)
            .map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500"
              >
                <span className="text-blue-600 font-bold">⚡</span>
                <div>
                  <p className="font-medium text-gray-800">{item.bidang}</p>
                  <p className="text-sm text-gray-600">
                    Skor saat ini {item.skor}%. Perlu penambahan dosen dengan
                    kompetensi di bidang ini atau pelatihan untuk dosen yang ada.
                  </p>
                </div>
              </div>
            ))}
          {kesesuaian.filter((k) => k.skor < 70).length === 0 && (
            <div className="text-center py-4 text-green-600">
              ✅ Semua kompetensi sudah sesuai dengan visi-misi!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

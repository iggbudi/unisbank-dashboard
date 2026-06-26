"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink, BookOpen, ChevronDown, ChevronUp, FileText } from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { isPaperRelated } from "@/lib/scoring";
import { Loading, ErrorState } from "../../components/ui";

interface DosenDetail {
  id: number;
  nama: string;
  email: string;
  google_scholar_id: string;
  bidang_keahlian: string;
  total_sitasi: number;
  h_index: number;
  i10_index: number;
  sitasi_sejak_2021: number;
  jumlah_publikasi: number;
  kompetensi: Array<{ bidang: string; tingkat: number }>;
  publikasi: Array<{ judul: string; tahun: number; sitasi: number; jurnal: string }>;
  tren_sitasi: Array<{ tahun: number; sitasi: number }>;
  mata_kuliah: Array<{ id: number; nama: string }>;
}

function getRelatedPapers(
  mkName: string,
  publikasi: Array<{ judul: string; tahun: number; sitasi: number; jurnal: string }>
) {
  return publikasi.filter((p) => isPaperRelated(mkName, p.judul));
}

export default function DosenDetailPage() {
  const params = useParams();
  const id = params.id;
  const [dosen, setDosen] = useState<DosenDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMatkul, setExpandedMatkul] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/dosen/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setDosen(data.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error:", err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <Loading />;

  if (!dosen) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Dosen tidak ditemukan</p>
        <Link href="/dosen" className="text-blue-600 hover:underline mt-4 inline-block">
          Kembali ke daftar dosen
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dosen"
        className="inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali ke daftar dosen
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col md:flex-row items-start gap-3 sm:gap-4 sm:p-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
            {dosen.nama
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {dosen.nama}
            </h1>
            <p className="text-gray-600 mb-1">{dosen.email}</p>
            <p className="text-gray-600 mb-3">
              Universitas Stikubank, Fakultas Teknologi Informasi dan Industri
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {dosen.bidang_keahlian.split(",").map((bidang, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  {bidang.trim()}
                </span>
              ))}
            </div>
            <a
              href={`https://scholar.google.co.id/citations?user=${dosen.google_scholar_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              Google Scholar <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">
            {dosen.total_sitasi?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-500">Total Sitasi</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">
            {dosen.h_index || 0}
          </p>
          <p className="text-sm text-gray-500">h-index</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-green-600">
            {dosen.i10_index || 0}
          </p>
          <p className="text-sm text-gray-500">i10-index</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-orange-600">
            {dosen.jumlah_publikasi || 0}
          </p>
          <p className="text-sm text-gray-500">Publikasi</p>
        </div>
      </div>

      {/* Mata Kuliah + Paper Pendukung */}
      {dosen.mata_kuliah && dosen.mata_kuliah.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Mata Kuliah yang Diampu
          </h2>
          <div className="space-y-2">
            {dosen.mata_kuliah.map((mk) => {
              const relatedPapers = getRelatedPapers(mk.nama, dosen.publikasi || []);
              const isExpanded = expandedMatkul === mk.id;

              return (
                <div key={mk.id} className="border rounded-lg">
                  <button
                    onClick={() =>
                      setExpandedMatkul(isExpanded ? null : mk.id)
                    }
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">
                        {mk.nama}
                      </span>
                      {relatedPapers.length > 0 && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                          {relatedPapers.length} paper
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t px-4 py-3 bg-gray-50">
                      {relatedPapers.length > 0 ? (
                        <div className="space-y-2">
                          {relatedPapers.map((p, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 p-2 bg-white rounded-lg"
                            >
                              <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800">
                                  {p.judul}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {p.jurnal} &bull; {p.tahun}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 py-2">
                          Belum ada paper yang relevan dengan mata kuliah ini.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tren Sitasi Chart */}
      {dosen.tren_sitasi && dosen.tren_sitasi.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">📈 Tren Sitasi per Tahun</h2>
          <ResponsiveContainer width="100%" height="100%" className="!h-[180px] sm:!h-[260px]">
            <LineChart data={dosen.tren_sitasi} margin={{ bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="tahun" />
              <YAxis />
              <Tooltip formatter={(v) => [`${v}`, "Sitasi"]} />
              <Line
                type="monotone"
                dataKey="sitasi"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Kompetensi */}
      {dosen.kompetensi && dosen.kompetensi.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Profil Kompetensi
          </h2>
          <div className="space-y-4">
            {dosen.kompetensi.map((k, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {k.bidang}
                  </span>
                  <span className="text-sm text-gray-500">{k.tingkat}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${k.tingkat}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

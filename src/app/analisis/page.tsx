"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Loading, ErrorState } from "../components/ui";

interface ScoreBreakdown {
  keyword: number;
  sinonim: number;
  domain: number;
  kompetensi: number;
  publikasi: number;
  total: number;
}

interface MatkulDetail {
  matkul: string;
  score: number;
  breakdown: ScoreBreakdown;
  matchedPapers: string[];
  matchedDomains: string[];
}

interface DosenAlignment {
  id: number;
  nama: string;
  totalScore: number;
  matkulCount: number;
  avgScore: number;
  details: MatkulDetail[];
}

interface MatkulAlignment {
  id: number;
  nama: string;
  avgScore: number;
  dosenCount: number;
  scores: number[];
}

interface FormulaFactor {
  name: string;
  max: number;
  desc: string;
}

interface AlignmentData {
  overallAvg: number;
  formula: { description: string; factors: FormulaFactor[] };
  dosen: DosenAlignment[];
  mataKuliah: MatkulAlignment[];
  matrix: Record<number, Record<number, number>>;
  breakdown: Record<number, Record<number, ScoreBreakdown>>;
}

const FACTOR_COLORS: Record<string, string> = {
  paper_relevance: "bg-red-500",
  kompetensi_bonus: "bg-orange-500",
  depth: "bg-pink-500",
};

const FACTOR_LABELS: Record<string, string> = {
  paper_relevance: "Paper Relevance",
  kompetensi_bonus: "Kompetensi",
  depth: "Depth",
};

function scoreColor(score: number): string {
  if (score >= 70) return "bg-green-500";
  if (score >= 40) return "bg-yellow-500";
  if (score > 0) return "bg-red-400";
  return "bg-gray-100";
}

function scoreTextColor(score: number): string {
  if (score >= 70) return "text-green-700";
  if (score >= 40) return "text-yellow-700";
  if (score > 0) return "text-red-600";
  return "text-gray-400";
}

function scoreBg(score: number): string {
  if (score >= 70) return "bg-green-50";
  if (score >= 40) return "bg-yellow-50";
  if (score > 0) return "bg-red-50";
  return "bg-gray-50";
}

function StatusBadge({ score }: { score: number }) {
  if (score >= 70)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
        <CheckCircle className="w-3 h-3" /> Sesuai
      </span>
    );
  if (score >= 40)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
        <AlertCircle className="w-3 h-3" /> Cukup
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
      <XCircle className="w-3 h-3" /> Kurang
    </span>
  );
}

function BreakdownBar({ breakdown }: { breakdown: ScoreBreakdown }) {
  const factors = [
    { key: "paper_relevance", value: breakdown.keyword, max: 70 },
    { key: "kompetensi_bonus", value: breakdown.kompetensi, max: 20 },
    { key: "depth", value: breakdown.publikasi, max: 10 },
  ] as const;

  return (
    <div className="flex items-center gap-1">
      {factors.map((f) => (
        <div key={f.key} className="flex items-center gap-0.5" title={`${FACTOR_LABELS[f.key]}: ${f.value}/${f.max}`}>
          <div
            className={`h-3 rounded-sm ${FACTOR_COLORS[f.key]} opacity-80`}
            style={{ width: `${(f.value / f.max) * 40}px`, minWidth: f.value > 0 ? "3px" : "0" }}
          ></div>
        </div>
      ))}
    </div>
  );
}

export default function AnalisisPage() {
  const [data, setData] = useState<AlignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDosen, setExpandedDosen] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"nama" | "score">("score");
  const [showFormula, setShowFormula] = useState(false);

  useEffect(() => {
    fetch("/api/alignment")
      .then((res) => res.json())
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Menghitung kesesuaian paper-matkul..." />;

  if (!data) return <ErrorState onRetry={() => window.location.reload()} />;

  const sortedDosen =
    sortBy === "score"
      ? [...data.dosen].sort((a, b) => b.avgScore - a.avgScore)
      : [...data.dosen].sort((a, b) => a.nama.localeCompare(b.nama));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Analisis Kesesuaian Paper & Mata Kuliah
        </h1>
        <p className="text-gray-600">
          Matrix kesesuaian antara publikasi penelitian dan mata kuliah yang
          diampu dosen
        </p>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-[#800000] to-[#4a0000] rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">
              Skor Kesesuaian Keseluruhan
            </h2>
            <p className="text-indigo-200">
              {data.dosen.length} dosen &times; {data.mataKuliah.length} mata
              kuliah
            </p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold">{data.overallAvg}%</p>
            <StatusBadge score={data.overallAvg} />
          </div>
        </div>
      </div>

      {/* Formula */}
      <div className="bg-white rounded-xl shadow-sm">
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-[#800000]" />
            <span className="font-semibold text-gray-900">Formula Perhitungan</span>
          </div>
          {showFormula ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {showFormula && (
          <div className="border-t p-4">
            <p className="font-mono text-sm bg-gray-100 p-3 rounded-lg mb-4 text-gray-800">
              {data.formula.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {data.formula.factors.map((f) => (
                <div key={f.name} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded ${FACTOR_COLORS[f.name]}`}></div>
                    <span className="font-semibold text-sm capitalize">{f.name}</span>
                    <span className="text-xs text-gray-500">(max {f.max})</span>
                  </div>
                  <p className="text-xs text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 sm:p-6 text-sm">
          <span className="font-medium text-gray-700">Keterangan Skor:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-gray-600">70-100 = Sesuai</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-gray-600">40-69 = Cukup</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-400"></div>
            <span className="text-gray-600">1-39 = Kurang</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border"></div>
            <span className="text-gray-600">0 = Tidak ada data</span>
          </div>
          <span className="text-gray-400">|</span>
          {Object.entries(FACTOR_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${FACTOR_COLORS[key]}`}></div>
              <span className="text-gray-600 text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 overflow-x-auto">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          Matrix Dosen &times; Mata Kuliah
        </h2>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="border-collapse text-xs min-w-full">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white z-20 p-2 text-left font-semibold text-gray-700 border-b min-w-[140px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                  Dosen
                </th>
                {data.mataKuliah.map((mk) => (
                  <th
                    key={mk.id}
                    className="p-1 font-medium text-gray-600 border-b min-w-[70px]"
                  >
                    <div className="writing-vertical h-[120px] flex items-end justify-center">
                      <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] leading-tight">
                        {mk.nama}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="p-2 font-semibold text-gray-700 border-b min-w-[56px]">
                  Rata-rata
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedDosen.map((dosen) => (
                <tr key={dosen.id} className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white z-10 p-2 border-b font-medium text-gray-800 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    <span className="text-xs">{dosen.nama}</span>
                  </td>
                {data.mataKuliah.map((mk) => {
                  const score = data.matrix[dosen.id]?.[mk.id] ?? 0;
                  return (
                    <td
                      key={mk.id}
                      className={`p-1 border-b text-center ${scoreBg(score)}`}
                    >
                      {score > 0 ? (
                        <span
                          className={`font-bold ${scoreTextColor(score)}`}
                          title={`${dosen.nama} → ${mk.nama}: ${score}%`}
                        >
                          {score}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  );
                })}
                <td
                  className={`p-2 border-b text-center font-bold ${scoreTextColor(dosen.avgScore)}`}
                >
                  {dosen.avgScore}%
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      {/* Per-Dosen Detail */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Detail per Dosen
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("score")}
              className={`px-3 py-1 text-sm rounded-lg ${
                sortBy === "score"
                  ? "bg-red-100 text-[#800000]"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Urut Skor
            </button>
            <button
              onClick={() => setSortBy("nama")}
              className={`px-3 py-1 text-sm rounded-lg ${
                sortBy === "nama"
                  ? "bg-red-100 text-[#800000]"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Urut Nama
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {sortedDosen.map((dosen) => (
            <div key={dosen.id} className="border rounded-lg">
              <button
                onClick={() =>
                  setExpandedDosen(
                    expandedDosen === dosen.id ? null : dosen.id
                  )
                }
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      dosen.avgScore >= 70
                        ? "bg-green-500"
                        : dosen.avgScore >= 40
                        ? "bg-yellow-500"
                        : "bg-red-400"
                    }`}
                  >
                    {dosen.avgScore}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{dosen.nama}</p>
                    <p className="text-sm text-gray-500">
                      {dosen.matkulCount} mata kuliah &bull; Rata-rata{" "}
                      {dosen.avgScore}%
                    </p>
                  </div>
                </div>
                {expandedDosen === dosen.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedDosen === dosen.id && (
                <div className="border-t p-4 bg-gray-50">
                  <div className="space-y-2">
                    {dosen.details
                      .sort((a, b) => b.score - a.score)
                      .map((d, i) => (
                        <div
                          key={i}
                          className="p-3 bg-white rounded-lg border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs ${scoreColor(d.score)}`}
                              >
                                {d.score}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 text-sm">
                                  {d.matkul}
                                </p>
                                {d.matchedDomains.length > 0 && (
                                  <p className="text-xs text-gray-500">
                                    Domain: {d.matchedDomains.join(", ")}
                                  </p>
                                )}
                              </div>
                            </div>
                            <StatusBadge score={d.score} />
                          </div>

                          {/* Breakdown bar */}
                          <div className="flex items-center gap-2 mb-1">
                            <BreakdownBar breakdown={d.breakdown} />
                            <span className="text-xs text-gray-500">
                              Paper:{d.breakdown.keyword} Kompetensi:{d.breakdown.kompetensi} Depth:{d.breakdown.publikasi}
                            </span>
                          </div>

                          {d.matchedPapers.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              Paper: {d.matchedPapers.slice(0, 2).join(", ")}
                              {d.matchedPapers.length > 2 &&
                                ` +${d.matchedPapers.length - 2} lagi`}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

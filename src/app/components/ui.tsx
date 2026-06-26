"use client";

import { RefreshCw } from "lucide-react";

export function Loading({ text = "Memuat data..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
}

export function ErrorState({
  message = "Gagal memuat data",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#5c0000] transition"
        >
          <RefreshCw className="w-4 h-4" /> Coba Lagi
        </button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <html lang="id">
      <head>
        <title>Dashboard Prodi SI - Universitas Stikubank</title>
        <meta name="description" content="Dashboard analisis kompetensi dosen Program Studi Sistem Informasi Universitas Stikubank" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-3 sm:py-4">
                <a href="/" className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg sm:text-xl">SI</span>
                  </div>
                  <div>
                    <h1 className="text-base sm:text-xl font-bold text-gray-900">Dashboard Prodi SI</h1>
                    <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Universitas Stikubank</p>
                  </div>
                </a>

                {/* Desktop nav */}
                <nav className="hidden sm:flex gap-4">
                  <a href="/" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Ringkasan</a>
                  <a href="/dosen" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Dosen</a>
                  <a href="/analisis" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Analisis</a>
                </nav>

                {/* Mobile hamburger */}
                <button onClick={() => setNavOpen(!navOpen)} className="sm:hidden p-2 text-gray-600 hover:text-gray-900">
                  {navOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              {/* Mobile nav dropdown */}
              {navOpen && (
                <nav className="sm:hidden pb-3 space-y-1">
                  <a href="/" onClick={() => setNavOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Ringkasan</a>
                  <a href="/dosen" onClick={() => setNavOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Dosen</a>
                  <a href="/analisis" onClick={() => setNavOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Analisis</a>
                </nav>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <p className="text-center text-xs sm:text-sm text-gray-500">
                © 2024 Prodi SI - Universitas Stikubank
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

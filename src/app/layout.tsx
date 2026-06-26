import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard Prodi Sistem Informasi - Universitas Stikubank",
  description:
    "Dashboard analisis kompetensi dosen Program Studi Sistem Informasi Universitas Stikubank",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">SI</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Dashboard Prodi SI
                    </h1>
                    <p className="text-sm text-gray-500">
                      Universitas Stikubank
                    </p>
                  </div>
                </div>
                <nav className="flex gap-4">
                  <a
                    href="/"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    Ringkasan
                  </a>
                  <a
                    href="/dosen"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    Dosen
                  </a>
                  <a
                    href="/analisis"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    Analisis
                  </a>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <p className="text-center text-sm text-gray-500">
                © 2024 Program Studi Sistem Informasi - Universitas Stikubank.
                Dashboard Kompetensi Dosen.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

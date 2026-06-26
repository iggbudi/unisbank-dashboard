-- ============================================
-- DATABASE SCHEMA: Dashboard Prodi SI Unisbank
-- ============================================

-- Program Studi
CREATE TABLE IF NOT EXISTS program_studi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  fakultas TEXT,
  universitas TEXT DEFAULT 'Universitas Stikubank',
  visi TEXT,
  misi TEXT,
  target_tahun INTEGER DEFAULT 2035
);

-- Dosen
CREATE TABLE IF NOT EXISTS dosen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  email TEXT,
  google_scholar_id TEXT,
  google_scholar_url TEXT,
  foto_url TEXT,
  bidang_keahlian TEXT, -- JSON array atau comma-separated
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Kompetensi Dosen
CREATE TABLE IF NOT EXISTS kompetensi_dosen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dosen_id INTEGER REFERENCES dosen(id) ON DELETE CASCADE,
  bidang TEXT NOT NULL,
  tingkat INTEGER DEFAULT 50, -- 0-100
  UNIQUE(dosen_id, bidang)
);

-- Metrics Google Scholar
CREATE TABLE IF NOT EXISTS metrics_dosen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dosen_id INTEGER REFERENCES dosen(id) ON DELETE CASCADE UNIQUE,
  total_sitasi INTEGER DEFAULT 0,
  h_index INTEGER DEFAULT 0,
  i10_index INTEGER DEFAULT 0,
  sitasi_sejak_2021 INTEGER DEFAULT 0,
  h_index_sejak_2021 INTEGER DEFAULT 0,
  i10_index_sejak_2021 INTEGER DEFAULT 0,
  jumlah_publikasi INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tren Sitasi per Tahun
CREATE TABLE IF NOT EXISTS tren_sitasi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dosen_id INTEGER REFERENCES dosen(id) ON DELETE CASCADE,
  tahun INTEGER NOT NULL,
  sitasi INTEGER DEFAULT 0,
  UNIQUE(dosen_id, tahun)
);

-- Publikasi
CREATE TABLE IF NOT EXISTS publikasi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dosen_id INTEGER REFERENCES dosen(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  tahun INTEGER,
  sitasi INTEGER DEFAULT 0,
  jurnal TEXT,
  doi TEXT,
  url TEXT,
  is_top BOOLEAN DEFAULT 0
);

-- Visi-Misi
CREATE TABLE IF NOT EXISTS visi_misi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL CHECK(level IN ('pt', 'upps', 'ps')),
  nama_level TEXT,
  visi TEXT,
  misi TEXT,
  tahun_target INTEGER DEFAULT 2035
);

-- Mapping Kompetensi vs Visi-Misi PS
CREATE TABLE IF NOT EXISTS mapping_kompetensi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kompetensi TEXT NOT NULL,
  deskripsi TEXT,
  visi_misi_ps_id INTEGER REFERENCES visi_misi(id),
  bobot INTEGER DEFAULT 1
);

-- Mata Kuliah
CREATE TABLE IF NOT EXISTS mata_kuliah (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL UNIQUE,
  ps_id INTEGER DEFAULT 1 REFERENCES program_studi(id)
);

-- Mapping Dosen - Mata Kuliah
CREATE TABLE IF NOT EXISTS mapping_dosen_mk (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dosen_id INTEGER REFERENCES dosen(id) ON DELETE CASCADE,
  mk_id INTEGER REFERENCES mata_kuliah(id) ON DELETE CASCADE,
  UNIQUE(dosen_id, mk_id)
);

-- Indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_kompetensi_dosen_id ON kompetensi_dosen(dosen_id);
CREATE INDEX IF NOT EXISTS idx_tren_sitasi_dosen_id ON tren_sitasi(dosen_id);
CREATE INDEX IF NOT EXISTS idx_publikasi_dosen_id ON publikasi(dosen_id);
CREATE INDEX IF NOT EXISTS idx_metrics_dosen_id ON metrics_dosen(dosen_id);
CREATE INDEX IF NOT EXISTS idx_mapping_dosen_mk_dosen ON mapping_dosen_mk(dosen_id);
CREATE INDEX IF NOT EXISTS idx_mapping_dosen_mk_mk ON mapping_dosen_mk(mk_id);

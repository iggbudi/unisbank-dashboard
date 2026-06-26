-- ============================================
-- SEED DATA: Dashboard Prodi SI Unisbank
-- ============================================

-- Program Studi
INSERT INTO program_studi (nama, fakultas, visi, misi) VALUES (
  'Sistem Informasi',
  'Fakultas Teknologi Informasi dan Industri',
  'Pada tahun 2035 menjadi program studi unggul, mandiri dan profesional dalam bidang pengembangan sistem informasi dan analisis data yang inovatif dan adaptif berjiwa kewirausahaan serta berdaya saing internasional.',
  '1. Mengembangkan organisasi berbasis TIK untuk mendukung Good University Governance
2. Menyelenggarakan pendidikan akademik untuk menghasilkan lulusan yang ahli dalam pengembangan sistem informasi
3. Mengembangkan penelitian di bidang pengembangan sistem informasi dan analisa data
4. Melaksanakan pengabdian kepada masyarakat
5. Menyelenggarakan kemitraan dengan berbagai lembaga
6. Mengembangkan penelitian berbasis web dan mobile
7. Menyelenggarakan kemitraan dengan alumni'
);

-- Visi-Misi
INSERT INTO visi_misi (level, nama_level, visi, tahun_target) VALUES
('pt', 'Universitas Stikubank', 'Pada tahun 2035 menjadi perguruan tinggi yang bereputasi internasional berbasis teknologi informasi dan berjiwa kewirausahaan.', 2035),
('upps', 'Fakultas Teknologi Informasi dan Industri', 'Pada tahun 2035 menjadi Fakultas Teknologi Informasi dan Industri yang berdaya saing internasional, berjiwa kewirausahaan dan berkontribusi dalam penerapan ilmu komputer dan informatika terutama yang menunjang industri digital, keuangan dan perbankan.', 2035),
('ps', 'Program Studi Sistem Informasi', 'Pada tahun 2035 menjadi program studi unggul, mandiri dan profesional dalam bidang pengembangan sistem informasi dan analisis data yang inovatif dan adaptif berjiwa kewirausahaan serta berdaya saing internasional.', 2035);

-- Dosen
INSERT INTO dosen (nama, email, google_scholar_id, bidang_keahlian) VALUES
('Agus Prasetyo Utomo', 'edu.unisbank.ac.id', 'fGuDH54AAAAJ', 'IT Governance,Marketing,E-Government'),
('Dewi Handayani Untari Ningsih', 'edu.unisbank.ac.id', 'GlUhhHkAAAAJ', 'GIS/SIG,Machine Learning,Network Security'),
('Herny Februariyanti', 'edu.unisbank.ac.id', 'M_2wptYAAAAJ', 'Text Mining,NLP,Information Retrieval'),
('Arief Jananto', 'edu.unisbank.ac.id', '3mLWd44AAAAJ', 'Data Mining,Educational Data Mining'),
('Aji Supriyanto', 'edu.unisbank.ac.id', 'HoXJFgUAAAAJ', 'E-Government,Network Security,IDSS'),
('Novita Mariana', 'edu.unisbank.ac.id', '5T6F-4AAAAAJ', 'Sistem Informasi,SPK/MCDM'),
('Yohanes Suhari', 'edu.unisbank.ac.id', '81TwIJ0AAAAJ', 'Consumer Behavior,E-Business'),
('Dwi Budi Santoso', 'edu.unisbank.ac.id', 'qSvRBhoAAAAJ', 'Machine Learning,Deep Learning'),
('Hari Murti', 'edu.unisbank.ac.id', 'Aob_aRkAAAAJ', 'Database,Kriptografi,Database Terdistribusi'),
('Rara Sriartati Redjeki', 'edu.unisbank.ac.id', '5xbIcyIAAAAJ', 'Sistem Informasi,E-Commerce,Web Development'),
('Sulastri', 'edu.unisbank.ac.id', 'G24_tToAAAAJ', 'Data Mining,Clustering,Sentiment Analysis'),
('Saefurrohman', 'edu.unisbank.ac.id', 'KjLd_g0AAAAJ', 'Sistem Pakar,DSS,Chatbot'),
('Kristiawan Nugroho', 'edu.unisbank.ac.id', 'ilinD4sAAAAJ', 'Machine Learning,Komputasi Awan,Speech Recognition,Kriptografi');

-- Metrics Dosen
INSERT INTO metrics_dosen (dosen_id, total_sitasi, h_index, i10_index, sitasi_sejak_2021, h_index_sejak_2021, i10_index_sejak_2021, jumlah_publikasi) VALUES
(1, 1503, 20, 38, 1256, 18, 35, 80),
(2, 1079, 16, 21, 850, 14, 19, 70),
(3, 1019, 14, 22, 767, 12, 17, 65),
(4, 717, 13, 15, 522, 10, 10, 55),
(5, 741, 12, 20, 499, 12, 14, 60),
(6, 600, 13, 18, 452, 12, 15, 50),
(7, 507, 10, 10, 291, 9, 9, 40),
(8, 365, 12, 15, 312, 10, 12, 45),
(9, 346, 10, 11, 274, 9, 8, 50),
(10, 282, 8, 6, 168, 7, 4, 30),
(11, 215, 9, 9, 196, 8, 8, 40),
(12, 118, 6, 4, 115, 6, 4, 25),
(13, 808, 12, 17, 755, 12, 15, 50);

-- Kompetensi Dosen (contoh untuk beberapa dosen)
INSERT INTO kompetensi_dosen (dosen_id, bidang, tingkat) VALUES
-- Agus Prasetyo Utomo
(1, 'IT Governance', 95),
(1, 'Marketing', 88),
(1, 'E-Government', 82),
-- Dewi Handayani Untari Ningsih
(2, 'GIS/SIG', 92),
(2, 'Machine Learning', 85),
(2, 'Web Development', 88),
-- Herny Februariyanti
(3, 'Text Mining', 90),
(3, 'NLP', 88),
(3, 'Information Retrieval', 85),
-- Arief Jananto
(4, 'Data Mining', 92),
(4, 'Educational Data Mining', 88),
(4, 'Clustering', 82),
-- Aji Supriyanto
(5, 'E-Government', 90),
(5, 'Network Security', 85),
(5, 'IDSS', 80),
-- Novita Mariana
(6, 'Sistem Informasi', 88),
(6, 'SPK/MCDM', 85),
(6, 'IT Governance', 78),
-- Yohanes Suhari
(7, 'Consumer Behavior', 90),
(7, 'E-Business', 85),
(7, 'Digital Marketing', 78),
-- Dwi Budi Santoso
(8, 'Machine Learning', 88),
(8, 'Deep Learning', 85),
(8, 'Computer Vision', 80),
-- Hari Murti
(9, 'Database', 85),
(9, 'Kriptografi', 80),
(9, 'Database Terdistribusi', 82),
-- Rara Sriartati Redjeki
(10, 'Sistem Informasi', 85),
(10, 'E-Commerce', 80),
(10, 'Web Development', 82),
-- Sulastri
(11, 'Data Mining', 85),
(11, 'Clustering', 80),
(11, 'Sentiment Analysis', 78),
-- Saefurrohman
(12, 'Sistem Pakar', 78),
(12, 'DSS', 75),
(12, 'Chatbot', 72),
-- Kristiawan Nugroho
(13, 'Machine Learning', 92),
(13, 'Kriptografi', 88),
(13, 'Speech Recognition', 82);

-- Tren Sitasi (contoh untuk Agus Prasetyo Utomo)
INSERT INTO tren_sitasi (dosen_id, tahun, sitasi) VALUES
(1, 2018, 43),
(1, 2019, 37),
(1, 2020, 79),
(1, 2021, 93),
(1, 2022, 142),
(1, 2023, 211),
(1, 2024, 325),
(1, 2025, 350),
(1, 2026, 108);

-- Publikasi Top (contoh untuk Agus Prasetyo Utomo)
INSERT INTO publikasi (dosen_id, judul, tahun, sitasi, jurnal, is_top) VALUES
(1, 'Analisis Tata Kelola Teknologi Informasi (IT Governance) pada Bidang Akademik dengan COBIT Framework', 2011, 101, 'Dinamik', 1),
(1, 'Perancangan dan Pengaplikasian Sistem Penjualan pada Distro Smith Berbasis E-Commerce', 2011, 97, 'Dinamik', 1),
(1, 'Pengujian Aplikasi Transaksi Perdagangan Menggunakan Black Box Testing Boundary Value Analysis', 2020, 87, 'Jurnal Bisnis Terapan', 1),
(1, 'The effect of service quality and product diversity on customer loyalty', 2020, 83, 'Journal of Asian Finance', 1),
(1, 'Pengaruh Brand Image, Kualitas Produk, Dan Harga Terhadap Keputusan Pembelian', 2021, 60, 'Excellent', 1);

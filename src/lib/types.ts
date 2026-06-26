// ============================================
// Types untuk Dashboard Prodi SI Unisbank
// ============================================

export interface ProgramStudi {
  id: number;
  nama: string;
  fakultas: string;
  universitas: string;
  visi: string;
  misi: string;
  target_tahun: number;
}

export interface Dosen {
  id: number;
  nama: string;
  email: string;
  google_scholar_id: string;
  google_scholar_url?: string;
  foto_url?: string;
  bidang_keahlian: string;
  created_at: string;
}

export interface KompetensiDosen {
  id: number;
  dosen_id: number;
  bidang: string;
  tingkat: number; // 0-100
}

export interface MetricsDosen {
  id: number;
  dosen_id: number;
  total_sitasi: number;
  h_index: number;
  i10_index: number;
  sitasi_sejak_2021: number;
  h_index_sejak_2021: number;
  i10_index_sejak_2021: number;
  jumlah_publikasi: number;
  updated_at: string;
}

export interface TrenSitasi {
  id: number;
  dosen_id: number;
  tahun: number;
  sitasi: number;
}

export interface Publikasi {
  id: number;
  dosen_id: number;
  judul: string;
  tahun: number;
  sitasi: number;
  jurnal: string;
  doi?: string;
  url?: string;
  is_top: boolean;
}

export interface VisiMisi {
  id: number;
  level: 'pt' | 'upps' | 'ps';
  nama_level: string;
  visi: string;
  misi: string;
  tahun_target: number;
}

export interface MappingKompetensi {
  id: number;
  kompetensi: string;
  deskripsi?: string;
  visi_misi_ps_id: number;
  bobot: number;
}

// Combined types untuk API response
export interface DosenWithMetrics extends Dosen {
  metrics?: MetricsDosen;
  kompetensi?: KompetensiDosen[];
}

export interface DosenDetail extends DosenWithMetrics {
  tren_sitasi?: TrenSitasi[];
  publikasi?: Publikasi[];
}

export interface DashboardSummary {
  total_dosen: number;
  total_sitasi: number;
  avg_h_index: number;
  avg_i10_index: number;
  dosen_internasional: number;
  top_dosen: DosenWithMetrics[];
  distribusi_kompetensi: { bidang: string; jumlah: number }[];
}

// [FUTURE] Types untuk mata kuliah
// export interface MataKuliah {
//   id: number;
//   kode: string;
//   nama: string;
//   sks: number;
//   semester: number;
//   jenis: 'wajib' | 'pilihan';
// }

// export interface MappingDosenMK {
//   id: number;
//   dosen_id: number;
//   mk_id: number;
//   tahun_akademik: string;
// }

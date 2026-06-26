// ============================================
// Shared Scoring & NLP Utilities
// ============================================

export const STOP_WORDS = new Set([
  "dan", "di", "ke", "dari", "untuk", "dengan", "pada", "yang", "ini",
  "itu", "oleh", "sebagai", "adalah", "atau", "the", "of", "and", "in",
  "for", "to", "a", "an", "1", "2", "3",
]);

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractKeywords(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function extractPhrases(text: string): string[] {
  const norm = normalize(text);
  const words = norm.split(" ").filter((w) => w.length > 1);
  const phrases: string[] = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    phrases.push(`${words[i]} ${words[i + 1]}`);
  }
  for (let i = 0; i < words.length - 2; i++) {
    phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  return phrases;
}

// ============================================
// Domain Clusters
// ============================================
export const DOMAINS: Record<string, string[]> = {
  "Data Science": [
    "data mining", "data warehouse", "clustering", "klasifikasi",
    "classification", "mining", "warehouse", "big data", "etl",
    "prediksi", "prediction", "analitik", "analytics",
  ],
  "Statistika": [
    "statistik", "statistika", "probabilitas", "probability",
    "deskriptif", "descriptive", "inferensi", "inference",
    "regresi", "regression", "pemodelan statistik", "statistical modeling",
  ],
  "Sistem Informasi": [
    "sistem informasi", "information system", "enterprise",
    "interprise", "si enterprise", "erp", "tata kelola",
    "governance", "it governance", "cobit", "itil",
    "manajemen mutu", "quality management",
  ],
  "Web Development": [
    "web", "pemrograman web", "web programming", "web service",
    "web bisnis", "cms", "content management", "frontend",
    "backend", "fullstack", "html", "css", "javascript",
    "php", "laravel", "react", "node",
  ],
  "Mobile Development": [
    "mobile", "android", "ios", "flutter", "react native",
    "pemrograman web mobile", "web mobile",
  ],
  "Database": [
    "database", "basis data", "dbms", "sql", "nosql",
    "distribusi", "distributed", "terdistribusi",
    "manajemen database", "database management",
    "perancangan database", "database design",
  ],
  "Keamanan": [
    "keamanan", "security", "kriptografi", "cryptography",
    "cyber", "network security", "keamanan jaringan",
    "information security",
  ],
  "Jaringan": [
    "jaringan", "network", "networking", "tcp", "ip",
    "komputer", "computer network", "infrastruktur",
  ],
  "AI & Machine Learning": [
    "kecerdasan buatan", "artificial intelligence", "machine learning",
    "deep learning", "ai", "ml", "dl", "neural", "nlp",
    "natural language", "computer vision", "speech",
    "reconition", "retrieval", "information retrieval",
    "text mining", "sentiment",
  ],
  "Bisnis & Manajemen": [
    "manajemen", "management", "bisnis", "business",
    "kewirausahaan", "entrepreneur", "entrepreneurship",
    "startup", "pemasaran", "marketing", "digital marketing",
    "e-commerce", "supply chain", "crm", "customer relation",
    "akuntansi", "accounting", "biaya", "cost",
    "organisasi", "organization", "keputusan", "decision",
    "teori organisasi", "teori manajemen",
    "interpersonal", "komunikasi", "communication",
  ],
  "Rekayasa Perangkat Lunak": [
    "rpl", "software engineering", "rekayasa perangkat",
    "perangkat lunak", "pengembangan", "development",
    "testing", "implementasi", "pemeliharaan", "maintenance",
    "proyek", "project", "sdlc",
  ],
  "Sistem Pendukung Keputusan": [
    "spk", "dss", "decision support", "penunjang keputusan",
    "sistem pakar", "expert system", "fuzzy", "ahp",
  ],
  "Visualisasi & HCI": [
    "visualisasi", "visualization", "informasi", "information",
    "hci", "hmi", "interaksi manusia", "human computer",
    "manusia dan komputer", "ui", "ux", "user interface",
    "desain", "design", "web desain",
  ],
  "Penelitian": [
    "penelitian", "research", "metodologi", "methodology",
    "publikasi", "publication", "jurnal", "journal",
    "skripsi", "thesis", "ilmiah", "scientific",
  ],
  "Etika & Profesi": [
    "etika", "ethics", "profesi", "profession",
    "professional", "hukum", "law",
  ],
  "Sistem Operasi": [
    "sistem operasi", "operating system", "os", "linux",
    "windows", "instalasi", "installation",
  ],
  "Properti & Real Estate": [
    "properti", "property", "real estate", "manajemen properti",
  ],
};

// ============================================
// Synonym Mapping
// ============================================
const SYNONYM_PAIRS: [string, string[]][] = [
  ["sistem informasi", ["information system", "si", "enterprise", "interprise"]],
  ["basis data", ["database", "db", "dbms"]],
  ["pemrograman web", ["web programming", "web development", "pemrograman web"]],
  ["pemrograman web mobile", ["mobile programming", "mobile development", "web mobile"]],
  ["kecerdasan buatan", ["artificial intelligence", "ai"]],
  ["pembelajaran mesin", ["machine learning", "ml"]],
  ["pembelajaran mendalam", ["deep learning", "dl"]],
  ["jaringan komputer", ["computer network", "networking"]],
  ["keamanan sistem informasi", ["information security", "infosec"]],
  ["rekayasa perangkat lunak", ["software engineering", "rpl"]],
  ["sistem penunjang keputusan", ["decision support system", "dss"]],
  ["visualisasi data", ["data visualization", "data dan informasi"]],
  ["manajemen basis data", ["database management", "database admin"]],
  ["basis data terdistribusi", ["distributed database", "database distributed"]],
  ["interaksi manusia dan komputer", ["human computer interaction", "hci", "hmi"]],
  ["logika dan algoritma", ["logic and algorithm", "algorithm"]],
  ["struktur data", ["data structure"]],
  ["pemrograman terstruktur", ["structured programming"]],
  ["bahasa pemrograman", ["programming language"]],
  ["content management system", ["cms"]],
  ["teknologi web", ["web technology"]],
  ["metodologi penelitian", ["research methodology"]],
  ["etika profesi", ["professional ethics", "etika dalam profesi"]],
  ["analisa proses bisnis", ["business process analysis"]],
  ["analisa biaya", ["cost analysis"]],
  ["akuntansi bisnis", ["business accounting"]],
  ["statistik deskriptif", ["descriptive statistics"]],
  ["statistik probabilitas", ["probability statistics", "statistika probabilitas"]],
  ["logika matematika", ["mathematical logic"]],
  ["supply chain management", ["manajemen rantai pasok"]],
  ["customer relation management", ["crm", "manajemen hubungan pelanggan"]],
  ["pemasaran digital", ["digital marketing"]],
  ["web service development", ["pengembangan web service"]],
  ["data mining", ["teknik data mining", "penambangan data"]],
  ["data warehouse", ["gudang data"]],
  ["arsitektur enterprise", ["enterprise architecture"]],
  ["teori keputusan", ["decision theory"]],
  ["pemodelan statistik", ["statistical modeling"]],
  ["information retrieval", ["pencarian informasi"]],
  ["text mining", ["penambangan teks"]],
  ["sentiment analysis", ["analisis sentimen"]],
  ["etika dalam profesi", ["etika profesi", "professional ethics"]],
  ["manajemen proyek", ["project management"]],
  ["implementasi basis data", ["database implementation"]],
  ["perancangan basis data", ["database design"]],
  ["analisa sistem informasi", ["information system analysis"]],
  ["perancangan sistem informasi", ["information system design"]],
  ["testing dan implementasi", ["testing and implementation"]],
  ["pemeliharaan sistem informasi", ["information system maintenance"]],
];

const SYNONYM_INDEX = new Map<string, string>();
for (const [canonical, synonyms] of SYNONYM_PAIRS) {
  const normCanon = canonical.toLowerCase();
  SYNONYM_INDEX.set(normCanon, normCanon);
  for (const syn of synonyms) {
    SYNONYM_INDEX.set(syn.toLowerCase(), normCanon);
  }
}

// ============================================
// Shared Matching Functions
// ============================================

export function getDomain(text: string): string[] {
  const norm = normalize(text);
  const matched: string[] = [];
  for (const [domain, keywords] of Object.entries(DOMAINS)) {
    for (const kw of keywords) {
      if (norm.includes(kw) || kw.includes(norm) || normalize(kw) === norm) {
        matched.push(domain);
        break;
      }
    }
  }
  return matched;
}

export function synonymMatch(textA: string, textB: string): boolean {
  const phrasesA = extractPhrases(textA);
  const phrasesB = extractPhrases(textB);

  const canonA = new Set(phrasesA.map((p) => SYNONYM_INDEX.get(p) || p));
  const canonB = new Set(phrasesB.map((p) => SYNONYM_INDEX.get(p) || p));

  for (const a of canonA) {
    if (canonB.has(a)) return true;
  }
  return false;
}

/**
 * Checks if a paper title is related to a mata kuliah name.
 * Used by dosen detail page for lightweight relevance check.
 */
export function isPaperRelated(mkName: string, paperTitle: string): boolean {
  const mkKw = extractKeywords(mkName);
  const paperKw = extractKeywords(paperTitle);

  // Keyword overlap
  const overlap = mkKw.filter((w) => paperKw.includes(w));
  if (overlap.length > 0) return true;

  // Synonym match
  if (synonymMatch(mkName, paperTitle)) return true;

  // Domain-level matching
  const mkDomains = getDomain(mkName);
  const paperDomains = getDomain(paperTitle);
  if (mkDomains.some((d) => paperDomains.includes(d))) return true;

  return false;
}

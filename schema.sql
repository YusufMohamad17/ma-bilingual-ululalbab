-- ==============================================================================
-- SCHEMA SQL UNTUK CLOUDFLARE D1 DATABASE
-- Berdasarkan model data MA Bilingual Ulul Albab (server/db.ts)
-- ==============================================================================

-- 1. Tabel Kategori / Pengaturan Umum (Key-Value)
CREATE TABLE IF NOT EXISTS pengaturan (
    kunci TEXT PRIMARY KEY,
    nilai TEXT NOT NULL,
    deskripsi TEXT
);

-- 2. Tabel Kegiatan (Events)
CREATE TABLE IF NOT EXISTS kegiatan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    judul TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    deskripsi TEXT NOT NULL,
    konten TEXT NOT NULL,
    kategori TEXT NOT NULL,
    gambar_url TEXT NOT NULL,
    tanggal_mulai TEXT NOT NULL,
    tanggal_selesai TEXT,
    lokasi TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published'
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Guru / Tenaga Pengajar
CREATE TABLE IF NOT EXISTS guru (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    nip TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    no_hp TEXT NOT NULL,
    jabatan TEXT NOT NULL,
    mata_pelajaran TEXT NOT NULL,
    pendidikan TEXT NOT NULL,
    foto_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'aktif', -- 'aktif', 'nonaktif'
    bio TEXT NOT NULL
);

-- 4. Tabel Jadwal Mata Pelajaran
CREATE TABLE IF NOT EXISTS jadwal (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hari TEXT NOT NULL,
    jam_ke INTEGER NOT NULL,
    jam_mulai TEXT NOT NULL,
    jam_selesai TEXT NOT NULL,
    mata_pelajaran TEXT NOT NULL,
    guru_id INTEGER NOT NULL,
    kelas TEXT NOT NULL,
    ruangan TEXT NOT NULL,
    tahun_ajaran TEXT NOT NULL,
    semester INTEGER NOT NULL,
    is_aktif INTEGER NOT NULL DEFAULT 1, -- 0 = False, 1 = True
    FOREIGN KEY(guru_id) REFERENCES guru(id) ON DELETE CASCADE
);

-- 5. Tabel Pendaftar PPDB (Penerimaan Peserta Didik Baru)
CREATE TABLE IF NOT EXISTS ppdb_pendaftar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    no_pendaftaran TEXT NOT NULL UNIQUE,
    nama_lengkap TEXT NOT NULL,
    nik TEXT NOT NULL UNIQUE,
    tempat_lahir TEXT NOT NULL,
    tanggal_lahir TEXT NOT NULL,
    jenis_kelamin TEXT NOT NULL,
    agama TEXT NOT NULL,
    alamat TEXT NOT NULL,
    kelurahan TEXT NOT NULL,
    kecamatan TEXT NOT NULL,
    kota TEXT NOT NULL,
    provinsi TEXT NOT NULL,
    nama_ayah TEXT NOT NULL,
    nama_ibu TEXT NOT NULL,
    pekerjaan_ayah TEXT NOT NULL,
    pekerjaan_ibu TEXT NOT NULL,
    no_hp_ortu TEXT NOT NULL,
    email_ortu TEXT NOT NULL,
    asal_sekolah TEXT NOT NULL,
    nilai_rata_rata REAL NOT NULL,
    tahun_lulus INTEGER NOT NULL,
    pilihan_kelas TEXT NOT NULL,
    jalur TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'accepted', 'rejected'
    dokumen_kk TEXT NOT NULL DEFAULT '',
    dokumen_akta TEXT NOT NULL DEFAULT '',
    dokumen_ijazah TEXT NOT NULL DEFAULT '',
    dokumen_foto TEXT NOT NULL DEFAULT '',
    catatan_admin TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Alumni
CREATE TABLE IF NOT EXISTS alumni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    tahun_lulus INTEGER NOT NULL,
    angkatan TEXT NOT NULL,
    jurusan TEXT NOT NULL,
    karir_sekarang TEXT NOT NULL,
    institusi_sekarang TEXT NOT NULL,
    kota_sekarang TEXT NOT NULL,
    foto_url TEXT NOT NULL,
    linkedin_url TEXT NOT NULL,
    prestasi TEXT NOT NULL
);

-- 7. Tabel Admin Akun
CREATE TABLE IF NOT EXISTS admin_akun (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    nama_lengkap TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'OPERATOR', -- 'SUPERADMIN', 'ADMIN', 'OPERATOR', 'EDITOR'
    foto_url TEXT NOT NULL DEFAULT '',
    is_aktif INTEGER NOT NULL DEFAULT 1 -- 0 = False, 1 = True
);

-- 8. Tabel Log Aktivitas Admin
CREATE TABLE IF NOT EXISTS admin_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    aksi TEXT NOT NULL,
    modul TEXT NOT NULL,
    target_id INTEGER,
    detail TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(admin_id) REFERENCES admin_akun(id) ON DELETE CASCADE
);

-- ==============================================================================
-- SEED DATA DEFAULTS (Opsional - pengaturan & akun superadmin awal)
-- ==============================================================================
INSERT OR IGNORE INTO pengaturan (kunci, nilai, deskripsi) VALUES 
('nama_madrasah', 'MA Bilingual Ulul Albab', 'Nama institusi'),
('tagline', 'Madrasatul Qur''an wal Lughah', 'Tagline utama'),
('deskripsi_singkat', 'Membentuk Generasi Berilmu, Berakhlak, Berbahasa, dan Berprestasi berbasis Nilai Luhur Kepesantrenan.', 'Slogan deskripsi'),
('alamat', 'Jl. Sungai Brantas No.25, Kelutan, Ngronggot, Nganjuk, Jawa Timur', 'Alamat fisik madrasah'),
('ppdb_aktif', 'true', 'Status pendaftaran PPDB');

-- Menggunakan default salt 'mab2026salt' dan default password 'Admin@Madrasah2026'
-- Password hash: crypto.createHmac('sha256', 'mab2026salt').update('Admin@Madrasah2026').digest('hex')
INSERT OR IGNORE INTO admin_akun (id, username, email, password_hash, salt, nama_lengkap, role, is_aktif) VALUES
(1, 'superadmin', 'superadmin@ululalbab.sch.id', 'e1f57bf4b8c644958ce7860183b50c05f7ba50fecd9d453888358dedb2d076d3', 'mab2026salt', 'Super Administrator', 'SUPERADMIN', 1);

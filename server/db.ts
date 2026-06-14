import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_DIR = path.join(process.cwd(), 'server', 'data');
export const DB_FILE = path.join(DB_DIR, 'db.json');

// Interface definition for data types
export interface Kegiatan {
  id: number;
  judul: string;
  slug: string;
  deskripsi: string;
  konten: string;
  kategori: string;
  gambar_url: string;
  tanggal_mulai: string;
  tanggal_selesai?: string;
  lokasi: string;
  status: string; // draft / published
  created_at: string;
}

export interface PPDBPendaftar {
  id: number;
  no_pendaftaran: string;
  nama_lengkap: string;
  nik: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  agama: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  nama_ayah: string;
  nama_ibu: string;
  pekerjaan_ayah: string;
  pekerjaan_ibu: string;
  no_hp_ortu: string;
  email_ortu: string;
  asal_sekolah: string;
  nilai_rata_rata: number;
  tahun_lulus: number;
  pilihan_kelas: string;
  jalur: string;
  status: 'pending' | 'verified' | 'accepted' | 'rejected';
  dokumen_kk: string;
  dokumen_akta: string;
  dokumen_ijazah: string;
  dokumen_foto: string;
  catatan_admin: string;
  created_at: string;
}

export interface Guru {
  id: number;
  nama: string;
  nip: string;
  email: string;
  no_hp: string;
  jabatan: string;
  mata_pelajaran: string;
  pendidikan: string;
  foto_url: string;
  status: string; // aktif / nonaktif
  bio: string;
}

export interface Jadwal {
  id: number;
  hari: string;
  jam_ke: number;
  jam_mulai: string;
  jam_selesai: string;
  mata_pelajaran: string;
  guru_id: number;
  kelas: string;
  ruangan: string;
  tahun_ajaran: string;
  semester: number;
  is_aktif: boolean;
}

export interface Alumni {
  id: number;
  nama: string;
  tahun_lulus: number;
  angkatan: string;
  jurusan: string;
  karir_sekarang: string;
  institusi_sekarang: string;
  kota_sekarang: string;
  foto_url: string;
  linkedin_url: string;
  prestasi: string;
}

export interface LogAktivitas {
  id: number;
  admin_id: number;
  username: string;
  aksi: string;
  modul: string;
  target_id?: number;
  detail: string; // JSON String or plain text
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface Pengaturan {
  kunci: string;
  nilai: string;
  deskripsi: string;
}

export interface AdminAkun {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  salt: string;
  nama_lengkap: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'OPERATOR' | 'EDITOR';
  foto_url: string;
  is_aktif: boolean;
}

export interface DatabaseSchema {
  kegiatan: Kegiatan[];
  ppdb_pendaftar: PPDBPendaftar[];
  guru: Guru[];
  jadwal: Jadwal[];
  alumni: Alumni[];
  pengaturan: Record<string, string>;
  admin_akun: AdminAkun[];
  admin_log: LogAktivitas[];
}

export function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

const DEFAULT_SALT = 'mab2026salt';
const DEFAULT_HASH = hashPassword('Admin@Madrasah2026', DEFAULT_SALT); // Default password

const defaultDatabase: DatabaseSchema = {
  kegiatan: [
    {
      id: 1,
      judul: "Penerimaan Peserta Didik Baru (PPDB) TA 2026/2027",
      slug: "ppdb-ta-2026-2027",
      deskripsi: "Pendaftaran siswa baru MA Bilingual Ulul Albab telah resmi dibuka untuk jalur Reguler, Prestasi, dan Kemitraan.",
      konten: `<h3>Selamat Datang Calon Siswa Baru!</h3>
<p>MA Bilingual Ulul Albab merupakan Madrasah Aliyah berbasis kepesantrenan modern yang mengedepankan integrasi antara kurikulum kepesantrenan (Tahfidzul Qur'an dan penguasaan kitab kuning) dengan kurikulum akademis nasional, serta penguatan penguasaan bahasa asing (Arab dan Inggris).</p>
<p>Pendaftaran gelombang pertama dimulai pada bulan Juni 2026 dengan beberapa pilihan jalur pendaftaran, termasuk beasiswa penuh bagi siswa berprestasi nasional.</p>`,
      kategori: "Akademik",
      gambar_url: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=1200",
      tanggal_mulai: "2026-06-01T08:00:00.000Z",
      tanggal_selesai: "2026-07-15T15:00:00.000Z",
      lokasi: "Kantor Pusat PPDB MA Bilingual Ulul Albab",
      status: "published",
      created_at: "2026-06-01T00:00:00.000Z"
    },
    {
      id: 2,
      judul: "Lomba Olimpiade MIPA Madrasah (OMIM) 2026",
      slug: "olimpiade-mipa-madrasah-2026",
      deskripsi: "Kompetisi Sains bergengsi tingkat Madrasah se-Jawa Timur yang diselenggarakan rutin setiap tahun di MA Bilingual.",
      konten: `<h3>Persiapkan Tim Terbaikmu!</h3>
<p>Bidang studi yang dilombakan meliputi Matematika, Fisika, Kimia, dan Biologi Terintegrasi Nilai-nilai Keislaman. Lomba ini terbuka untuk jenjang SMP/MTs sederajat.</p>
<p>Dapatkan trophy bergilir, piagam penghargaan, dan tabungan pendidikan senilai belasan juta rupiah.</p>`,
      kategori: "Akademik",
      gambar_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200",
      tanggal_mulai: "2026-06-25T07:30:00.000Z",
      tanggal_selesai: "2026-06-26T16:00:00.000Z",
      lokasi: "Aula Serbaguna lantai 2 dan Laboratorium Multimedia",
      status: "published",
      created_at: "2026-06-05T00:00:00.000Z"
    },
    {
      id: 3,
      judul: "Khotmil Qur'an & Istighosah Kubro Akhir Syahr",
      slug: "khotmil-quran-istighosah-kubro",
      deskripsi: "Kegiatan spiritual rutin bulanan serta doa bersama demi kelancaran kegiatan belajar-mengajar dan keselamatan umat.",
      konten: `<h3>Majelis Zikir dan Salawat</h3>
<p>Khotmil Qur'an bil Ghoib dipimpin langsung oleh para Hafidz dari Dewan Asatidzah, dilanjutkan Istighosah kubro dan tausiyah penyemangat iman.</p>
<p>Seluruh jamaah diharapkan mengenakan busana muslim bernuansa putih bersih.</p>`,
      kategori: "Keagamaan",
      gambar_url: "https://images.unsplash.com/photo-1597935258735-e254c1839512?auto=format&fit=crop&q=80&w=1200",
      tanggal_mulai: "2026-06-30T18:00:00.000Z",
      tanggal_selesai: "2026-06-30T21:30:00.000Z",
      lokasi: "Masjid Jam'iyyatul Ulul Albab",
      status: "published",
      created_at: "2026-06-10T00:00:00.000Z"
    },
    {
      id: 4,
      judul: "Pekan Seni dan Olahraga Madrasah (Porsema) 2026",
      slug: "porsema-ma-bilingual-2026",
      deskripsi: "Sinergi bakat estetika dan kebugaran jasmani dalam kompetisi inter-kelas (Classmeeting) pasca ujian semester.",
      konten: `<h3>Ayo Junjung Tinggi Sportivitas!</h3>
<p>Cabang olahraga meliputi Futsal Sarung, Badminton, Tenis Meja, Hadrah Klasik, Kaligrafi Kontemporer, dan Debat Bahasa Arab-Inggris.</p>`,
      kategori: "Kesenian",
      gambar_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200",
      tanggal_mulai: "2026-07-05T07:00:00.000Z",
      tanggal_selesai: "2026-07-08T13:00:00.000Z",
      lokasi: "Sport Centre & Lapangan Hijau Madrasah",
      status: "published",
      created_at: "2026-06-12T00:00:00.000Z"
    }
  ],
  ppdb_pendaftar: [
    {
      id: 1,
      no_pendaftaran: "PPD-2026-0001",
      nama_lengkap: "Ahmad Mujahidin",
      nik: "3518091212090001",
      tempat_lahir: "Nganjuk",
      tanggal_lahir: "2010-04-12",
      jenis_kelamin: "L",
      agama: "Islam",
      alamat: "Ploso, Ngronggot",
      kelurahan: "Kelutan",
      kecamatan: "Ngronggot",
      kota: "Nganjuk",
      provinsi: "Jawa Timur",
      nama_ayah: "KH. Syamsuddin",
      nama_ibu: "Wafiroh",
      pekerjaan_ayah: "Guru / Swasta",
      pekerjaan_ibu: "Ibu Rumah Tangga",
      no_hp_ortu: "081234567890",
      email_ortu: "syamsuddin@gmail.com",
      asal_sekolah: "MTs Ulul Albab Ploso",
      nilai_rata_rata: 92.5,
      tahun_lulus: 2026,
      pilihan_kelas: "10-A (Unggulan Keagamaan)",
      jalur: "Prestasi",
      status: "accepted",
      dokumen_kk: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=50",
      dokumen_akta: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=50",
      dokumen_ijazah: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=50",
      dokumen_foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200",
      catatan_admin: "Dokumen lengkap dan memenuhi kriteria akademik jalur prestasi. Selamat!",
      created_at: "2026-06-02T10:30:00.000Z"
    },
    {
      id: 2,
      no_pendaftaran: "PPD-2026-0002",
      nama_lengkap: "Siti Fatimah Az-Zahra",
      nik: "3518105208100003",
      tempat_lahir: "Kediri",
      tanggal_lahir: "2010-08-20",
      jenis_kelamin: "P",
      agama: "Islam",
      alamat: "Jl. Pemuda No. 44, Gampengrejo",
      kelurahan: "Gampengrejo",
      kecamatan: "Gampengrejo",
      kota: "Kediri",
      provinsi: "Jawa Timur",
      nama_ayah: "Ahmad Solihin",
      nama_ibu: "Nur Halimah",
      pekerjaan_ayah: "Pegawai Negeri Sipil",
      pekerjaan_ibu: "Guru",
      no_hp_ortu: "085799887766",
      email_ortu: "solihinkediri@yahoo.com",
      asal_sekolah: "SMP Negeri 1 Kediri",
      nilai_rata_rata: 89.2,
      tahun_lulus: 2026,
      pilihan_kelas: "10-B (MIPA Bilingual)",
      jalur: "Reguler",
      status: "verified",
      dokumen_kk: "",
      dokumen_akta: "",
      dokumen_ijazah: "",
      dokumen_foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200",
      catatan_admin: "Berkas fisik sudah diverifikasi panitia lokal. Menunggu tes wawancara kepesantrenan.",
      created_at: "2026-06-05T14:22:00.000Z"
    },
    {
      id: 3,
      no_pendaftaran: "PPD-2026-0003",
      nama_lengkap: "Muhammad Wildan Al-Anshori",
      nik: "3518090101100002",
      tempat_lahir: "Nganjuk",
      tanggal_lahir: "2010-01-01",
      jenis_kelamin: "L",
      agama: "Islam",
      alamat: "Papar, Kediri",
      kelurahan: "Papar",
      kecamatan: "Papar",
      kota: "Kediri",
      provinsi: "Jawa Timur",
      nama_ayah: "Murodi Al-Anshori",
      nama_ibu: "Lailatul Masruroh",
      pekerjaan_ayah: "Petani / Wiraswasta",
      pekerjaan_ibu: "Ibu Rumah Tangga",
      no_hp_ortu: "089123456333",
      email_ortu: "wildananshori@gmail.com",
      asal_sekolah: "MTsN 2 Nganjuk",
      nilai_rata_rata: 84.8,
      tahun_lulus: 2026,
      pilihan_kelas: "10-C (IPS Bilingual)",
      jalur: "Reguler",
      status: "pending",
      dokumen_kk: "",
      dokumen_akta: "",
      dokumen_ijazah: "",
      dokumen_foto: "",
      catatan_admin: "Data pendaftaran terkirim online. Menunggu unggahan kelengkapan KK dan Ijazah.",
      created_at: "2026-06-12T09:12:00.000Z"
    }
  ],
  guru: [
    {
      id: 1,
      nama: "Drs. KH. Ahmad Fauzi, M.Pd.I",
      nip: "197508122003121002",
      email: "kh.ahmadfauzi@ululalbab.sch.id",
      no_hp: "081234560001",
      jabatan: "Kepala Madrasah & Pengasuh",
      mata_pelajaran: "Tafsir Al-Qur'an & Ushul Fiqih",
      pendidikan: "S2 Manajemen Pendidikan Islam, UIN Sunan Ampel",
      foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      status: "aktif",
      bio: "Berpengalaman mengampu ilmu syariah dan kepesantrenan lebih dari 20 tahun. Menjadi pilar utama pengembangan sistem dwibahasa di Ulul Albab."
    },
    {
      id: 2,
      nama: "Ustadzah Siti Aminah, S.Pd",
      nip: "198804052015042001",
      email: "ustadzah.aminah@ululalbab.sch.id",
      no_hp: "081234560002",
      jabatan: "Waka Kurikulum & Guru Senior",
      mata_pelajaran: "Bahasa Arab, Nahwu-Shorof",
      pendidikan: "S1 Pendidikan Bahasa Arab, Universitas Negeri Malang",
      foto_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      status: "aktif",
      bio: "Ahli metodologi pengajaran mufradat cepat serta pendorong program debat Bahasa Arab tingkat siswa di seluruh Jawa Timur."
    },
    {
      id: 3,
      nama: "Ustadz H. Muhammad Budi, Lc., M.Phil",
      nip: "198510102012021005",
      email: "m.budi.lc@ululalbab.sch.id",
      no_hp: "081234560003",
      jabatan: "Waka Kesiswaan & Koordinator Tahfidz",
      mata_pelajaran: "Al-Qur'an Hadits, Fiqih Bilingual",
      pendidikan: "S1 Ushuluddin, Al-Azhar University Cairo | S2 Islamic Philosophy, McGill",
      foto_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200",
      status: "aktif",
      bio: "Pemegang sanad qiraah sab'ah, berkomitmen mengasuh santri dalam menghafal Al-Qur'an mutqin demi mewujudkan generasi berilmu tinggi."
    },
    {
      id: 4,
      nama: "Sarah Jasmine, M.Sc",
      nip: "199307182022012004",
      email: "sarahjasmine@ululalbab.sch.id",
      no_hp: "081234560004",
      jabatan: "Guru Kimia Bilingual & Riset",
      mata_pelajaran: "Chemistry (Bilingual), Kimia, Karya Ilmiah Remaja",
      pendidikan: "S2 Chemical Engineering, Institut Teknologi Sepuluh Nopember",
      foto_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      status: "aktif",
      bio: "Membimbing santri dalam aneka perlombaan sains nasional dan riset lingkungan berbasis kearifan madrasah."
    }
  ],
  jadwal: [
    { id: 1, hari: "Senin", jam_ke: 1, jam_mulai: "07:00", jam_selesai: "07:45", mata_pelajaran: "Tafsir Al-Qur'an", guru_id: 1, kelas: "10-A", ruangan: "R. Abu Bakar", tahun_ajaran: "2025/2026", semester: 2, is_aktif: true },
    { id: 2, hari: "Senin", jam_ke: 2, jam_mulai: "07:45", jam_selesai: "08:30", mata_pelajaran: "Tafsir Al-Qur'an", guru_id: 1, kelas: "10-A", ruangan: "R. Abu Bakar", tahun_ajaran: "2025/2026", semester: 2, is_aktif: true },
    { id: 3, hari: "Senin", jam_ke: 3, jam_mulai: "08:30", jam_selesai: "09:15", mata_pelajaran: "Bahasa Arab", guru_id: 2, kelas: "10-A", ruangan: "R. Abu Bakar", tahun_ajaran: "2025/2026", semester: 2, is_aktif: true },
    { id: 4, hari: "Senin", jam_ke: 4, jam_mulai: "09:30", jam_selesai: "10:15", mata_pelajaran: "Nahwu Shorof", guru_id: 2, kelas: "10-A", ruangan: "R. Abu Bakar", tahun_ajaran: "2025/2026", semester: 2, is_aktif: true },
    { id: 5, hari: "Senin", jam_ke: 5, jam_mulai: "10:15", jam_selesai: "11:00", mata_pelajaran: "Chemistry (Bilingual)", guru_id: 4, kelas: "10-A", ruangan: "Lab Kimia", tahun_ajaran: "2025/2026", semester: 2, is_aktif: true },

    { id: 6, hari: "Selasa", jam_ke: 1, jam_mulai: "07:00", jam_selesai: "07:45", mata_pelajaran: "Ushul Fiqih", guru_id: 1, kelas: "10-A", ruangan: "R. Abu Bakar", tahun_ajaran: "2025/2026", semester: 2, is_aktif: true },
    { id: 7, hari: "Selasa", jam_ke: 2, jam_mulai: "07:45", jam_selesai: "08:30", mata_pelajaran: "Al-Qur'an Hadits", guru_id: 3, kelas: "10-A", ruangan: "R. Abu Bakar", tahun_ajaran: "2025/2026", semester: 2, is_aktif: true },
    { id: 8, hari: "Selasa", jam_ke: 3, jam_mulai: "08:30", jam_selesai: "09:15", mata_pelajaran: "Chemistry (Bilingual)", guru_id: 4, kelas: "10-A", ruangan: "Lab Kimia", tahun_ajaran: "2025/2026", semester: 2, is_aktif: true },
    { id: 9, hari: "Selasa", jam_ke: 4, jam_mulai: "09:30", jam_selesai: "10:15", mata_pelajaran: "Fiqih", guru_id: 3, kelas: "10-A", ruangan: "R. Abu Bakar", tahun_ajaran: "2025/2026", semester: 2, is_aktif: true }
  ],
  alumni: [
    {
      id: 1,
      nama: "Zayn Ahmad El-Hafidz, Lc., M.A.",
      tahun_lulus: 2019,
      angkatan: "Angkatan IV",
      jurusan: "Keagamaan",
      karir_sekarang: "Diplomat Kebudayaan & Writer",
      institusi_sekarang: "KBRI Cairo, Mesir",
      kota_sekarang: "Cairo",
      foto_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
      linkedin_url: "https://linkedin.com/in/zaynahmad",
      prestasi: "Juara Pembicara Terbaik Debat Bahasa Arab Internasional di Qatar 2021"
    },
    {
      id: 2,
      nama: "Nabila Syauqiah, B.Sc.",
      tahun_lulus: 2021,
      angkatan: "Angkatan VI",
      jurusan: "MIPA",
      karir_sekarang: "AI Research Assistant",
      institusi_sekarang: "Nanyang Technological University (NTU)",
      kota_sekarang: "Singapore",
      foto_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      linkedin_url: "https://linkedin.com/in/nabilasyauqiah",
      prestasi: "Gold Medalist International Science Project Olympiad di Warsaw, Polandia"
    }
  ],
  pengaturan: {
    nama_madrasah: "MA Bilingual Ulul Albab",
    tagline: "Madrasatul Qur'an wal Lughah",
    deskripsi_singkat: "Membentuk Generasi Berilmu, Berakhlak, Berbahasa, dan Berprestasi berbasis Nilai Luhur Kepesantrenan.",
    alamat: "Jl. Sungai Brantas No.25, Kelutan, Ngronggot, Nganjuk, Jawa Timur",
    telepon: "0358-123456",
    email: "mabilingualululalbab2015@gmail.com",
    facebook: "https://facebook.com/mab.ululalbab",
    instagram: "https://instagram.com/mab.ululalbab",
    youtube: "https://youtube.com/@mabululalbab",
    whatsapp: "628123456789",
    ppdb_aktif: "true",
    ppdb_tahun: "2026/2027",
    kalender_akademik_url: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1200"
  },
  admin_akun: [
    {
      id: 1,
      username: "superadmin",
      email: "superadmin@ululalbab.sch.id",
      password_hash: DEFAULT_HASH,
      salt: DEFAULT_SALT,
      nama_lengkap: "Super Administrator",
      role: "SUPERADMIN",
      foto_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
      is_aktif: true
    }
  ],
  admin_log: []
};

export class JsonDatabase {
  private schema: DatabaseSchema;

  constructor() {
    this.schema = defaultDatabase;
    this.init();
  }

  private init() {
    // Ensure data directory exists
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      this.save();
    } else {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Deep merge or validate
        this.schema = { ...defaultDatabase, ...parsed };
      } catch (err) {
        console.error("Failed to parse database file. Resetting to defaults.", err);
        this.save();
      }
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.schema, null, 2), 'utf-8');
    } catch (err) {
      console.error("Failed to write database file:", err);
    }
  }

  // Get data methods
  public getKegiatan(): Kegiatan[] { return this.schema.kegiatan; }
  public getPPDB(): PPDBPendaftar[] { return this.schema.ppdb_pendaftar; }
  public getGuru(): Guru[] { return this.schema.guru; }
  public getJadwal(): Jadwal[] { return this.schema.jadwal; }
  public getAlumni(): Alumni[] { return this.schema.alumni; }
  public getPengaturan(): Record<string, string> { return this.schema.pengaturan; }
  public getAdmins(): AdminAkun[] { return this.schema.admin_akun; }
  public getLogs(): LogAktivitas[] { return this.schema.admin_log; }

  // Set / Modify methods
  public updatePengaturan(key: string, value: string) {
    this.schema.pengaturan[key] = value;
    this.save();
  }

  public addPPDB(pendaftar: Omit<PPDBPendaftar, 'id' | 'no_pendaftaran' | 'created_at'>): PPDBPendaftar {
    const nextId = this.schema.ppdb_pendaftar.reduce((max, p) => p.id > max ? p.id : max, 0) + 1;
    const year = new Date().getFullYear();
    const countStr = String(nextId).padStart(4, '0');
    const no_pendaftaran = `PPD-${year}-${countStr}`;

    const newPendaftar: PPDBPendaftar = {
      ...pendaftar,
      id: nextId,
      no_pendaftaran,
      created_at: new Date().toISOString()
    };

    this.schema.ppdb_pendaftar.push(newPendaftar);
    this.save();
    return newPendaftar;
  }

  public updatePPDBStatus(id: number, status: PPDBPendaftar['status'], catatan?: string): boolean {
    const p = this.schema.ppdb_pendaftar.find(item => item.id === id);
    if (p) {
      p.status = status;
      if (catatan !== undefined) p.catatan_admin = catatan;
      this.save();
      return true;
    }
    return false;
  }

  public savePPDBData(id: number, updated: Partial<PPDBPendaftar>): boolean {
    const idx = this.schema.ppdb_pendaftar.findIndex(item => item.id === id);
    if (idx !== -1) {
      this.schema.ppdb_pendaftar[idx] = { ...this.schema.ppdb_pendaftar[idx], ...updated } as PPDBPendaftar;
      this.save();
      return true;
    }
    return false;
  }

  public deletePPDB(id: number): boolean {
    const initialLen = this.schema.ppdb_pendaftar.length;
    this.schema.ppdb_pendaftar = this.schema.ppdb_pendaftar.filter(item => item.id !== id);
    if (this.schema.ppdb_pendaftar.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Kegiatan/Events CRUD
  public addKegiatan(k: Omit<Kegiatan, 'id' | 'created_at'>): Kegiatan {
    const nextId = this.schema.kegiatan.reduce((max, item) => item.id > max ? item.id : max, 0) + 1;
    const newItem: Kegiatan = {
      ...k,
      id: nextId,
      created_at: new Date().toISOString()
    };
    this.schema.kegiatan.push(newItem);
    this.save();
    return newItem;
  }

  public updateKegiatan(id: number, updated: Partial<Kegiatan>): boolean {
    const idx = this.schema.kegiatan.findIndex(item => item.id === id);
    if (idx !== -1) {
      this.schema.kegiatan[idx] = { ...this.schema.kegiatan[idx], ...updated } as Kegiatan;
      this.save();
      return true;
    }
    return false;
  }

  public deleteKegiatan(id: number): boolean {
    const initialLen = this.schema.kegiatan.length;
    this.schema.kegiatan = this.schema.kegiatan.filter(item => item.id !== id);
    if (this.schema.kegiatan.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Guru CRUD
  public addGuru(teacher: Omit<Guru, 'id'>): Guru {
    const nextId = this.schema.guru.reduce((max, item) => item.id > max ? item.id : max, 0) + 1;
    const newItem: Guru = { ...teacher, id: nextId };
    this.schema.guru.push(newItem);
    this.save();
    return newItem;
  }

  public updateGuru(id: number, updated: Partial<Guru>): boolean {
    const idx = this.schema.guru.findIndex(item => item.id === id);
    if (idx !== -1) {
      this.schema.guru[idx] = { ...this.schema.guru[idx], ...updated } as Guru;
      this.save();
      return true;
    }
    return false;
  }

  public deleteGuru(id: number): boolean {
    const initialLen = this.schema.guru.length;
    this.schema.guru = this.schema.guru.filter(item => item.id !== id);
    if (this.schema.guru.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Alumni CRUD
  public addAlumni(al: Omit<Alumni, 'id'>): Alumni {
    const nextId = this.schema.alumni.reduce((max, item) => item.id > max ? item.id : max, 0) + 1;
    const newItem: Alumni = { ...al, id: nextId };
    this.schema.alumni.push(newItem);
    this.save();
    return newItem;
  }

  public updateAlumni(id: number, updated: Partial<Alumni>): boolean {
    const idx = this.schema.alumni.findIndex(item => item.id === id);
    if (idx !== -1) {
      this.schema.alumni[idx] = { ...this.schema.alumni[idx], ...updated } as Alumni;
      this.save();
      return true;
    }
    return false;
  }

  public deleteAlumni(id: number): boolean {
    const initialLen = this.schema.alumni.length;
    this.schema.alumni = this.schema.alumni.filter(item => item.id !== id);
    if (this.schema.alumni.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Jadwal CRUD
  public addJadwal(j: Omit<Jadwal, 'id'>): Jadwal {
    const nextId = this.schema.jadwal.reduce((max, item) => item.id > max ? item.id : max, 0) + 1;
    const newItem: Jadwal = { ...j, id: nextId };
    this.schema.jadwal.push(newItem);
    this.save();
    return newItem;
  }

  public updateJadwal(id: number, updated: Partial<Jadwal>): boolean {
    const idx = this.schema.jadwal.findIndex(item => item.id === id);
    if (idx !== -1) {
      this.schema.jadwal[idx] = { ...this.schema.jadwal[idx], ...updated } as Jadwal;
      this.save();
      return true;
    }
    return false;
  }

  public deleteJadwal(id: number): boolean {
    const initialLen = this.schema.jadwal.length;
    this.schema.jadwal = this.schema.jadwal.filter(item => item.id !== id);
    if (this.schema.jadwal.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Admin CRUD & Logs
  public addLog(adminId: number, username: string, aksi: string, modul: string, detail: string, ip: string, ua: string) {
    const nextId = this.schema.admin_log.reduce((max, item) => item.id > max ? item.id : max, 0) + 1;
    const newLog: LogAktivitas = {
      id: nextId,
      admin_id: adminId,
      username,
      aksi,
      modul,
      detail,
      ip_address: ip || '127.0.0.1',
      user_agent: ua || 'Chrome',
      created_at: new Date().toISOString()
    };
    this.schema.admin_log.unshift(newLog); // Put news first
    // Limit log length to 200 items to avoid infinite size
    if (this.schema.admin_log.length > 200) {
      this.schema.admin_log = this.schema.admin_log.slice(0, 200);
    }
    this.save();
  }

  public addAdmin(admin: Omit<AdminAkun, 'id'>): AdminAkun {
    const nextId = this.schema.admin_akun.reduce((max, item) => item.id > max ? item.id : max, 0) + 1;
    const newItem: AdminAkun = { ...admin, id: nextId };
    this.schema.admin_akun.push(newItem);
    this.save();
    return newItem;
  }

  public updateAdmin(id: number, updated: Partial<AdminAkun>): boolean {
    const idx = this.schema.admin_akun.findIndex(item => item.id === id);
    if (idx !== -1) {
      this.schema.admin_akun[idx] = { ...this.schema.admin_akun[idx], ...updated } as AdminAkun;
      this.save();
      return true;
    }
    return false;
  }

  public deleteAdmin(id: number): boolean {
    // Don't delete id 1 superadmin
    if (id === 1) return false;
    const initialLen = this.schema.admin_akun.length;
    this.schema.admin_akun = this.schema.admin_akun.filter(item => item.id !== id);
    if (this.schema.admin_akun.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }
}

export const dbInstance = new JsonDatabase();

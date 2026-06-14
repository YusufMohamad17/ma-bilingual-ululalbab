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
  status: string;
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
  status: string;
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
  detail: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  nama_lengkap: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'OPERATOR' | 'EDITOR';
  foto_url: string;
}

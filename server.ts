import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { 
  dbInstance, 
  hashPassword, 
  generateSalt, 
  Kegiatan, 
  PPDBPendaftar, 
  Guru, 
  Alumni, 
  Jadwal 
} from "./server/db";

// Memory storage for simple session tracking
interface Session {
  token: string;
  adminId: number;
  username: string;
  nama: string;
  role: string;
  expiresAt: number;
}
const activeSessions = new Map<string, Session>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON bodies up to 10MB (for base64 mock image uploads / credentials)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logs helper
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} in ${duration}ms`);
    });
    next();
  });

  // ==========================================
  // PUBLIC API ROUTES
  // ==========================================

  // 1. Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // 2. Settings (Pengaturan)
  app.get("/api/pengaturan", (req, res) => {
    res.json(dbInstance.getPengaturan());
  });

  // 3. Kegiatan (Events)
  app.get("/api/kegiatan", (req, res) => {
    const { kategori } = req.query;
    let list = dbInstance.getKegiatan().filter(item => item.status === 'published');
    if (kategori && typeof kategori === 'string' && kategori !== 'Semua') {
      list = list.filter(item => item.kategori.toLowerCase() === kategori.toLowerCase());
    }
    // Sort by latest event date or creation
    list = [...list].sort((a, b) => new Date(b.tanggal_mulai).getTime() - new Date(a.tanggal_mulai).getTime());
    res.json(list);
  });

  app.get("/api/kegiatan/:slug", (req, res) => {
    const item = dbInstance.getKegiatan().find(k => k.slug === req.params.slug);
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: "Kegiatan tidak ditemukan" });
    }
  });

  // 4. Guru & Staf
  app.get("/api/guru", (req, res) => {
    const list = dbInstance.getGuru().filter(item => item.status === 'aktif');
    res.json(list);
  });

  // 5. Alumni
  app.get("/api/alumni", (req, res) => {
    const list = dbInstance.getAlumni();
    res.json(list);
  });

  // 6. Jadwal Pelajaran (Schedule)
  app.get("/api/jadwal", (req, res) => {
    const { kelas } = req.query;
    let list = dbInstance.getJadwal().filter(item => item.is_aktif);
    if (kelas && typeof kelas === 'string') {
      list = list.filter(item => item.kelas.toLowerCase() === kelas.toLowerCase());
    }
    res.json(list);
  });

  // 7. PPDB: Submit Pendaftaran Baru
  app.post("/api/ppdb/daftar", (req, res) => {
    try {
      const { 
        nama_lengkap, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, agama,
        alamat, kelurahan, kecamatan, kota, provinsi,
        nama_ayah, nama_ibu, pekerjaan_ayah, pekerjaan_ibu, no_hp_ortu, email_ortu,
        asal_sekolah, nilai_rata_rata, tahun_lulus, pilihan_kelas, jalur,
        dokumen_kk, dokumen_akta, dokumen_ijazah, dokumen_foto
      } = req.body;

      if (!nama_lengkap || !nik || !no_hp_ortu) {
        return res.status(400).json({ error: "Nama Lengkap, NIK, dan HP Orang Tua wajib diisi" });
      }

      const pendaftar = dbInstance.addPPDB({
        nama_lengkap, 
        nik, 
        tempat_lahir: tempat_lahir || '', 
        tanggal_lahir: tanggal_lahir || '', 
        jenis_kelamin: jenis_kelamin || 'L', 
        agama: agama || 'Islam',
        alamat: alamat || '', 
        kelurahan: kelurahan || '', 
        kecamatan: kecamatan || '', 
        kota: kota || '', 
        provinsi: provinsi || '',
        nama_ayah: nama_ayah || '', 
        nama_ibu: nama_ibu || '', 
        pekerjaan_ayah: pekerjaan_ayah || '', 
        pekerjaan_ibu: pekerjaan_ibu || '', 
        no_hp_ortu, 
        email_ortu: email_ortu || '',
        asal_sekolah: asal_sekolah || '', 
        nilai_rata_rata: Number(nilai_rata_rata) || 0, 
        tahun_lulus: Number(tahun_lulus) || new Date().getFullYear(), 
        pilihan_kelas: pilihan_kelas || '10-A', 
        jalur: jalur || 'Reguler',
        status: 'pending',
        dokumen_kk: dokumen_kk || '', 
        dokumen_akta: dokumen_akta || '', 
        dokumen_ijazah: dokumen_ijazah || '', 
        dokumen_foto: dokumen_foto || '',
        catatan_admin: 'Data pendaftaran terkirim online.'
      });

      res.status(201).json({ success: true, data: pendaftar });
    } catch (err: any) {
      res.status(500).json({ error: "Gagal menyimpan pendaftaran: " + err.message });
    }
  });

  // 8. PPDB: Cek status pendaftaran (Menggunakan No Pendaftaran ATAU NIK)
  app.get("/api/ppdb/cek/:query", (req, res) => {
    const query = req.params.query.trim().toLowerCase();
    const pendaftar = dbInstance.getPPDB().find(
      p => p.no_pendaftaran.toLowerCase() === query || p.nik.toLowerCase() === query
    );
    if (pendaftar) {
      res.json(pendaftar);
    } else {
      res.status(404).json({ error: "Nomor Pendaftaran atau NIK tidak ditemukan" });
    }
  });

  // ==========================================
  // ADMIN API ROUTES (WITH AUTHENTICATION)
  // ==========================================

  // Admin Login
  app.post("/api/admin/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username dan Password wajib diisi" });
    }

    const admin = dbInstance.getAdmins().find(a => a.username.toLowerCase() === username.trim().toLowerCase());
    if (!admin || !admin.is_aktif) {
      // Return 401 generic error message
      return res.status(401).json({ error: "Username atau password tidak valid" });
    }

    // Hash password & compare
    const computedHash = hashPassword(password, admin.salt);
    if (computedHash !== admin.password_hash) {
      return res.status(401).json({ error: "Username atau password tidak valid" });
    }

    // Session creation
    const token = crypto.randomUUID();
    const session: Session = {
      token,
      adminId: admin.id,
      username: admin.username,
      nama: admin.nama_lengkap,
      role: admin.role,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000 // 8 hours duration
    };
    activeSessions.set(token, session);

    // Audit log
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'Browser';
    dbInstance.addLog(admin.id, admin.username, 'login', 'auth', 'Berhasil masuk ke panel pengelola', ip, ua);

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        nama_lengkap: admin.nama_lengkap,
        role: admin.role,
        foto_url: admin.foto_url
      }
    });
  });

  // Bearer Token verification middleware helper
  function verifyAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Akses ditolak. Sesi tidak valid." });
    }
    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);

    if (!session || session.expiresAt < Date.now()) {
      if (session) activeSessions.delete(token); // Cleanup expired
      return res.status(401).json({ error: "Sesi telah berakhir. Silakan login kembali." });
    }

    // Attach session info to req
    (req as any).session = session;
    next();
  }

  // Check login state
  app.get("/api/admin/auth/me", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    const admin = dbInstance.getAdmins().find(a => a.id === session.adminId);
    if (admin) {
      res.json({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        nama_lengkap: admin.nama_lengkap,
        role: admin.role,
        foto_url: admin.foto_url
      });
    } else {
      res.status(401).json({ error: "User tidak ditemukan" });
    }
  });

  // Admin Logout
  app.post("/api/admin/auth/logout", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    activeSessions.delete(session.token);

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'Browser';
    dbInstance.addLog(session.adminId, session.username, 'logout', 'auth', 'Keluar dari panel pengelola', ip, ua);

    res.json({ success: true, message: "Berhasil keluar" });
  });

  // Update Settings
  app.put("/api/admin/pengaturan", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    if (session.role !== 'SUPERADMIN' && session.role !== 'ADMIN') {
      return res.status(403).json({ error: "Hak akses tidak mencukupi" });
    }

    const updates = req.body;
    for (const [key, val] of Object.entries(updates)) {
      if (typeof val === 'string') {
        dbInstance.updatePengaturan(key, val);
      }
    }

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'Browser';
    dbInstance.addLog(session.adminId, session.username, 'update', 'pengaturan', 'Memperbarui pengaturan website resmi', ip, ua);

    res.json({ success: true, message: "Pengaturan berhasil diperbarui" });
  });

  // Audit Logs for Superadmin
  app.get("/api/admin/logs", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    if (session.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: "Akses dibatasi untuk Superadmin saja." });
    }
    res.json(dbInstance.getLogs());
  });

  // PPDB Management Endpoints (CRUD)
  app.get("/api/admin/ppdb", verifyAdmin, (req, res) => {
    // Simply return all PPDB records or filter
    let list = dbInstance.getPPDB();
    const { search, status, jalur } = req.query;

    if (search && typeof search === 'string') {
      const s = search.toLowerCase();
      list = list.filter(p => p.nama_lengkap.toLowerCase().includes(s) || p.no_pendaftaran.toLowerCase().includes(s) || p.nik.includes(s));
    }
    if (status && typeof status === 'string' && status !== 'Semua') {
      list = list.filter(p => p.status === status.toLowerCase());
    }
    if (jalur && typeof jalur === 'string' && jalur !== 'Semua') {
      list = list.filter(p => p.jalur.toLowerCase() === jalur.toLowerCase());
    }

    res.json(list.sort((a, b) => b.id - a.id));
  });

  app.get("/api/admin/ppdb/stats", verifyAdmin, (req, res) => {
    const list = dbInstance.getPPDB();
    const stats = {
      total: list.length,
      pending: list.filter(p => p.status === 'pending').length,
      verified: list.filter(p => p.status === 'verified').length,
      accepted: list.filter(p => p.status === 'accepted').length,
      rejected: list.filter(p => p.status === 'rejected').length,
      jalurReguler: list.filter(p => p.jalur.toLowerCase() === 'reguler').length,
      jalurPrestasi: list.filter(p => p.jalur.toLowerCase() === 'prestasi').length,
    };
    res.json(stats);
  });

  app.get("/api/admin/ppdb/:id", verifyAdmin, (req, res) => {
    const pId = parseInt(req.params.id);
    const item = dbInstance.getPPDB().find(p => p.id === pId);
    if (!item) {
      return res.status(404).json({ error: "Siswa pendaftar tidak ditemukan" });
    }
    res.json(item);
  });

  app.put("/api/admin/ppdb/:id/status", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    const pId = parseInt(req.params.id);
    const { status, catatan_admin } = req.body;

    if (!['pending', 'verified', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Status pendaftaran salah" });
    }

    const success = dbInstance.updatePPDBStatus(pId, status, catatan_admin);
    if (!success) {
      return res.status(404).json({ error: "Data pendaftar tidak ditemukan" });
    }

    const p = dbInstance.getPPDB().find(item => item.id === pId);
    if (p) {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const ua = req.headers['user-agent'] || 'Browser';
      dbInstance.addLog(session.adminId, session.username, 'update_status', 'ppdb', `Mengubah status pendaftaran ${p.no_pendaftaran} (${p.nama_lengkap}) menjadi ${status.toUpperCase()}`, ip, ua);
    }

    res.json({ success: true, message: "Status pendaftaran diperbarui." });
  });

  app.put("/api/admin/ppdb/:id", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    const pId = parseInt(req.params.id);
    const updated = req.body;

    const success = dbInstance.savePPDBData(pId, updated);
    if (!success) {
      return res.status(404).json({ error: "Data pendaftar tidak ditemukan" });
    }

    const p = dbInstance.getPPDB().find(item => item.id === pId);
    if (p) {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const ua = req.headers['user-agent'] || 'Browser';
      dbInstance.addLog(session.adminId, session.username, 'update_data', 'ppdb', `Mengedit biodata pendaftaran siswa ${p.no_pendaftaran} (${p.nama_lengkap})`, ip, ua);
    }

    res.json({ success: true, message: "Data pendaftaran berhasil diperbarui." });
  });

  app.delete("/api/admin/ppdb/:id", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    if (session.role !== 'SUPERADMIN' && session.role !== 'ADMIN') {
      return res.status(403).json({ error: "Hanya Admin atau Superadmin yang dapat menghapus data." });
    }
    const pId = parseInt(req.params.id);
    const p = dbInstance.getPPDB().find(item => item.id === pId);

    if (p) {
      const success = dbInstance.deletePPDB(pId);
      if (success) {
        const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
        const ua = req.headers['user-agent'] || 'Browser';
        dbInstance.addLog(session.adminId, session.username, 'delete', 'ppdb', `Menghapus pendaftar siswa ${p.no_pendaftaran} (${p.nama_lengkap}) secara permanen`, ip, ua);
        return res.json({ success: true, message: "Data pendaftar berhasil dihapus." });
      }
    }
    res.status(404).json({ error: "Pendaftar tidak ditemukan" });
  });

  // Agenda/Kegiatan Management Endpoints (CRUD)
  app.get("/api/admin/kegiatan", verifyAdmin, (req, res) => {
    res.json(dbInstance.getKegiatan());
  });

  app.post("/api/admin/kegiatan", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    const { judul, deskripsi, konten, kategori, gambar_url, tanggal_mulai, tanggal_selesai, lokasi, status } = req.body;
    
    if (!judul || !kategori || !tanggal_mulai) {
      return res.status(400).json({ error: "Judul, Kategori, dan Tanggal Mulai wajib diisi" });
    }

    // Generate url friendly slug
    const slug = judul.toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(' ')
      .filter((s: string) => s.length > 0)
      .join('-');

    const exists = dbInstance.getKegiatan().some(item => item.slug === slug);
    const finalSlug = exists ? `${slug}-${Date.now()}` : slug;

    const newEvent = dbInstance.addKegiatan({
      judul,
      slug: finalSlug,
      deskripsi: deskripsi || '',
      konten: konten || '',
      kategori: kategori || 'Umum',
      gambar_url: gambar_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=1200',
      tanggal_mulai,
      tanggal_selesai,
      lokasi: lokasi || 'Kampus MA Bilingual Ulul Albab',
      status: status || 'draft'
    });

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'Browser';
    dbInstance.addLog(session.adminId, session.username, 'create', 'kegiatan', `Membuat kegiatan baru: ${judul}`, ip, ua);

    res.status(201).json({ success: true, data: newEvent });
  });

  app.put("/api/admin/kegiatan/:id", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    const id = parseInt(req.params.id);
    const updated = req.body;

    const exists = dbInstance.getKegiatan().find(item => item.id === id);
    if (!exists) {
      return res.status(404).json({ error: "Kegiatan tidak ditemukan" });
    }

    const success = dbInstance.updateKegiatan(id, updated);
    if (success) {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const ua = req.headers['user-agent'] || 'Browser';
      dbInstance.addLog(session.adminId, session.username, 'update', 'kegiatan', `Mengubah info kegiatan: ${exists.judul}`, ip, ua);
      return res.json({ success: true, message: "Info kegiatan sukses disimpan" });
    }
    res.status(500).json({ error: "Gagal menyimpan info kegiatan" });
  });

  app.delete("/api/admin/kegiatan/:id", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    const id = parseInt(req.params.id);
    const exists = dbInstance.getKegiatan().find(item => item.id === id);

    if (exists) {
      const success = dbInstance.deleteKegiatan(id);
      if (success) {
        const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
        const ua = req.headers['user-agent'] || 'Browser';
        dbInstance.addLog(session.adminId, session.username, 'delete', 'kegiatan', `Menghapus kegiatan: ${exists.judul}`, ip, ua);
        return res.json({ success: true, message: "Kegiatan sukses dihapus dari jadwal." });
      }
    }
    res.status(404).json({ error: "Kegiatan tidak ditemukan" });
  });

  // Guru Management (CRUD)
  app.post("/api/admin/guru", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    const { nama, nip, email, no_hp, jabatan, mata_pelajaran, pendidikan, foto_url, status, bio } = req.body;

    if (!nama) {
      return res.status(400).json({ error: "Nama Guru wajib diisi" });
    }

    const newGuru = dbInstance.addGuru({
      nama,
      nip: nip || '',
      email: email || '',
      no_hp: no_hp || '',
      jabatan: jabatan || 'Guru',
      mata_pelajaran: mata_pelajaran || '',
      pendidikan: pendidikan || '',
      foto_url: foto_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      status: status || 'aktif',
      bio: bio || ''
    });

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'Browser';
    dbInstance.addLog(session.adminId, session.username, 'create', 'guru', `Menambah data dewan asatidzah/staf: ${nama}`, ip, ua);

    res.status(201).json({ success: true, data: newGuru });
  });

  app.put("/api/admin/guru/:id", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    const id = parseInt(req.params.id);
    const updated = req.body;

    const exists = dbInstance.getGuru().find(item => item.id === id);
    if (!exists) {
      return res.status(404).json({ error: "Data asatidzah tidak ditemukan" });
    }

    const success = dbInstance.updateGuru(id, updated);
    if (success) {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const ua = req.headers['user-agent'] || 'Browser';
      dbInstance.addLog(session.adminId, session.username, 'update', 'guru', `Mengubah data asatidzah: ${exists.nama}`, ip, ua);
      return res.json({ success: true });
    }
    res.status(500).json({ error: "Gagal menyimpan perubahan" });
  });

  app.delete("/api/admin/guru/:id", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    const id = parseInt(req.params.id);
    const exists = dbInstance.getGuru().find(item => item.id === id);

    if (exists) {
      const success = dbInstance.deleteGuru(id);
      if (success) {
        const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
        const ua = req.headers['user-agent'] || 'Browser';
        dbInstance.addLog(session.adminId, session.username, 'delete', 'guru', `Menghapus asatidzah: ${exists.nama}`, ip, ua);
        return res.json({ success: true });
      }
    }
    res.status(404).json({ error: "Guru tidak ditemukan" });
  });

  // Alumni Management (CRUD)
  app.post("/api/admin/alumni", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    const { nama, tahun_lulus, angkatan, jurusan, karir_sekarang, institusi_sekarang, kota_sekarang, foto_url, linkedin_url, prestasi } = req.body;

    if (!nama) {
      return res.status(400).json({ error: "Nama must be provided" });
    }

    const item = dbInstance.addAlumni({
      nama,
      tahun_lulus: Number(tahun_lulus) || new Date().getFullYear(),
      angkatan: angkatan || '',
      jurusan: jurusan || 'Keagamaan',
      karir_sekarang: karir_sekarang || '',
      institusi_sekarang: institusi_sekarang || '',
      kota_sekarang: kota_sekarang || '',
      foto_url: foto_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      linkedin_url: linkedin_url || '',
      prestasi: prestasi || ''
    });

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'Browser';
    dbInstance.addLog(session.adminId, session.username, 'create', 'alumni', `Menambahkan profil alumni: ${nama}`, ip, ua);

    res.status(201).json({ success: true, data: item });
  });

  app.put("/api/admin/alumni/:id", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    const id = parseInt(req.params.id);
    const updated = req.body;

    const exists = dbInstance.getAlumni().find(item => item.id === id);
    if (!exists) {
      return res.status(404).json({ error: "Profil alumni tidak ditemukan" });
    }

    const success = dbInstance.updateAlumni(id, updated);
    if (success) {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const ua = req.headers['user-agent'] || 'Browser';
      dbInstance.addLog(session.adminId, session.username, 'update', 'alumni', `Mengubah profil alumni: ${exists.nama}`, ip, ua);
      return res.json({ success: true });
    }
    res.status(500).json({ error: "Gagal menyimpan perubahan" });
  });

  app.delete("/api/admin/alumni/:id", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    const id = parseInt(req.params.id);
    const exists = dbInstance.getAlumni().find(item => item.id === id);

    if (exists) {
      const success = dbInstance.deleteAlumni(id);
      if (success) {
        const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
        const ua = req.headers['user-agent'] || 'Browser';
        dbInstance.addLog(session.adminId, session.username, 'delete', 'alumni', `Menghapus profil alumni: ${exists.nama}`, ip, ua);
        return res.json({ success: true });
      }
    }
    res.status(404).json({ error: "Alumni tidak ditemukan" });
  });

  // Jadwal Management (CRUD)
  app.post("/api/admin/jadwal", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    const { hari, jam_ke, jam_mulai, jam_selesai, mata_pelajaran, guru_id, kelas, ruangan, tahun_ajaran, semester } = req.body;

    if (!hari || !mata_pelajaran || !kelas) {
      return res.status(400).json({ error: "Hari, Mapel, dan Kelas wajib diisi." });
    }

    const j = dbInstance.addJadwal({
      hari,
      jam_ke: Number(jam_ke) || 1,
      jam_mulai: jam_mulai || '07:00',
      jam_selesai: jam_selesai || '07:45',
      mata_pelajaran,
      guru_id: Number(guru_id) || 1,
      kelas,
      ruangan: ruangan || 'Ruang Kelas',
      tahun_ajaran: tahun_ajaran || '2025/2026',
      semester: Number(semester) || 1,
      is_aktif: true
    });

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const ua = req.headers['user-agent'] || 'Browser';
    dbInstance.addLog(session.adminId, session.username, 'create', 'jadwal', `Menambah slot jadwal mapel ${mata_pelajaran} kelas ${kelas}`, ip, ua);

    res.status(201).json({ success: true, data: j });
  });

  app.delete("/api/admin/jadwal/:id", verifyAdmin, (req, res) => {
    const session = (req as any).session as Session;
    const id = parseInt(req.params.id);
    const exists = dbInstance.getJadwal().find(item => item.id === id);

    if (exists) {
      const success = dbInstance.deleteJadwal(id);
      if (success) {
        const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
        const ua = req.headers['user-agent'] || 'Browser';
        dbInstance.addLog(session.adminId, session.username, 'delete', 'jadwal', `Menghapus slot jadwal mapel ${exists.mata_pelajaran} hari ${exists.hari} jam ke-${exists.jam_ke}`, ip, ua);
        return res.json({ success: true });
      }
    }
    res.status(404).json({ error: "Jadwal slot tidak ditemukan" });
  });


  // ==========================================
  // VITE / STATIC MIDDWARE SETUP
  // ==========================================
  
  if (process.env.DISABLE_HMR === "true" || process.env.NODE_ENV === "production") {
    // Production serving from compiled build 'dist' directory
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development serving using dynamic vite dev middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  // Listening exclusively on port 3000 as required
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`====================================================`);
    console.log(`  MA Bilingual Ulul Albab Server Active on Port ${PORT}`);
    console.log(`  Development site loading at http://localhost:3000`);
    console.log(`====================================================`);
  });
}

startServer();

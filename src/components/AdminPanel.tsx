import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, GraduationCap, Clock, FileSpreadsheet, Lock, 
  Settings, LogOut, CheckCheck, XCircle, Search, Trash2, Edit, Plus,
  Sliders, ArrowUpRight, ArrowDownLeft, ShieldAlert, BarChart3, HelpCircle 
} from 'lucide-react';
import { PPDBPendaftar, Kegiatan, Guru, Alumni, Jadwal, LogAktivitas } from '../types';

interface AdminPanelProps {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function AdminPanel({ onSuccess, onError }: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [adminUser, setAdminUser] = useState<any>(null);

  // Login form states
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginLdg, setLoginLdg] = useState(false);

  // Active Menu
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'ppdb' | 'kegiatan' | 'guru' | 'jadwal' | 'pengaturan' | 'logs'>('dashboard');

  // Unified lists
  const [ppdbList, setPpdbList] = useState<PPDBPendaftar[]>([]);
  const [eventList, setEventList] = useState<Kegiatan[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [logsList, setLogsList] = useState<LogAktivitas[]>([]);

  // Search & Filter state
  const [ppdbSearch, setPpdbSearch] = useState('');
  const [ppdbStatusFilter, setPpdbStatusFilter] = useState('Semua');
  const [ppdbJalurFilter, setPpdbJalurFilter] = useState('Semua');

  // Selected student for detail review modal
  const [selectedPendaftar, setSelectedPendaftar] = useState<PPDBPendaftar | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'accepted' | 'rejected' | 'verified'>('verified');
  const [reviewCatatan, setReviewCatatan] = useState('');

  // Event Edit / Create Mode States
  const [editingEvent, setEditingEvent] = useState<Partial<Kegiatan> | null>(null);
  const [eventFormMode, setEventFormMode] = useState<'create' | 'edit'>('create');

  // Guru Create / Edit States
  const [editingGuru, setEditingGuru] = useState<Partial<Guru> | null>(null);
  const [guruFormMode, setGuruFormMode] = useState<'create' | 'edit'>('create');

  // Website dynamic settings state
  const [settingsForm, setSettingsForm] = useState({
    nama_madrasah: '',
    tagline: '',
    deskripsi_singkat: '',
    alamat: '',
    telepon: '',
    email: '',
    facebook: '',
    instagram: '',
    youtube: '',
    whatsapp: '',
    ppdb_aktif: 'true',
    ppdb_tahun: '2026/2027',
  });

  // Load stats & lists from APIs
  const fetchAdminData = async (userToken: string) => {
    try {
      const headers = { 'Authorization': `Bearer ${userToken}` };
      
      const [ppdbRes, eventRes, guruRes, jadwalRes, settingsRes, logsRes] = await Promise.all([
        fetch('/api/admin/ppdb', { headers }).then(r => r.json()),
        fetch('/api/admin/kegiatan', { headers }).then(r => r.json()),
        fetch('/api/guru').then(r => r.json()), // public is fine
        fetch('/api/jadwal').then(r => r.json()),
        fetch('/api/pengaturan').then(r => r.json()),
        fetch('/api/admin/logs', { headers }).then(r => {
          if (r.status === 203 || r.status === 403) return []; // skip logs if operator
          return r.json();
        }).catch(() => [])
      ]);

      setPpdbList(ppdbRes || []);
      setEventList(eventRes || []);
      setGuruList(guruRes || []);
      setJadwalList(jadwalRes || []);
      setSettingsForm(settingsRes || {});
      setLogsList(logsRes && Array.isArray(logsRes) ? logsRes : []);
    } catch (err) {
      console.error("Error setting up Admin view data lists:", err);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLdg(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk");
      }
      setIsLoggedIn(true);
      setToken(data.token);
      setAdminUser(data.admin);
      onSuccess(`Selamat Datang, ${data.admin.nama_lengkap}! Masuk sebagai ${data.admin.role}`);
      fetchAdminData(data.token);
    } catch (err: any) {
      onError(err.message || "Username or Password Incorrect");
    } finally {
      setLoginLdg(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {}
    setIsLoggedIn(false);
    setToken('');
    setAdminUser(null);
    onSuccess("Berhasil keluar dari panel pengelola");
  };

  // Status Updater
  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPendaftar) return;
    try {
      const res = await fetch(`/api/admin/ppdb/${selectedPendaftar.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: reviewStatus, catatan_admin: reviewCatatan })
      });
      if (!res.ok) throw new Error("Gagal menyimpan audit pendaftaran");
      
      onSuccess(`Status Pendaftaran ${selectedPendaftar.no_pendaftaran} berhasil diubah!`);
      fetchAdminData(token);
      setSelectedPendaftar(null);
    } catch (err: any) {
      onError(err.message);
    }
  };

  // Delete Pendaftar student permanently
  const handleDeletePendaftar = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data siswa pendaftar ini secara PERMANEN?")) return;
    try {
      const res = await fetch(`/api/admin/ppdb/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus pendaftar");
      onSuccess("Siswa pendaftar berhasil dihapus dari database.");
      fetchAdminData(token);
    } catch (err: any) {
      onError(err.message || "Akses Ditolak");
    }
  };

  // Event Creation/Update
  const handleEventFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      const url = eventFormMode === 'create' ? '/api/admin/kegiatan' : `/api/admin/kegiatan/${editingEvent.id}`;
      const method = eventFormMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingEvent)
      });
      if (!res.ok) throw new Error("Gagal menyimpan info kegiatan/event!");
      onSuccess("Info agenda/event kegiatan sekolah berhasil disimpan.");
      fetchAdminData(token);
      setEditingEvent(null);
    } catch (err: any) {
      onError(err.message);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus agenda kegiatan ini?")) return;
    try {
      const res = await fetch(`/api/admin/kegiatan/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal menghapus kegiatan");
      onSuccess("Kegiatan berhasil dihapus.");
      fetchAdminData(token);
    } catch (err: any) {
      onError(err.message);
    }
  };

  // Guru Creation/Update
  const handleGuruFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuru) return;
    try {
      const url = guruFormMode === 'create' ? '/api/admin/guru' : `/api/admin/guru/${editingGuru.id}`;
      const method = guruFormMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingGuru)
      });
      if (!res.ok) throw new Error("Gagal menyimpan biodata dewan guru");
      onSuccess("Biodata asatidzah/guru berhasil diperbarui.");
      fetchAdminData(token);
      setEditingGuru(null);
    } catch (err: any) {
      onError(err.message);
    }
  };

  const handleDeleteGuru = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus guru ini secara permanen dari daftar asatidzah?")) return;
    try {
      const res = await fetch(`/api/admin/guru/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal menghapus asatidzah");
      onSuccess("Materi asatidzah berhasil dihapus.");
      fetchAdminData(token);
    } catch (err: any) {
      onError(err.message);
    }
  };

  // Change overall website settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/pengaturan', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settingsForm)
      });
      if (!res.ok) throw new Error("Gagal menyimpan konfigurasi.");
      onSuccess("Konfigurasi website resmi madrasah berhasil disimpan!");
      fetchAdminData(token);
    } catch (err: any) {
      onError(err.message);
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    try {
      let headersCol = ["No Daftar", "Nama", "NIK", "Jenis Kelamin", "Asal Sekolah", "Nilai Rata-rata", "Jalur", "Pilihan Jurusan", "Status", "Telepon"];
      let csvContent = "\uFEFF" + headersCol.join(",") + "\n"; // include BOM for excel UTF-8 compatibility

      const filtered = ppdbList.filter(item => {
        const matchesSearch = item.nama_lengkap.toLowerCase().includes(ppdbSearch.toLowerCase()) || item.no_pendaftaran.toLowerCase().includes(ppdbSearch.toLowerCase());
        const matchesStatus = ppdbStatusFilter === 'Semua' || item.status === ppdbStatusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
      });

      filtered.forEach(p => {
        const row = [
          `"${p.no_pendaftaran}"`,
          `"${p.nama_lengkap.replace(/"/g, '""')}"`,
          `"${p.nik}"`,
          `"${p.jenis_kelamin}"`,
          `"${p.asal_sekolah.replace(/"/g, '""')}"`,
          p.nilai_rata_rata,
          `"${p.jalur}"`,
          `"${p.pilihan_kelas}"`,
          `"${p.status.toUpperCase()}"`,
          `"${p.no_hp_ortu}"`
        ];
        csvContent += row.join(",") + "\n";
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `PPDB_ULUL_ALBAB_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onSuccess("Berhasil mengekspor draf CSV PPDB.");
    } catch (err) {
      onError("Ekspor Gagal.");
    }
  };

  // Excel (.xls) pseudo XML mock exporter requested
  const handleExportExcel = () => {
    try {
      const filtered = ppdbList.filter(item => {
        const matchesSearch = item.nama_lengkap.toLowerCase().includes(ppdbSearch.toLowerCase()) || item.no_pendaftaran.toLowerCase().includes(ppdbSearch.toLowerCase());
        const matchesStatus = ppdbStatusFilter === 'Semua' || item.status === ppdbStatusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
      });

      let xml = `<?xml version="1.0" encoding="utf-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1A5C38" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Data PPDB 2026">
  <Table>
   <Row ss:StyleID="HeaderStyle">
    <Cell><Data ss:Type="String">No Pendaftaran</Data></Cell>
    <Cell><Data ss:Type="String">Nama Lengkap</Data></Cell>
    <Cell><Data ss:Type="String">NIK</Data></Cell>
    <Cell><Data ss:Type="String">Jenis Kelamin</Data></Cell>
    <Cell><Data ss:Type="String">Asal Sekolah</Data></Cell>
    <Cell><Data ss:Type="String">Nilai Rapor</Data></Cell>
    <Cell><Data ss:Type="String">Jalur</Data></Cell>
    <Cell><Data ss:Type="String">Kelas Pilihan</Data></Cell>
    <Cell><Data ss:Type="String">Status</Data></Cell>
    <Cell><Data ss:Type="String">No HP Ortu</Data></Cell>
   </Row>`;

      filtered.forEach(p => {
        xml += `\n   <Row>
    <Cell><Data ss:Type="String">${p.no_pendaftaran}</Data></Cell>
    <Cell><Data ss:Type="String">${p.nama_lengkap}</Data></Cell>
    <Cell><Data ss:Type="String">${p.nik}</Data></Cell>
    <Cell><Data ss:Type="String">${p.jenis_kelamin}</Data></Cell>
    <Cell><Data ss:Type="String">${p.asal_sekolah}</Data></Cell>
    <Cell><Data ss:Type="Number">${p.nilai_rata_rata}</Data></Cell>
    <Cell><Data ss:Type="String">${p.jalur}</Data></Cell>
    <Cell><Data ss:Type="String">${p.pilihan_kelas}</Data></Cell>
    <Cell><Data ss:Type="String">${p.status.toUpperCase()}</Data></Cell>
    <Cell><Data ss:Type="String">${p.no_hp_ortu}</Data></Cell>
   </Row>`;
      });

      xml += `\n  </Table>
 </Worksheet>
</Workbook>`;

      const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `PPDB_ULUL_ALBAB_REPORT_${new Date().toISOString().slice(0,10)}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onSuccess("Berhasil mengekspor format SpreadsheetML.");
    } catch (e) {
      onError("Ekspor Excel Gagal.");
    }
  };

  // PPDB filtering logic
  const filteredPPDB = ppdbList.filter(p => {
    const s = ppdbSearch.toLowerCase();
    const matchQuery = p.nama_lengkap.toLowerCase().includes(s) || p.no_pendaftaran.toLowerCase().includes(s) || p.nik.includes(s);
    const matchStatus = ppdbStatusFilter === 'Semua' || p.status === ppdbStatusFilter.toLowerCase();
    const matchJalur = ppdbJalurFilter === 'Semua' || p.jalur === ppdbJalurFilter;
    return matchQuery && matchStatus && matchJalur;
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-900 border-b border-emerald-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 border-2 border-emerald-950 rounded-sm shadow-xl">
          <div className="text-center">
            <span className="w-12 h-12 bg-[#1A5C38] text-[#F5C518] flex items-center justify-center font-bold font-serif-oxford mx-auto text-xl rounded shadow-sm">
              MAB
            </span>
            <h2 className="mt-4 text-center text-2xl font-bold font-serif-oxford text-slate-900 uppercase">
              Panel Pengelola Madrasah
            </h2>
            <p className="mt-1 text-center text-xs text-slate-500">
              Otoritas Terbatas Administrator MA Bilingual Ulul Albab
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Username Admin</label>
                <input
                  type="text"
                  required
                  placeholder="superadmin"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-905 rounded-t-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
              <div className="pt-4">
                <label className="text-xs font-bold text-slate-700 block mb-1">Kata Sandi (Password)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-905 rounded-b-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-[11px] text-slate-500 leading-relaxed italic text-center">
              🔐 Akun standar: <strong>superadmin</strong> & password: <strong>Admin@Madrasah2026</strong>
            </div>

            <div>
              <button
                type="submit"
                disabled={loginLdg}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-sm text-[#1A5C38] bg-[#F5C518] hover:bg-[#E8A800] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F5C518] cursor-pointer"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-emerald-900 group-hover:text-emerald-950" aria-hidden="true" />
                </span>
                {loginLdg ? "Memverifikasi Kunci..." : "Masuk Ke Sistem"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation Panel */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 shrink-0 border-r border-[#1A5C38]">
        <div className="p-5 border-b border-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 bg-emerald-700 text-white font-bold font-serif-oxford flex items-center justify-center rounded">
              MAB
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">PENGELOLA</h2>
              <p className="text-[10px] text-emerald-400 font-mono font-medium">Level: {adminUser?.role}</p>
            </div>
          </div>
        </div>

        {/* User Info card */}
        <div className="p-4 bg-slate-950/45 mx-3 my-4 rounded flex items-center gap-3 border border-slate-800">
          <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0">
            <img src={adminUser?.foto_url} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white truncate max-w-[130px]">{adminUser?.nama_lengkap}</h4>
            <span className="text-[10px] text-slate-500 truncate block max-w-[130px]">{adminUser?.email}</span>
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav className="px-3 space-y-1">
          <button
            onClick={() => setActiveMenu('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
              activeMenu === 'dashboard' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#F5C518]" />
            Dashboard Ringkasan
          </button>

          <button
            onClick={() => setActiveMenu('ppdb')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
              activeMenu === 'ppdb' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-[#F5C518]" />
            Kelola Pendaftaran PPDB
          </button>

          <button
            onClick={() => setActiveMenu('kegiatan')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
              activeMenu === 'kegiatan' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#F5C518]" />
            Kelola Berita & Event
          </button>

          <button
            onClick={() => setActiveMenu('guru')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
              activeMenu === 'guru' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-[#F5C518]" />
            Daftar Tenaga Asatidzah
          </button>

          <button
            onClick={() => setActiveMenu('pengaturan')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
              activeMenu === 'pengaturan' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-[#F5C518]" />
            Pengaturan Website
          </button>

          {adminUser?.role === 'SUPERADMIN' && (
            <button
              onClick={() => setActiveMenu('logs')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                activeMenu === 'logs' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 text-[#F5C518]" />
              Audit Logs Sistem
            </button>
          )}
        </nav>

        {/* Exit button */}
        <div className="absolute bottom-4 left-0 w-64 px-4 hidden md:block">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-2 bg-rose-950/40 hover:bg-rose-900 border border-rose-800 rounded text-rose-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Keluar Panel
          </button>
        </div>
      </aside>

      {/* Main Panel Area */}
      <main className="flex-1 p-6 sm:p-10">
        
        {/* Upper title block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-serif-oxford font-bold text-slate-900 uppercase">
              {activeMenu === 'dashboard' && "PANEL MONITOR UTAMA"}
              {activeMenu === 'ppdb' && "MANAJEMEN SISWA PPDB"}
              {activeMenu === 'kegiatan' && "CRUD KEGIATAN & EVENT"}
              {activeMenu === 'guru' && "REGISTRASI DEWAN ASATIDZAH"}
              {activeMenu === 'pengaturan' && "KONFIGURASI SISTEM INFORMASI"}
              {activeMenu === 'logs' && "AUDIT TRAIL ADMINISTRATOR"}
            </h1>
            <p className="text-xs text-slate-500">
              Selamat datang kembali, {adminUser?.nama_lengkap}. Gunakan panel interaktif ini untuk menilik operasional madrasah.
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-rose-200 hover:bg-rose-50 rounded text-rose-700 bg-white text-xs font-bold cursor-pointer md:hidden self-start"
          >
            Log Out
          </button>
        </div>

        {/* MENU COMPONENT 1: DASHBOARD RINGKASAN */}
        {activeMenu === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats count grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TOTAL DAFTAR PPDB</span>
                  <h3 className="text-3xl font-bold text-slate-900 mt-1">{ppdbList.length}</h3>
                  <span className="text-[10px] text-emerald-700 font-medium font-mono">📅 TA {settingsForm.ppdb_tahun}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded text-emerald-800">
                  <Users className="w-6 h-6 text-[#1A5C38]" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">EVENTS SEKOLAH</span>
                  <h3 className="text-3xl font-bold text-slate-900 mt-1">{eventList.length}</h3>
                  <span className="text-[10px] text-amber-700 font-medium font-mono">📢 Aktif Terbit</span>
                </div>
                <div className="p-3 bg-amber-50 rounded text-amber-850">
                  <Calendar className="w-6 h-6 text-[#E8A800]" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">DEWAN ASATIDZAH</span>
                  <h3 className="text-3xl font-bold text-slate-900 mt-1">{guruList.length}</h3>
                  <span className="text-[10px] text-blue-700 font-medium font-mono">🎓 Guru Aktif</span>
                </div>
                <div className="p-3 bg-blue-50 rounded text-blue-800">
                  <GraduationCap className="w-6 h-6 text-[#1A5C38]" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-sm border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">REGISTRASI PPDB</span>
                  <h3 className="text-lg font-bold text-emerald-900 mt-1">{settingsForm.ppdb_aktif === 'true' ? 'ONLINE AKTIF' : 'TERKUNCI BUKA'}</h3>
                  <span className="text-[9px] text-slate-400">Dapat diatur di Keamanan</span>
                </div>
                <div className="p-3 bg-slate-50 rounded text-slate-800">
                  <Settings className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* Quick Chart distribution & Quick lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Box 1: PPDB Progress Status ratio list */}
              <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-sm">
                <h3 className="font-serif-oxford font-bold text-slate-950 text-base mb-4">Distribusi Kelulusan Registrasi</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-emerald-700">Diterima (Accepted)</span>
                      <span>{ppdbList.filter(p => p.status === 'accepted').length} pendaftar</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-full" 
                        style={{ width: `${(ppdbList.filter(p => p.status === 'accepted').length / (ppdbList.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-amber-700">Menunggu (Verified / Sesi Wawancara)</span>
                      <span>{ppdbList.filter(p => p.status === 'verified').length} pendaftar</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full" 
                        style={{ width: `${(ppdbList.filter(p => p.status === 'verified').length / (ppdbList.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">Baru Terdaftar (Pending)</span>
                      <span>{ppdbList.filter(p => p.status === 'pending').length} pendaftar</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-slate-400 h-full" 
                        style={{ width: `${(ppdbList.filter(p => p.status === 'pending').length / (ppdbList.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-rose-700">Ditolak / Berkas Kurang</span>
                      <span>{ppdbList.filter(p => p.status === 'rejected').length} pendaftar</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full" 
                        style={{ width: `${(ppdbList.filter(p => p.status === 'rejected').length / (ppdbList.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Latest Activity Stream */}
              <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-serif-oxford font-bold text-slate-950 text-base mb-4">Aktivitas Internal Terkini</h3>
                  {logsList.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-6 text-center">Belum ada riwayat audit log tercatat hari ini.</p>
                  ) : (
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {logsList.slice(0, 5).map(log => (
                        <div key={log.id} className="text-xs border-b border-slate-105 pb-2 text-slate-700">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-emerald-800">@{log.username}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{new Date(log.created_at).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-600 leading-tight">{log.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 text-right">
                  <button
                    onClick={() => setActiveMenu('logs')}
                    className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 justify-end ml-auto"
                  >
                    Selengkapnya <ArrowUpRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MENU COMPONENT 2: PPDB MANAGEMENT (Verification table, Export, Delete) */}
        {activeMenu === 'ppdb' && (
          <div className="space-y-6 animate-fade-in bg-white p-6 border border-slate-200 rounded-sm shadow-sm">
            
            {/* Header toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-950 text-white font-bold text-xs rounded-sm flex items-center gap-1 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Export CSV
                </button>
                <button
                  onClick={handleExportExcel}
                  className="px-3 py-1.5 bg-[#F5C518] hover:bg-[#E8A800] text-[#1A5C38] font-bold text-xs rounded-sm flex items-center gap-1 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Export XLS (Excel)
                </button>
              </div>

              {/* Advanced search widget */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nama / NIP / No Reg..."
                    value={ppdbSearch}
                    onChange={(e) => setPpdbSearch(e.target.value)}
                    className="bg-slate-50 border border-slate-300 text-slate-900 pl-8 pr-3 py-1.5 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-44"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <select
                  value={ppdbStatusFilter}
                  onChange={(e) => setPpdbStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-800 px-2 py-1.5 rounded-sm text-xs focus:outline-none"
                >
                  <option value="Semua">Status: Semua</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={ppdbJalurFilter}
                  onChange={(e) => setPpdbJalurFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-800 px-2 py-1.5 rounded-sm text-xs focus:outline-none"
                >
                  <option value="Semua">Jalur: Semua</option>
                  <option value="Reguler">Reguler</option>
                  <option value="Prestasi">Prestasi</option>
                  <option value="Afirmasi">Afirmasi</option>
                </select>
              </div>
            </div>

            {/* Table block */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                    <th className="p-3 border-b">No Daftar</th>
                    <th className="p-3 border-b">Nama Lengkap</th>
                    <th className="p-3 border-b">NIK Siswa</th>
                    <th className="p-3 border-b">Asal Sekolah</th>
                    <th className="p-3 border-b">Rapor</th>
                    <th className="p-3 border-b">Jalur</th>
                    <th className="p-3 border-b">Jurusan</th>
                    <th className="p-3 border-b">Status</th>
                    <th className="p-3 border-b text-center">Aksi / Penilaian</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPPDB.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500 italic">
                        Belum ada data pendaftar yang cocok dengan filter aktif.
                      </td>
                    </tr>
                  ) : (
                    filteredPPDB.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 border-b">
                        <td className="p-3 font-mono font-bold text-[#1A5C38]">{p.no_pendaftaran}</td>
                        <td className="p-3 font-semibold text-slate-900">{p.nama_lengkap}</td>
                        <td className="p-3 font-mono text-slate-500">{p.nik}</td>
                        <td className="p-3 text-slate-650">{p.asal_sekolah}</td>
                        <td className="p-3 font-bold">{p.nilai_rata_rata}</td>
                        <td className="p-3">{p.jalur}</td>
                        <td className="p-3 text-slate-600">{p.pilihan_kelas}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                            p.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                            p.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                            p.status === 'verified' ? 'bg-amber-100 text-amber-850' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedPendaftar(p);
                                setReviewStatus(p.status);
                                setReviewCatatan(p.catatan_admin || '');
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-850 font-bold border rounded-sm"
                            >
                              Tinjau Berkas
                            </button>
                            <button
                              onClick={() => handleDeletePendaftar(p.id)}
                              className="p-1 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded transition-colors"
                              aria-label="Hapus Permanen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Individual detail & status audit modal */}
            {selectedPendaftar && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
                <div className="bg-white border-2 border-emerald-950 max-w-2xl w-full p-6 text-sm rounded shadow-xl max-h-[90vh] overflow-y-auto scrollbar-thin">
                  
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
                    <div>
                      <h3 className="text-xl font-bold font-serif-oxford text-slate-900">Audit & Hasil Verifikasi Pendaftar</h3>
                      <span className="font-mono text-xs text-[#1A5C38] font-bold">{selectedPendaftar.no_pendaftaran}</span>
                    </div>
                    <button onClick={() => setSelectedPendaftar(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs text-slate-700 bg-slate-50 p-4 rounded border">
                    <div>
                      <h4 className="font-bold text-slate-900 border-b pb-1 mb-2">BIODATA SISWA</h4>
                      <p className="mb-1"><strong>Nama Lengkap:</strong> {selectedPendaftar.nama_lengkap}</p>
                      <p className="mb-1"><strong>NIK:</strong> {selectedPendaftar.nik}</p>
                      <p className="mb-1"><strong>L/P:</strong> {selectedPendaftar.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                      <p className="mb-1"><strong>TTL:</strong> {selectedPendaftar.tempat_lahir}, {selectedPendaftar.tanggal_lahir}</p>
                      <p className="mb-1"><strong>Asal Sekolah:</strong> {selectedPendaftar.asal_sekolah}</p>
                      <p className="mb-1"><strong>Alamat:</strong> {selectedPendaftar.alamat}, {selectedPendaftar.kecamatan}, {selectedPendaftar.kota}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 border-b pb-1 mb-2">DATA JALUR & DOKUMEN</h4>
                      <p className="mb-1"><strong>Jalur Pendaftaran:</strong> {selectedPendaftar.jalur}</p>
                      <p className="mb-1"><strong>Pilihan Jurusan:</strong> {selectedPendaftar.pilihan_kelas}</p>
                      <p className="mb-1"><strong>Nilai Rapor:</strong> {selectedPendaftar.nilai_rata_rata}</p>
                      <p className="mb-1"><strong>Telepon Ortu:</strong> {selectedPendaftar.no_hp_ortu}</p>
                      
                      <div className="mt-3 space-y-1">
                        <strong className="block text-slate-900 text-[10px]">VERIFIKASI BERKAS:</strong>
                        <div className="flex gap-2 flex-wrap">
                          <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono">KK: {selectedPendaftar.dokumen_kk ? '✅ Ada' : '❌ Kosong'}</span>
                          <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono">SKL: {selectedPendaftar.dokumen_ijazah ? '✅ Ada' : '❌ Kosong'}</span>
                          <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono">Foto: {selectedPendaftar.dokumen_foto ? '✅ Ada' : '❌ Kosong'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status audit update form */}
                  <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Ubah Status Kelulusan / Berkas *</label>
                      <div className="flex gap-3">
                        {['pending', 'verified', 'accepted', 'rejected'].map(st => (
                          <label key={st} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name="statusReview"
                              value={st}
                              checked={reviewStatus === st}
                              onChange={() => setReviewStatus(st as any)}
                              className="text-emerald-700"
                            />
                            <span className="text-xs uppercase font-bold text-slate-700">{st}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Panitia / Alasan Tolak (Akan tampil pada status pencarian siswa) *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Contoh: Berkas Pas Foto dan SKL memenuhi kriteria. Diterima di kelas 10-A."
                        value={reviewCatatan}
                        onChange={(e) => setReviewCatatan(e.target.value)}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setSelectedPendaftar(null)}
                        className="px-4 py-2 border text-slate-600 hover:text-slate-800 text-xs font-bold rounded-sm"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#1A5C38] hover:bg-emerald-900 text-[#F5C518] font-bold text-xs rounded-sm"
                      >
                        Simpan Evaluasi Berkas
                      </button>
                    </div>
                  </form>

                </div>
              </div>
            )}

          </div>
        )}

        {/* MENU COMPONENT 3: CRUD KEGIATAN & BERITA */}
        {activeMenu === 'kegiatan' && (
          <div className="space-y-6 animate-fade-in bg-white p-6 border border-slate-200 rounded-sm shadow-sm">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-serif-oxford font-bold text-slate-950 text-base">Agenda & Berita Terbit</h3>
              
              <button
                onClick={() => {
                  setEventFormMode('create');
                  setEditingEvent({
                    judul: '',
                    kategori: 'Akademik',
                    deskripsi: '',
                    konten: '',
                    gambar_url: '',
                    tanggal_mulai: '',
                    tanggal_selesai: '',
                    lokasi: '',
                    status: 'published'
                  });
                }}
                className="px-3 py-1.5 bg-[#1A5C38] hover:bg-emerald-905 text-white font-bold text-xs rounded flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Buat Berita Baru
              </button>
            </div>

            {/* List with deletion options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eventList.map(ev => (
                <div key={ev.id} className="p-4 bg-slate-50 border rounded flex justify-between gap-4">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold text-[10px] rounded mb-2">
                      {ev.kategori}
                    </span>
                    <h4 className="font-serif-oxford font-bold text-slate-900 text-sm leading-tight mb-1">{ev.judul}</h4>
                    <span className="text-[10px] text-slate-400 font-mono block">📅 Mula: {new Date(ev.tanggal_mulai).toLocaleDateString()}</span>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">{ev.deskripsi}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEventFormMode('edit');
                        setEditingEvent(ev);
                      }}
                      className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded text-slate-700"
                      aria-label="Edit Agenda"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded border border-rose-200"
                      aria-label="Hapus Agenda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Event Form Modal */}
            {editingEvent && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
                <div className="bg-white border-2 border-emerald-950 max-w-xl w-full p-6 text-sm rounded shadow-xl">
                  
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-lg font-serif-oxford font-bold text-slate-900">
                      {eventFormMode === 'create' ? 'Tulis Agenda Kegiatan Baru' : 'Edit Agenda Terbit'}
                    </h3>
                    <button onClick={() => setEditingEvent(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                  </div>

                  <form onSubmit={handleEventFormSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Judul Agenda / Berita *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Lomba Khotmil Qur'an Santri Akhir"
                        value={editingEvent.judul || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, judul: e.target.value })}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Kegiatan *</label>
                        <select
                          value={editingEvent.kategori || 'Umum'}
                          onChange={(e) => setEditingEvent({ ...editingEvent, kategori: e.target.value })}
                          className="bg-slate-50 border border-slate-355 text-slate-905 p-2 rounded text-xs focus:outline-none w-full"
                        >
                          <option value="Akademik">Akademik</option>
                          <option value="Keagamaan">Keagamaan</option>
                          <option value="Kesenian">Kesenian</option>
                          <option value="Umum">Umum</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Status Publikasi *</label>
                        <select
                          value={editingEvent.status || 'draft'}
                          onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}
                          className="bg-slate-50 border border-slate-355 text-slate-950 p-2 rounded text-xs focus:outline-none w-full"
                        >
                          <option value="published">Terbitkan (Published)</option>
                          <option value="draft">Draf (Draft)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai *</label>
                        <input
                          type="datetime-local"
                          required
                          value={editingEvent.tanggal_mulai ? editingEvent.tanggal_mulai.slice(0, 16) : ''}
                          onChange={(e) => setEditingEvent({ ...editingEvent, tanggal_mulai: new Date(e.target.value).toISOString() })}
                          className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tempat / Lokasi KBM</label>
                        <input
                          type="text"
                          placeholder="Contoh: Aula Serbaguna"
                          value={editingEvent.lokasi || ''}
                          onChange={(e) => setEditingEvent({ ...editingEvent, lokasi: e.target.value })}
                          className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Ringkasan Deskripsi Singkat *</label>
                      <input
                        type="text"
                        required
                        placeholder="Deskripsi satu kalimat untuk grid kartu publik"
                        value={editingEvent.deskripsi || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, deskripsi: e.target.value })}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Konten Lengkap Berita (Mendukung HTML dasar) *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tuliskan detail agenda di sini..."
                        value={editingEvent.konten || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, konten: e.target.value })}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">URL Gambar Agenda</label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={editingEvent.gambar_url || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, gambar_url: e.target.value })}
                        className="bg-slate-50 border border-slate-355 text-slate-900 p-1.5 rounded text-xs w-full"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setEditingEvent(null)}
                        className="px-4 py-2 border text-slate-600 hover:text-slate-850 text-xs font-bold rounded-sm"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#1A5C38] hover:bg-emerald-900 text-white font-bold text-xs rounded-sm"
                      >
                        Simpan Berita
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* MENU COMPONENT 4: GURU & STAF ROSTER */}
        {activeMenu === 'guru' && (
          <div className="space-y-6 animate-fade-in bg-white p-6 border border-slate-200 rounded-sm shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-serif-oxford font-bold text-slate-950 text-base">Dewan Guru & Kepengasuhan Baitullah</h3>
              
              <button
                onClick={() => {
                  setGuruFormMode('create');
                  setEditingGuru({
                    nama: '',
                    nip: '',
                    jabatan: 'Guru',
                    mata_pelajaran: '',
                    pendidikan: '',
                    bio: '',
                    foto_url: '',
                    status: 'aktif'
                  });
                }}
                className="px-3 py-1.5 bg-[#1A5C38] hover:bg-emerald-905 text-white font-bold text-xs rounded flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Guru / Staf
              </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {guruList.map(subGuru => (
                <div key={subGuru.id} className="p-4 bg-slate-50 border rounded flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                    <img src={subGuru.foto_url} alt="Ustadz" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{subGuru.nama}</h4>
                    <span className="text-[10px] text-slate-400 font-mono block">NIP: {subGuru.nip || 'Asatidzah'}</span>
                    <p className="text-[11px] text-emerald-800 font-semibold mt-1 truncate">{subGuru.mata_pelajaran}</p>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 inline-block mt-2">{subGuru.jabatan}</span>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setGuruFormMode('edit');
                        setEditingGuru(subGuru);
                      }}
                      className="p-1 hover:bg-slate-200 rounded text-slate-700"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGuru(subGuru.id)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Guru Form Modal */}
            {editingGuru && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
                <div className="bg-white border-2 border-emerald-950 max-w-lg w-full p-6 text-sm rounded shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-lg font-serif-oxford font-bold text-slate-900">
                      {guruFormMode === 'create' ? 'Inisialisasi Data Guru' : 'Revisi Profil Guru'}
                    </h3>
                    <button onClick={() => setEditingGuru(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                  </div>

                  <form onSubmit={handleGuruFormSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar Akademik *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: ustadz Ahmad Fauzi, Lc."
                        value={editingGuru.nama || ''}
                        onChange={(e) => setEditingGuru({ ...editingGuru, nama: e.target.value })}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">NIP / Kode Asal</label>
                        <input
                          type="text"
                          placeholder="Contoh: 1971..."
                          value={editingGuru.nip || ''}
                          onChange={(e) => setEditingGuru({ ...editingGuru, nip: e.target.value })}
                          className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan Kepengurusan *</label>
                        <input
                          type="text"
                          required
                          placeholder="Waka Kurikulum / Kyai pengasuh"
                          value={editingGuru.jabatan || 'Guru'}
                          onChange={(e) => setEditingGuru({ ...editingGuru, jabatan: e.target.value })}
                          className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Spesialis Bidang Studi *</label>
                        <input
                          type="text"
                          required
                          placeholder="Nahwu Shorof / Kimia Bilingual"
                          value={editingGuru.mata_pelajaran || ''}
                          onChange={(e) => setEditingGuru({ ...editingGuru, mata_pelajaran: e.target.value })}
                          className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Riwayat Pendidikan Terakhir</label>
                        <input
                          type="text"
                          placeholder="S2 UIN Sunan Ampel"
                          value={editingGuru.pendidikan || ''}
                          onChange={(e) => setEditingGuru({ ...editingGuru, pendidikan: e.target.value })}
                          className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Biografi Singkat Asatidzah</label>
                      <textarea
                        rows={3}
                        placeholder="Keahlian, kitab ajaran, atau riwayat pengabdian di luar pondok"
                        value={editingGuru.bio || ''}
                        onChange={(e) => setEditingGuru({ ...editingGuru, bio: e.target.value })}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tautan Foto Profil Guru</label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={editingGuru.foto_url || ''}
                        onChange={(e) => setEditingGuru({ ...editingGuru, foto_url: e.target.value })}
                        className="bg-slate-50 border border-slate-355 text-slate-900 p-1.5 rounded text-xs w-full"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setEditingGuru(null)}
                        className="px-4 py-2 border text-slate-600 hover:text-slate-800 text-xs font-bold rounded-sm"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#1A5C38] hover:bg-emerald-900 text-white font-bold text-xs rounded-sm"
                      >
                        Simpan Asatidzah
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* MENU COMPONENT 5: WEBSITE SETTINGS */}
        {activeMenu === 'pengaturan' && (
          <div className="space-y-6 animate-fade-in bg-white p-6 border border-slate-200 rounded-sm shadow-sm">
            <h3 className="font-serif-oxford font-bold text-slate-950 text-base border-b pb-3">Konfigurasi & Profil Madrasah</h3>
            
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Resmi Madrasah *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.nama_madrasah}
                    onChange={(e) => setSettingsForm({ ...settingsForm, nama_madrasah: e.target.value })}
                    className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Motto / Tagline Pendidikan *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat / Visi Misi *</label>
                <textarea
                  required
                  rows={2}
                  value={settingsForm.deskripsi_singkat}
                  onChange={(e) => setSettingsForm({ ...settingsForm, deskripsi_singkat: e.target.value })}
                  className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telepon Kantor</label>
                  <input
                    type="text"
                    value={settingsForm.telepon}
                    onChange={(e) => setSettingsForm({ ...settingsForm, telepon: e.target.value })}
                    className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Whatsapp CS Ponpes (Kode 62)</label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Kampus Fisik *</label>
                <input
                  type="text"
                  required
                  value={settingsForm.alamat}
                  onChange={(e) => setSettingsForm({ ...settingsForm, alamat: e.target.value })}
                  className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-serif-oxford font-medium text-slate-900 text-sm mb-3">Sosial Media & Integrasi</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={settingsForm.instagram}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                    className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Youtube Channel</label>
                  <input
                    type="text"
                    value={settingsForm.youtube}
                    onChange={(e) => setSettingsForm({ ...settingsForm, youtube: e.target.value })}
                    className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Facebook Fanpage</label>
                  <input
                    type="text"
                    value={settingsForm.facebook}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebook: e.target.value })}
                    className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-serif-oxford font-medium text-slate-900 text-sm mb-3">Status Pintu PPDB Online</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Registrasi PPDB Dibuka ?</label>
                  <select
                    value={settingsForm.ppdb_aktif}
                    onChange={(e) => setSettingsForm({ ...settingsForm, ppdb_aktif: e.target.value })}
                    className="bg-slate-50 border border-slate-355 text-slate-950 p-2 rounded text-xs focus:outline-none w-full"
                  >
                    <option value="true">Buka (Terima Berkas Online)</option>
                    <option value="false">Tutup / Kunci Registrasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Ajaran PPDB</label>
                  <input
                    type="text"
                    value={settingsForm.ppdb_tahun}
                    onChange={(e) => setSettingsForm({ ...settingsForm, ppdb_tahun: e.target.value })}
                    className="bg-slate-50 border border-slate-350 text-slate-900 p-2 rounded text-xs focus:outline-none w-full"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1A5C38] hover:bg-emerald-905 text-[#F5C518] font-bold text-xs rounded shadow-md cursor-pointer"
                >
                  Simpan Seluruh Pengaturan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MENU COMPONENT 6: AUDIT LOGS FOR SUPERADMIN */}
        {activeMenu === 'logs' && adminUser?.role === 'SUPERADMIN' && (
          <div className="space-y-6 animate-fade-in bg-white p-6 border border-slate-200 rounded-sm shadow-sm">
            <h3 className="font-serif-oxford font-bold text-slate-950 text-base border-b pb-3">Riwayat Audit Aktivitas (Audit Trail)</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase">
                    <th className="p-3 border-b">ID</th>
                    <th className="p-3 border-b">Pelaku</th>
                    <th className="p-3 border-b">Aksi</th>
                    <th className="p-3 border-b">Modul</th>
                    <th className="p-3 border-b">Detail Aktivitas</th>
                    <th className="p-3 border-b">IP Address</th>
                    <th className="p-3 border-b">Waktu Logger</th>
                  </tr>
                </thead>
                <tbody>
                  {logsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                        Belum ada data aktivitas terdaftar di log.
                      </td>
                    </tr>
                  ) : (
                    logsList.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 border-b">
                        <td className="p-3 text-slate-400 font-mono">#{log.id}</td>
                        <td className="p-3 font-bold text-emerald-800">@{log.username}</td>
                        <td className="p-3 font-mono text-[10px] uppercase font-bold text-amber-850">{log.aksi}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-500">{log.modul}</td>
                        <td className="p-3 text-slate-700 truncate max-w-xs">{log.detail}</td>
                        <td className="p-3 font-mono text-slate-400">{log.ip_address}</td>
                        <td className="p-3 font-mono text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

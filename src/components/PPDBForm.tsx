import React, { useState, useEffect } from 'react';
import { 
  User, BookOpen, Upload, ClipboardCheck, ArrowRight, ArrowLeft, 
  Search, ShieldAlert, CheckCircle, Printer, Download, Sparkles 
} from 'lucide-react';
import { PPDBPendaftar } from '../types';

interface PPDBFormProps {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function PPDBForm({ onSuccess, onError }: PPDBFormProps) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);

  // Checks/Lookup Status States
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<PPDBPendaftar | null>(null);
  const [lookupError, setLookupError] = useState('');

  // Form State
  const [form, setForm] = useState({
    // Step 1: Personal info
    nama_lengkap: '',
    nik: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L',
    agama: 'Islam',
    alamat: '',
    kelurahan: '',
    kecamatan: '',
    kota: '',
    provinsi: '',
    
    // Step 2: Parents & Academics
    nama_ayah: '',
    nama_ibu: '',
    pekerjaan_ayah: '',
    pekerjaan_ibu: '',
    no_hp_ortu: '',
    email_ortu: '',
    asal_sekolah: '',
    nilai_rata_rata: '0',
    tahun_lulus: '2026',
    pilihan_kelas: '10-A (Unggulan Keagamaan)',
    jalur: 'Reguler',

    // Step 3: Supporting documents (Store simple simulated names or mock base64/placeholders)
    dokumen_kk: '',
    dokumen_akta: '',
    dokumen_ijazah: '',
    dokumen_foto: '',
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ma_ppdb_draft');
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse saved draft:", err);
      }
    }
  }, []);

  // Save to localStorage whenever form data modifications happen
  const updateForm = (field: string, value: any) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    localStorage.setItem('ma_ppdb_draft', JSON.stringify(updated));
  };

  const handleNextStep = () => {
    // Validate current step
    if (activeStep === 1) {
      if (!form.nama_lengkap.trim() || !form.nik.trim()) {
        onError("Silakan lengkapi Nama Lengkap dan NIK terlebih dahulu");
        return;
      }
      if (form.nik.trim().length !== 16) {
        onError("NIK wajib berjumlah 16 digit angka");
        return;
      }
    } else if (activeStep === 2) {
      if (!form.no_hp_ortu.trim() || !form.asal_sekolah.trim()) {
        onError("HP Orang Tua dan Asal Sekolah wajib diisi");
        return;
      }
    }
    setActiveStep((prev) => (prev + 1) as any);
  };

  const handlePrevStep = () => {
    setActiveStep((prev) => (prev - 1) as any);
  };

  // Submit actual online form
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/ppdb/daftar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal mendaftarkan siswa");
      }
      
      onSuccess(`Pendaftaran siswa ${data.data.nama_lengkap} sukses terkirim online!`);
      // Update form context to step 4 with registration details
      setLookupResult(data.data);
      setActiveStep(4);
      // Clear draft storage
      localStorage.removeItem('ma_ppdb_draft');
    } catch (err: any) {
      onError(err.message || "Koneksi Bermasalah. Silakan coba kembali.");
    } finally {
      setSubmitting(false);
    }
  };

  // Status online search
  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setLookupResult(null);
    if (!lookupQuery.trim()) return;

    try {
      const res = await fetch(`/api/ppdb/cek/${encodeURIComponent(lookupQuery.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Nomor pendaftaran tidak terdaftar");
      }
      setLookupResult(data);
      onSuccess("Data pendaftar ditemukan!");
    } catch (err: any) {
      setLookupError("Nomor Pendaftaran atau NIK tidak ditemukan. Harap periksa kembali.");
    }
  };

  // Print Registration PDF Simulator
  const handlePrintCard = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted': return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded font-semibold">Diterima (Accepted)</span>;
      case 'rejected': return <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded font-semibold">Ditolak (Rejected)</span>;
      case 'verified': return <span className="bg-amber-100 text-amber-850 text-xs px-2.5 py-1 rounded font-semibold">Berkas Terverifikasi</span>;
      default: return <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded font-semibold">Pending (Sedang Diproses)</span>;
    }
  };

  return (
    <section id="ppdb-section" className="py-16 bg-slate-50 border-b border-slate-100">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Context guidelines and Status Checking API */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="text-emerald-700 tracking-widest text-xs uppercase font-bold inline-block mb-1">REGISTRASI ONLINE</span>
              <h2 className="text-3xl sm:text-4xl font-serif-oxford font-semibold text-slate-900 mb-6 leading-tight">
                PPDB Online <br/>MA Bilingual Ulul Albab
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-8">
                Selamat datang di halaman resmi pendaftaran peserta didik baru. Silakan lengkapi biodata calon santri secara teliti melalui formulir multi-langkah interaktif di sebelah kanan dan unggah salinan dokumen yang diperlukan.
              </p>

              {/* Oxford-style timeline instructions */}
              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#1A5C38] text-[#F5C518] flex items-center justify-center font-bold font-serif-oxford shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Pengisian Biodata</h4>
                    <p className="text-xs text-slate-500">Isi NIK, Nama, asatidzah pondok pilihan kelas, dan biodata orang tua wali.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#1A5C38] text-[#F5C518] flex items-center justify-center font-bold font-serif-oxford shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Unggah Dokumen Berkas</h4>
                    <p className="text-xs text-slate-500">Unggah foto KK, akta kelahiran, ijazah / SKL, dan Pas Foto Berwarna 3x4.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#1A5C38] text-[#F5C518] flex items-center justify-center font-bold font-serif-oxford shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Unduh Kartu Ujian Masuk</h4>
                    <p className="text-xs text-slate-500">Gunakan ID registrasi untuk mengunduh kartu ujian dan panduan tes lisan pesantren.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Live Search / Query Student Status Panel */}
            <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-sm mt-4">
              <h3 className="font-serif-oxford font-bold text-slate-950 text-lg mb-2 flex items-center gap-2">
                <Search className="w-5 h-5 text-[#F5C518]" />
                Cek Status Kelulusan / Berkas
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Sudah mendaftar sebelumnya? Ketikkan NIK Calon Siswa atau 12 Digit Nomor Pendaftaran Anda untuk memeriksa hasil verifikasi dari administrator.
              </p>
              
              <form onSubmit={handleCheckStatus} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Contoh: PPD-2026-0001 atau NIK"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-[#F5C518] font-bold text-xs px-4 py-2 hover:shadow-md transition-all rounded-sm shrink-0"
                >
                  Cari
                </button>
              </form>

              {lookupError && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded flex gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}

              {lookupResult && (
                <div className="mt-3 p-4 bg-emerald-50/50 border border-emerald-150 rounded text-xs text-slate-700 animate-fade-in">
                  <div className="flex justify-between items-start border-b border-emerald-250 pb-2 mb-2">
                    <div>
                      <strong className="block text-[#1A5C38]">{lookupResult.nama_lengkap}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">{lookupResult.no_pendaftaran}</span>
                    </div>
                    {getStatusBadge(lookupResult.status)}
                  </div>
                  <div className="space-y-1 text-[11px] mb-3">
                    <p><strong>Pilihan Kelas:</strong> {lookupResult.pilihan_kelas}</p>
                    <p><strong>Asal Sekolah:</strong> {lookupResult.asal_sekolah}</p>
                    <p><strong>Jalur Pendaftaran:</strong> {lookupResult.jalur}</p>
                    {lookupResult.catatan_admin && (
                      <p className="p-2 bg-white rounded border border-slate-200 text-slate-600 mt-2 font-serif italic">
                        <strong>Catatan Panitia:</strong> "{lookupResult.catatan_admin}"
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      // Trigger mock printable view
                      setActiveStep(4);
                    }}
                    className="flex items-center gap-1.5 text-emerald-800 font-bold hover:underline"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak Ulang Kartu Pendaftaran
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Multi-Step Interactive Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 border border-slate-200 rounded-sm shadow-sm">
            
            {/* Step navigation indicator */}
            {activeStep < 4 && (
              <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-[#1A5C38] font-bold text-sm">Langkah {activeStep} dari 3</span>
                  <div className="flex items-center gap-1">
                    <div className={`h-1.5 rounded-full transition-all ${activeStep >= 1 ? 'w-6 bg-emerald-700' : 'w-2 bg-slate-200'}`} />
                    <div className={`h-1.5 rounded-full transition-all ${activeStep >= 2 ? 'w-6 bg-emerald-700' : 'w-2 bg-slate-200'}`} />
                    <div className={`h-1.5 rounded-full transition-all ${activeStep >= 3 ? 'w-6 bg-emerald-700' : 'w-2 bg-slate-200'}`} />
                  </div>
                </div>
                <div className="text-xs text-slate-400 italic">Simpan draf aktif otomatis</div>
              </div>
            )}

            {/* Step 1: Data Diri */}
            {activeStep === 1 && (
              <div className="animate-fade-in">
                <h3 className="font-serif-oxford font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                  <User className="text-[#F5C518]" />
                  Biodata Diri Calon Santri
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NAMA LENGKAP (Sesuai Ijazah SD/MI) *</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={form.nama_lengkap}
                      onChange={(e) => updateForm('nama_lengkap', e.target.value)}
                      className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">NIK (Nomor Induk Kependudukan) *</label>
                      <input
                        type="text"
                        maxLength={16}
                        placeholder="16 digit angka KK"
                        value={form.nik}
                        onChange={(e) => updateForm('nik', e.target.value.replace(/\D/g, ''))}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">JENIS KELAMIN *</label>
                      <select
                        value={form.jenis_kelamin}
                        onChange={(e) => updateForm('jenis_kelamin', e.target.value)}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                      >
                        <option value="L">Laki-laki (Santri Putra)</option>
                        <option value="P">Perempuan (Santri Putri)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">TEMPAT LAHIR</label>
                      <input
                        type="text"
                        placeholder="Contoh: Nganjuk"
                        value={form.tempat_lahir}
                        onChange={(e) => updateForm('tempat_lahir', e.target.value)}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">TANGGAL LAHIR</label>
                      <input
                        type="date"
                        value={form.tanggal_lahir}
                        onChange={(e) => updateForm('tanggal_lahir', e.target.value)}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ALAMAT LENGKAP (RT/RW, No. Rumah) *</label>
                    <textarea
                      rows={2}
                      placeholder="Tuliskan nama jalan dan RT/RW"
                      value={form.alamat}
                      onChange={(e) => updateForm('alamat', e.target.value)}
                      className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">KELURAHAN</label>
                      <input
                        type="text"
                        placeholder="Kelutan"
                        value={form.kelurahan}
                        onChange={(e) => updateForm('kelurahan', e.target.value)}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">KECAMATAN</label>
                      <input
                        type="text"
                        placeholder="Ngronggot"
                        value={form.kecamatan}
                        onChange={(e) => updateForm('kecamatan', e.target.value)}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">KOTA/KABUPATEN</label>
                      <input
                        type="text"
                        placeholder="Nganjuk"
                        value={form.kota}
                        onChange={(e) => updateForm('kota', e.target.value)}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">PROVINSI</label>
                      <input
                        type="text"
                        placeholder="Jawa Timur"
                        value={form.provinsi}
                        onChange={(e) => updateForm('provinsi', e.target.value)}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-[#1A5C38] hover:bg-emerald-900 text-white font-bold text-sm rounded-sm flex items-center gap-2"
                  >
                    Lanjutkan
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Parents & Academics */}
            {activeStep === 2 && (
              <div className="animate-fade-in">
                <h3 className="font-serif-oxford font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                  <BookOpen className="text-[#F5C518]" />
                  Orang Tua, Jalur & Akademik
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">NAMA LENGKAP AYAH</label>
                      <input
                        type="text"
                        placeholder="Nama Ayah"
                        value={form.nama_ayah}
                        onChange={(e) => updateForm('nama_ayah', e.target.value)}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">NAMA LENGKAP IBU</label>
                      <input
                        type="text"
                        placeholder="Nama Ibu"
                        value={form.nama_ibu}
                        onChange={(e) => updateForm('nama_ibu', e.target.value)}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">NO. TELEPON / WA WALI *</label>
                      <input
                        type="tel"
                        placeholder="Contoh: 08123456789"
                        value={form.no_hp_ortu}
                        onChange={(e) => updateForm('no_hp_ortu', e.target.value)}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">EMAIL ORANG TUA / WALI</label>
                      <input
                        type="email"
                        placeholder="nama@domain.com"
                        value={form.email_ortu}
                        onChange={(e) => updateForm('email_ortu', e.target.value)}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <h4 className="font-serif-oxford font-medium text-slate-900 text-sm mb-3">Informasi Asal Sekolah & Jalur Pendaftaran</h4>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">SEKOLAH ASAL (SMP / MTs) *</label>
                    <input
                      type="text"
                      placeholder="Contoh: MTsN 1 Nganjuk"
                      value={form.asal_sekolah}
                      onChange={(e) => updateForm('asal_sekolah', e.target.value)}
                      className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">NILAI RATA-RATA RAPOR SEMESTER 1-5</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Contoh: 88.50"
                        value={form.nilai_rata_rata}
                        onChange={(e) => updateForm('nilai_rata_rata', e.target.value)}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">JALUR PENDAFTARAN *</label>
                      <select
                        value={form.jalur}
                        onChange={(e) => updateForm('jalur', e.target.value)}
                        className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                      >
                        <option value="Reguler">Reguler</option>
                        <option value="Prestasi">Prestasi (Rapor / Non-Akademis)</option>
                        <option value="Afirmasi">Kemitraan Alumni / Pondok</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">PILIHAN JURUSAN & KELAS *</label>
                    <select
                      value={form.pilihan_kelas}
                      onChange={(e) => updateForm('pilihan_kelas', e.target.value)}
                      className="bg-slate-50 border border-slate-350 text-slate-900 p-2.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full"
                    >
                      <option value="10-A (Unggulan Keagamaan)">10-A (Unggulan Keagamaan)</option>
                      <option value="10-B (MIPA Bilingual)">10-B (MIPA Bilingual)</option>
                      <option value="10-C (IPS Bilingual)">10-C (IPS Bilingual)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={handlePrevStep}
                    className="px-5 py-3 border border-slate-300 text-slate-600 hover:text-slate-800 font-bold text-sm rounded-sm flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Sebelumnya
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-[#1A5C38] hover:bg-emerald-900 text-white font-bold text-sm rounded-sm flex items-center gap-2"
                  >
                    Lanjutkan
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Supporting documents simulator (stores descriptive path or mocks data string) */}
            {activeStep === 3 && (
              <form onSubmit={handleSubmitRegistration} className="animate-fade-in">
                <h3 className="font-serif-oxford font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                  <Upload className="text-[#F5C518]" />
                  Simulasi Unggah Berkas & Pas Foto
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Unggah berkas untuk keperluan verifikasi. Format yang diizinkan adalah JPG, PNG, atau PDF. Maksimal 5MB per dokumen. Sifat simulasi file, Anda dapat menginput nama file / mengklik area.
                </p>

                <div className="space-y-4">
                  {/* Photo 3x4 */}
                  <div className="p-4 border border-dashed border-slate-300 hover:border-emerald-700 rounded bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <strong className="block text-xs text-slate-700">PAS FOTO BERWARNA 3X4 *</strong>
                      <span className="text-[10px] text-slate-400">Harus formal bernuansa putih/merah</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Nama file / URL"
                        value={form.dokumen_foto}
                        onChange={(e) => updateForm('dokumen_foto', e.target.value)}
                        className="bg-white border border-slate-350 text-slate-900 p-1.5 rounded text-xs focus:outline-none w-44"
                      />
                      <button
                        type="button"
                        onClick={() => updateForm('dokumen_foto', `PasFoto_${form.nama_lengkap.replace(/\s+/g, '_')}.png`)}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded"
                      >
                        Simulasi Pilih
                      </button>
                    </div>
                  </div>

                  {/* KK */}
                  <div className="p-4 border border-dashed border-slate-300 hover:border-emerald-700 rounded bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <strong className="block text-xs text-slate-700">KARTU KELUARGA (KK) *</strong>
                      <span className="text-[10px] text-slate-400">Salinan digital KK terbaru asli</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Nama file / URL"
                        value={form.dokumen_kk}
                        onChange={(e) => updateForm('dokumen_kk', e.target.value)}
                        className="bg-white border border-slate-350 text-slate-900 p-1.5 rounded text-xs focus:outline-none w-44"
                      />
                      <button
                        type="button"
                        onClick={() => updateForm('dokumen_kk', `KK_${form.nik}.pdf`)}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded"
                      >
                        Simulasi Pilih
                      </button>
                    </div>
                  </div>

                  {/* Ijazah */}
                  <div className="p-4 border border-dashed border-slate-300 hover:border-emerald-700 rounded bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <strong className="block text-xs text-slate-700">IJAZAH / SKL (Surat Keterangan Lulus)</strong>
                      <span className="text-[10px] text-slate-400">Gunakan SKL sementara jika ijazah resmi belum terbit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Nama file / URL"
                        value={form.dokumen_ijazah}
                        onChange={(e) => updateForm('dokumen_ijazah', e.target.value)}
                        className="bg-white border border-slate-350 text-slate-900 p-1.5 rounded text-xs focus:outline-none w-44"
                      />
                      <button
                        type="button"
                        onClick={() => updateForm('dokumen_ijazah', `SKL_SD_MI_${form.nama_lengkap.replace(/\s+/g, '_')}.pdf`)}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded"
                      >
                        Simulasi Pilih
                      </button>
                    </div>
                  </div>
                </div>

                {/* Consent lock */}
                <div className="mt-6 p-3 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed rounded flex items-start gap-2">
                  <input type="checkbox" required className="mt-0.5" id="consent-check" />
                  <label htmlFor="consent-check" className="cursor-pointer select-none">
                    Saya menyatakan secara sadar bahwa seluruh biodata dan berkas dokumen pendaftaran yang diisikan adalah benar berdasarkan undang-undang hukum kependudukan RI.
                  </label>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-3 border border-slate-300 text-slate-600 hover:text-slate-800 font-bold text-sm rounded-sm flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Sebelumnya
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-[#1A5C38] hover:bg-emerald-900 text-[#F5C518] font-bold text-sm rounded-sm flex items-center gap-2 shadow-md transition-colors"
                  >
                    {submitting ? 'Mengirim Data...' : 'Kirim Pendaftaran Online'}
                    <ClipboardCheck className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 4: Final Screen - Print card & next instructions */}
            {activeStep === 4 && lookupResult && (
              <div className="animate-fade-in text-center py-6">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-serif-oxford font-bold text-slate-900 text-2xl mb-1">Pendaftaran Online Sukses!</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                  Silakan unduh atau cetak secara resmi tanda terima registrasi Anda. Harap bawa kartu ini saat pelaksanaan seleksi wawancara kepesantrenan.
                </p>

                {/* Printable card preview (styled according to Oxford Half A4 format requested) */}
                <div id="printable-registration-card" className="border-2 border-emerald-900 p-6 bg-white max-w-md mx-auto text-left shadow-sm rounded mb-8 relative">
                  
                  {/* Card mini-header */}
                  <div className="flex items-center gap-3 border-b-2 border-emerald-900 pb-3 mb-4">
                    <div className="w-10 h-10 bg-[#1A5C38] text-[#F5C518] flex items-center justify-center font-bold font-serif-oxford rounded-sm shrink-0">
                      MAB
                    </div>
                    <div>
                      <h4 className="font-font-serif-oxford font-bold text-xs text-emerald-950 uppercase">KARTU PENDAFTARAN PPDB ONLINE</h4>
                      <p className="text-[9px] text-[#1A5C38] font-semibold tracking-wider font-mono">MA BILINGUAL ULUL ALBAB TA 2026/2027</p>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="grid grid-cols-12 gap-4">
                    {/* Simulated Student Mini Passport Photo */}
                    <div className="col-span-4 flex flex-col items-center justify-center">
                      <div className="w-24 h-28 border border-slate-350 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-mono text-center relative overflow-hidden">
                        {lookupResult.dokumen_foto ? (
                          <img 
                            src={lookupResult.dokumen_foto} 
                            alt="Pas Foto Santri" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // If image loading fails, show elegant fallback initials
                              const el = e.target as HTMLImageElement;
                              el.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <span className="absolute">Pas Foto<br/>3x4</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold mt-2 font-mono">{lookupResult.jalur.toUpperCase()}</span>
                    </div>

                    {/* Details column */}
                    <div className="col-span-8 space-y-1.5 text-xs text-slate-800">
                      <p><strong className="block text-[10px] text-slate-400">NOMOR PENDAFTARAN</strong> <span className="font-mono text-emerald-900 font-bold text-sm tracking-wider">{lookupResult.no_pendaftaran}</span></p>
                      <p><strong className="block text-[10px] text-slate-400">NAMA LENGKAP</strong> {lookupResult.nama_lengkap}</p>
                      <p><strong className="block text-[10px] text-slate-400">NIK SISWA</strong> <span className="font-mono">{lookupResult.nik}</span></p>
                      <p><strong className="block text-[10px] text-slate-400">SEKOLAH ASAL</strong> {lookupResult.asal_sekolah}</p>
                      <p><strong className="block text-[10px] text-slate-400">JURUSAN</strong> {lookupResult.pilihan_kelas}</p>
                    </div>
                  </div>

                  {/* QR code and validation footer block */}
                  <div className="border-t border-dashed border-slate-300 pt-4 mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-[#1A5C38] leading-tight font-light font-serif italic">
                        "Membentuk Generasi Berilmu,<br/>Berakhlak, dan Berprestasi"
                      </p>
                      <span className="bg-amber-100 text-amber-850 text-[10px] px-2 py-0.5 rounded font-bold inline-block mt-2 font-mono">
                        STATUS: {lookupResult.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Mock QR Code block */}
                    <div className="w-14 h-14 bg-slate-100 border border-slate-300 p-0.5 flex flex-col items-center justify-center">
                      {/* Generates a simple mock representation */}
                      <div className="grid grid-cols-3 gap-0.5 w-full h-full p-1 bg-slate-900 rounded-xs">
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-slate-900"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-slate-900"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-slate-900"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-slate-900"></div>
                        <div className="bg-white rounded-xs"></div>
                      </div>
                      <span className="text-[7px] text-slate-400 font-mono mt-0.5">SCAN VERIFY</span>
                    </div>
                  </div>
                </div>

                {/* Print button / controls */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handlePrintCard}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-[#F5C518] font-bold text-xs tracking-wide rounded-sm flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Cetak Tanda Daftar
                  </button>
                  <button
                    onClick={() => {
                      // Reset to empty form
                      setActiveStep(1);
                      setLookupResult(null);
                      setForm({
                        nama_lengkap: '',
                        nik: '',
                        tempat_lahir: '',
                        tanggal_lahir: '',
                        jenis_kelamin: 'L',
                        agama: 'Islam',
                        alamat: '',
                        kelurahan: '',
                        kecamatan: '',
                        kota: '',
                        provinsi: '',
                        nama_ayah: '',
                        nama_ibu: '',
                        pekerjaan_ayah: '',
                        pekerjaan_ibu: '',
                        no_hp_ortu: '',
                        email_ortu: '',
                        asal_sekolah: '',
                        nilai_rata_rata: '0',
                        tahun_lulus: '2026',
                        pilihan_kelas: '10-A (Unggulan Keagamaan)',
                        jalur: 'Reguler',
                        dokumen_kk: '',
                        dokumen_akta: '',
                        dokumen_ijazah: '',
                        dokumen_foto: '',
                      });
                    }}
                    className="px-5 py-2.5 border border-slate-350 hover:bg-slate-50 text-slate-700 font-bold text-xs tracking-wide rounded-sm flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    Daftarkan Siswa Lain
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, Download, Award, ShieldAlert } from 'lucide-react';
import { Jadwal, Guru } from '../types';

interface AkademikSecProps {
  initialClasses: string[];
}

export default function AkademikSec({ initialClasses }: AkademikSecProps) {
  const [activeTab, setActiveTab] = useState<'kurikulum' | 'jadwal' | 'kalender'>('kurikulum');
  const [kelasSelected, setKelasSelected] = useState<string>('10-A');
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [teachers, setTeachers] = useState<Guru[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Fetch schedule based on selected class
  useEffect(() => {
    if (activeTab === 'jadwal') {
      setLoadingSchedule(true);
      Promise.all([
        fetch(`/api/jadwal?kelas=${encodeURIComponent(kelasSelected)}`).then(res => res.json()),
        fetch('/api/guru').then(res => res.json())
      ])
        .then(([jadwalData, guruData]) => {
          setJadwalList(jadwalData);
          setTeachers(guruData);
        })
        .catch(err => console.error("Error loading schedule tabs:", err))
        .finally(() => setLoadingSchedule(false));
    }
  }, [activeTab, kelasSelected]);

  const mapGuruName = (guruId: number) => {
    const found = teachers.find(t => t.id === guruId);
    return found ? found.nama : 'Ustadz / Ustadzah';
  };

  return (
    <section id="akademik-section" className="py-16 bg-white border-b border-slate-100">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Title decorative Oxford Style */}
        <div className="text-center mb-12">
          <span className="text-emerald-700 tracking-widest text-xs uppercase font-bold inline-block mb-1">PROGRAM PENDIDIKAN</span>
          <h2 className="text-3xl sm:text-4xl font-serif-oxford font-semibold text-slate-900 relative inline-block pb-3">
            Akademik & Kurikulum
            <span className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-[#F5C518]"></span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto mt-4 text-sm font-light">
            Menumbuhkan kearifan akademis modern yang berlandaskan tradisi pesantren luhur madrasatul qur'an wal lughah.
          </p>
        </div>

        {/* Oxford Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto justify-center scrollbar-none">
          <button
            onClick={() => setActiveTab('kurikulum')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors shrink-0 ${
              activeTab === 'kurikulum'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#F5C518]" />
            Program Kurikulum
          </button>
          
          <button
            onClick={() => setActiveTab('jadwal')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors shrink-0 ${
              activeTab === 'jadwal'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <Clock className="w-4 h-4 text-[#F5C518]" />
            Jadwal Mingguan
          </button>

          <button
            onClick={() => setActiveTab('kalender')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors shrink-0 ${
              activeTab === 'kalender'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#F5C518]" />
            Kalender Akademik
          </button>
        </div>

        {/* Tab Content 1: Kurikulum */}
        {activeTab === 'kurikulum' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
            {/* Keagamaan */}
            <div className="p-6 border border-slate-100 rounded-sm hover:shadow-md transition-shadow bg-slate-50">
              <div className="w-12 h-12 bg-emerald-100 flex items-center justify-center text-emerald-800 mb-4 rounded-sm">
                <Award className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-serif-oxford font-bold text-slate-900 mb-2">Unggulan Dirasah Islamiyah</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Pendalaman terstruktur Kitab Kuning (Tafsir, Fiqih, Ushul Fiqih, Nahwu & Shorof) berlandaskan program Tahfidzul Qur’an intensif berpola mutqin.
              </p>
              <ul className="text-xs text-slate-500 space-y-1 bg-white p-3 rounded border border-slate-100">
                <li>• Halaqah Tahfidz Bakda Shubuh</li>
                <li>• Madrasah Diniyah sore hari</li>
                <li>• Sertifikasi Sanad Riwayah</li>
              </ul>
            </div>

            {/* Bilingual */}
            <div className="p-6 border border-slate-100 rounded-sm hover:shadow-md transition-shadow bg-slate-50">
              <div className="w-12 h-12 bg-amber-100 flex items-center justify-center text-amber-800 mb-4 rounded-sm">
                <BookOpen className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-serif-oxford font-bold text-slate-900 mb-2">Dual Language Strategy</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Penyampaian materi sains (Kimia, Fisika, Biologi, Matematika) bilingual Arab-Inggris sejalan dengan kurikulum nasional berkualitas teruji.
              </p>
              <ul className="text-xs text-slate-500 space-y-1 bg-white p-3 rounded border border-slate-100">
                <li>• Arabic & English speaking environment</li>
                <li>• English & Arabic Debate Club</li>
                <li>• TOEFL & TOAFL preparation</li>
              </ul>
            </div>

            {/* Riset & IPTEK */}
            <div className="p-6 border border-slate-100 rounded-sm hover:shadow-md transition-shadow bg-slate-50">
              <div className="w-12 h-12 bg-blue-100 flex items-center justify-center text-blue-800 mb-4 rounded-sm">
                <Calendar className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-serif-oxford font-bold text-slate-900 mb-2">Sains & Riset Terintegrasi</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Laboratorium multimedia mumpuni untuk praktek ilmiah, bimbingan olimpiade sains (OSN), serta Karya Ilmiah Remaja (KIR) berbasis pesantren.
              </p>
              <ul className="text-xs text-slate-500 space-y-1 bg-white p-3 rounded border border-slate-100">
                <li>• Fasilitas Laboratorium Kimia Fisika</li>
                <li>• Pembinaan intensif KSM & OSN</li>
                <li>• Pengabdian Masyarakat santri akhir</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab Content 2: Jadwal Pelajaran */}
        {activeTab === 'jadwal' && (
          <div className="bg-slate-50 p-6 border border-slate-100 rounded-sm animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <label htmlFor="select-kelas" className="text-sm font-semibold text-slate-700">Pilih Kelas:</label>
                <select
                  id="select-kelas"
                  value={kelasSelected}
                  onChange={(e) => setKelasSelected(e.target.value)}
                  className="bg-white border border-slate-350 text-slate-800 px-3 py-1.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="10-A">10-A (Unggulan Keagamaan)</option>
                  <option value="10-B">10-B (MIPA Bilingual)</option>
                  <option value="10-C">10-C (IPS Bilingual)</option>
                </select>
              </div>

              {/* Informative live time badge */}
              <div className="text-xs text-[#1A5C38] font-mono bg-emerald-50 px-3 py-1 border border-emerald-200">
                ⭐ Kurikulum Aktif Semester Genap TA 2025/2026
              </div>
            </div>

            {loadingSchedule ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                Memuat data jadwal pelajaran asatidzah...
              </div>
            ) : jadwalList.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                <ShieldAlert className="w-8 h-8 text-slate-300" />
                <span>Belum ada jadwal mingguan terdaftar untuk kelas ini.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse bg-white shadow-sm text-sm">
                  <thead>
                    <tr className="bg-emerald-900 text-white font-serif-oxford">
                      <th className="p-3 border border-emerald-950">Hari</th>
                      <th className="p-3 border border-emerald-950">Jam Ke</th>
                      <th className="p-3 border border-emerald-950">Waktu</th>
                      <th className="p-3 border border-emerald-950">Mata Pelajaran</th>
                      <th className="p-3 border border-emerald-950">Guru Pengampu (Asatidzah)</th>
                      <th className="p-3 border border-emerald-950">Ruangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jadwalList.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? "bg-white hover:bg-emerald-50/30" : "bg-slate-50 hover:bg-emerald-50/30"}>
                        <td className="p-3 border border-slate-200 font-semibold">{item.hari}</td>
                        <td className="p-3 border border-slate-200 text-center">{item.jam_ke}</td>
                        <td className="p-3 border border-slate-200 font-mono text-xs">{item.jam_mulai} - {item.jam_selesai}</td>
                        <td className="p-3 border border-slate-200 font-medium text-emerald-900">{item.mata_pelajaran}</td>
                        <td className="p-3 border border-slate-200 text-slate-600">{mapGuruName(item.guru_id)}</td>
                        <td className="p-3 border border-slate-200 text-xs bg-slate-100/55">{item.ruangan || 'R. Abu Bakar'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: Kalender Akademik */}
        {activeTab === 'kalender' && (
          <div className="bg-slate-50 p-6 border border-slate-100 rounded-sm animate-fade-in flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=800"
                alt="Kalender Akademik MA Bilingual"
                className="w-full h-auto rounded-sm border border-slate-200 shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="md:w-1/2">
              <h3 className="text-2xl font-serif-oxford font-bold text-slate-900 mb-4">Agenda Pembelajaran Aktif</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Rencana pembelajaran terperinci, waktu penilaian akhir semester, pelaksanaan lomba, istighosah kubro, serta libur akademik resmi semester genap. Unduh salinan digital dokumen PDF resmi kami gratis di bawah ini.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-[#F5C518] rounded-full shrink-0" />
                  <span className="text-slate-600 text-sm">Awal Perkuliahan & KBM: 05 Juni 2026</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-[#F5C518] rounded-full shrink-0" />
                  <span className="text-slate-600 text-sm">Penilaian Tengah Semester (PTS): 10-18 September 2026</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 mt-1.5 bg-[#F5C518] rounded-full shrink-0" />
                  <span className="text-slate-600 text-sm">Porsema & Ujian lisan Kepesantrenan: 14-22 November 2026</span>
                </div>
              </div>

              <a
                href="#download"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Unduhan Kalender Akademik PDF Terbitan Juni 2026 telah disimulasikan!");
                }}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#1A5C38] hover:bg-emerald-900 text-[#F5C518] font-bold text-sm tracking-wide rounded-sm transition-colors border-2 border-[#F5C518]"
              >
                <Download className="w-4 h-4" />
                Unduh Kalender .PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

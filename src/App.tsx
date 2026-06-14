import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calendar, GraduationCap, MapPin, Phone, Mail, 
  Clock, Award, HelpCircle, CheckCircle, ChevronRight, Sliders,
  Facebook, Instagram, Youtube, PhoneCall, ShieldAlert, Heart,
  Search, Eye, Printer, X, Server
} from 'lucide-react';

// Modular component imports
import HeroCarousel from './components/HeroCarousel';
import AkademikSec from './components/AkademikSec';
import PPDBForm from './components/PPDBForm';
import AdminPanel from './components/AdminPanel';
import Toast from './components/Toast';

// Models
import { Kegiatan, Guru, Alumni, PPDBPendaftar } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');

  // API datasets
  const [events, setEvents] = useState<Kegiatan[]>([]);
  const [teachers, setTeachers] = useState<Guru[]>([]);
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<any>({
    nama_madrasah: "MA Bilingual Ulul Albab",
    tagline: "Membentuk Generasi Qur'ani, Bilingual, & Berprestasi",
    deskripsi_singkat: "Pendidikan integratif setingkat Madrasah Aliyah yang menyelaraskan keluasan literatur kepesantrenan dengan keunggulan sains modern berstandar internasional.",
    alamat: "Jl. Pondok Pesantren No. 05 Ngronggot, Nganjuk, Jawa Timur",
    telepon: "0358-123456",
    email: "kontak@mabilingualululalbab.sch.id",
    facebook: "https://facebook.com/mabilingualululalbab",
    instagram: "https://instagram.com/mabilingualululalbab",
    youtube: "https://youtube.com/mabilingualululalbab",
    whatsapp: "628123456789",
    ppdb_aktif: "true",
    ppdb_tahun: "2026/2027"
  });

  // Client Filter states
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Detail Modal
  const [selectedEvent, setSelectedEvent] = useState<Kegiatan | null>(null);

  // Notification states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // UTC Real time reference
  const [utcTime, setUtcTime] = useState('2026-06-14 06:40:00');

  useEffect(() => {
    // Sync current time on mount (and update every second)
    const interval = setInterval(() => {
      const now = new Date();
      const formatStr = now.toISOString().replace('T', ' ').slice(0, 19);
      setUtcTime(formatStr);
    }, 1000);

    // Initial Public Data loading
    Promise.all([
      fetch('/api/kegiatan').then(res => res.json()),
      fetch('/api/guru').then(res => res.json()),
      fetch('/api/alumni').then(res => res.json()),
      fetch('/api/pengaturan').then(res => res.json())
    ])
      .then(([eventsData, teachersData, alumniData, settingsData]) => {
        if (Array.isArray(eventsData)) setEvents(eventsData);
        if (Array.isArray(teachersData)) setTeachers(teachersData);
        if (Array.isArray(alumniData)) setAlumniList(alumniData);
        if (settingsData && settingsData.nama_madrasah) setSchoolSettings(settingsData);
      })
      .catch(err => {
        console.error("Public API hydration error:", err);
        showToast("Gagal memuat info madrasah dari server.", "error");
      });

    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Helper filter category listings
  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.judul.toLowerCase().includes(searchQuery.toLowerCase()) || ev.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Semua' || ev.kategori === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const scrollSection = (id: string) => {
    setCurrentView('public');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 120);
  };

  return (
    <div id="school-homepage" className="min-h-screen text-slate-850 bg-slate-50 relative flex flex-col justify-between">
      
      {/* Dynamic Toast Notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* TOP HEADER PRE-NAVBAR BAR (Oxford Elegant Styling Bar with Real Time) */}
      <div className="bg-[#1A5C38] text-white text-[11px] py-2 px-6 border-b border-[#F5C518]/60 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex flex-wrap items-center gap-4 font-medium">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#F5C518]" /> Nganjuk, Jawa Timur</span>
          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#F5C518]" /> {schoolSettings.telepon}</span>
          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#F5C518]" /> {schoolSettings.email}</span>
        </div>
        
        {/* Realtime UTC and user login status indicator */}
        <div className="flex items-center gap-4 text-[#F5C518] font-mono">
          <span>🕒 UTC Live: {utcTime} / holicfootball0</span>
          <button
            onClick={() => {
              if (currentView === 'public') {
                setCurrentView('admin');
                showToast("Masuk ke portal pengelola madrasah", "success");
              } else {
                setCurrentView('public');
              }
            }}
            className="bg-emerald-900 border border-[#F5C518]/50 hover:bg-[#F5C518] hover:text-[#1A5C38] px-2 py-0.5 text-[10px] font-sans font-bold transition-all rounded"
          >
            {currentView === 'public' ? '🔐 Portal Pengelola' : '🌐 Kembali ke Web'}
          </button>
        </div>
      </div>

      {/* MAIN NAVIGATION ROW (Oxford Green `#1A5C38` with Kuning Emas border-bottom 3px `#F5C518`) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md border-b-[3px] border-[#F5C518] transition-all">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => scrollSection('hero-section')}>
            <span className="w-12 h-12 bg-[#1A5C38] text-[#F5C518] leading-none border-2 border-[#F5C518] rounded-sm flex items-center justify-center font-bold tracking-tighter text-xl font-serif shadow-sm">
              MAB
            </span>
            <div>
              <h1 className="font-serif-oxford font-semibold text-lg text-[#1A5C38] leading-tight uppercase tracking-tight">
                {schoolSettings.nama_madrasah}
              </h1>
              <p className="text-[10px] text-amber-800 tracking-wider font-semibold font-sans">
                OXFORD QUALITY INTEGRATED BOARDING SCHOOL
              </p>
            </div>
          </div>

          {/* Navigation Items (Search bar, Links, Custom actions) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <button onClick={() => scrollSection('hero-section')} className="hover:text-[#1A5C38] transition-colors cursor-pointer text-slate-800">Beranda</button>
            <button onClick={() => scrollSection('akademik-section')} className="hover:text-[#1A5C38] transition-colors cursor-pointer">Akademik</button>
            <button onClick={() => scrollSection('kegiatan-section')} className="hover:text-[#1A5C38] transition-colors cursor-pointer">Kegiatan</button>
            <button onClick={() => scrollSection('guru-section')} className="hover:text-[#1A5C38] transition-colors cursor-pointer">Dewan Guru</button>
            <button onClick={() => scrollSection('alumni-section')} className="hover:text-[#1A5C38] transition-colors cursor-pointer">Alumni</button>
            
            {/* PPDB Button call out */}
            <button
              onClick={() => scrollSection('ppdb-section')}
              className="px-4 py-2 bg-[#1A5C38] hover:bg-emerald-900 text-[#F5C518]/90 font-bold tracking-wide rounded-sm shadow-md transition-colors border border-[#F5C518] cursor-pointer"
            >
              PPDB Online {schoolSettings.ppdb_tahun}
            </button>
          </nav>
        </div>
      </header>

      {/* VIEW DELEGATOR ROUTER */}
      {currentView === 'admin' ? (
        
        /* ADMIN CONTAINER VIEWPORT */
        <div className="flex-1 min-h-[85vh]">
          <AdminPanel 
            onSuccess={(msg) => showToast(msg, 'success')} 
            onError={(msg) => showToast(msg, 'error')} 
          />
        </div>

      ) : (

        /* PUBLIC MADRASAH LANDING SITE VIEW */
        <div className="flex-1">
          
          {/* Hero automated carousel with direct registration hook */}
          <HeroCarousel onRegisterClick={() => scrollSection('ppdb-section')} />

          {/* QUICK SUMMARY METRICS RIBBON (EMERALD GREEN GOLD CORNER) */}
          <section className="bg-[#1A5C38] py-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,24,0.15),transparent_45%)]" />
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center select-none">
                <div className="p-4 border-r border-[#F5C518]/20 last:border-0 hover:scale-105 transition-transform duration-200">
                  <h3 className="text-3xl font-bold font-serif-oxford text-[#F5C518]">23+</h3>
                  <p className="text-xs text-slate-200 uppercase tracking-widest mt-1">Staf Asatidzah Mutqin</p>
                </div>
                <div className="p-4 border-r border-[#F5C518]/20 last:border-0 hover:scale-105 transition-transform duration-200">
                  <h3 className="text-3xl font-bold font-serif-oxford text-[#F5C518]">300+</h3>
                  <p className="text-xs text-slate-200 uppercase tracking-widest mt-1">Santri Mukim Aktif</p>
                </div>
                <div className="p-4 border-r border-[#F5C518]/20 last:border-0 hover:scale-105 transition-transform duration-200">
                  <h3 className="text-3xl font-bold font-serif-oxford text-[#F5C518]">240+</h3>
                  <p className="text-xs text-slate-200 uppercase tracking-widest mt-1">Alumni Studi Luar Negeri</p>
                </div>
                <div className="p-4 last:border-0 hover:scale-105 transition-transform duration-200">
                  <h3 className="text-3xl font-bold font-serif-oxford text-[#F5C518]">100%</h3>
                  <p className="text-xs text-slate-200 uppercase tracking-widest mt-1">Sanad Al-Qur'an & Kitab</p>
                </div>
              </div>
            </div>
          </section>

          {/* CHIEF HEADMASTER / KYAI WELCOME MESSAGE */}
          <section className="py-16 bg-white border-b border-slate-100">
            <div className="container mx-auto px-6 max-w-7xl">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 shrink-0 relative">
                  <div className="absolute inset-0 border-2 border-[#F5C518] translate-x-3 translate-y-3 z-0 rounded-sm" />
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
                    alt="Kepala Madrasah / Ketua Yayasan"
                    className="w-full max-w-[280px] h-auto object-cover border border-slate-350 shadow-sm relative z-10 mx-auto rounded-sm"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="md:w-2/3">
                  <span className="text-emerald-750 tracking-widest text-xs uppercase font-bold inline-block mb-1">MUKADDIMAH PENGASUH</span>
                  <h3 className="text-2xl sm:text-3xl font-serif-oxford font-bold text-slate-900 leading-tight mb-4">
                    "Unggul dalam Ilmu, Mulia dalam Akhlak, Global dalam Langkah"
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 font-light">
                    Assalamu’alaikum Warahmatullahi Wabarakatuh.<br/><br/>
                    Di era disrupsi peradaban sains kecerdasan buatan, tantangan terbesar kita adalah mencetak calon pemimpin masa depan yang kokoh ruhaniyahnya tapi juga tangguh rasionalitas sainsnya. Di <strong>MA Bilingual Ulul Albab</strong>, kami memadukan tradisi klasik kepesantrenan (Tafsir, Tajwid, Kitab Salaf) dengan literasi dual bahasa (Inggris - Arab) serta bimbingan intensif olimpiade sains berskala nasional. Kami bercita-cita mengantarkan putra-putri Anda menembus perguruan tinggi terbaik dunia tanpa kehilangan manhaj ahlussunnah wal jama’ah.
                  </p>
                  <div>
                    <h4 className="font-serif-oxford font-bold text-slate-900 border-t pt-4">KH. Dr. Ahmad Fauzi Habibi, M.Pd.I</h4>
                    <span className="text-xs text-slate-400">Pengasuh Pesantren Terpadu & Kepala Madrasah</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TAB-BASED ACADEMIC DETAILS ROW */}
          <AkademikSec initialClasses={['10-A', '10-B', '10-C']} />

          {/* KEGIATAN & EVENT REPORTEUR ROW */}
          <section id="kegiatan-section" className="py-16 bg-white border-b border-slate-100">
            <div className="container mx-auto px-6 max-w-7xl">
              
              <div className="text-center mb-12">
                <span className="text-emerald-700 tracking-widest text-xs uppercase font-bold inline-block mb-1">INFORMASI DAN AGENDA</span>
                <h2 className="text-3xl sm:text-4xl font-serif-oxford font-semibold text-slate-900 relative inline-block pb-3">
                  Berita & Kegiatan Santri
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-[#F5C518]"></span>
                </h2>
                <p className="text-slate-500 max-w-xl mx-auto mt-4 text-sm font-light">
                  Simak liputan kegiatan rutin pondok, jadwal khitobah dwi-bahasa, perlombaan regional, serta agenda silaturahmi nasional.
                </p>
              </div>

              {/* Grid categories filters and Search bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
                <div className="flex gap-2 overflow-x-auto scrollbar-none shrink-0">
                  {['Semua', 'Akademik', 'Keagamaan', 'Kesenian', 'Umum'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                        activeCategory === cat 
                          ? 'bg-[#1A5C38] text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari berita & event..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-50 border border-slate-300 text-slate-900 pl-8 pr-3 py-1.5 text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 w-full sm:w-60"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Grid list block */}
              {filteredEvents.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic">
                  Belum ada liputan berita/kegiatan terdaftar untuk kategori ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredEvents.map(ev => (
                    <div 
                      key={ev.id} 
                      className="group border border-slate-100 hover:border-emerald-200 bg-slate-50 hover:bg-white rounded-sm overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Image overlay container */}
                        <div className="relative h-48 overflow-hidden bg-slate-200">
                          <img
                            src={ev.gambar_url || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400"}
                            alt={ev.judul}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute top-3 left-3 bg-[#1A5C38] text-white px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-sm">
                            {ev.kategori}
                          </span>
                        </div>

                        {/* Content text block */}
                        <div className="p-5">
                          <span className="text-[10px] font-mono text-slate-400">📅 {new Date(ev.tanggal_mulai).toLocaleDateString()}</span>
                          <h3 className="font-serif-oxford font-bold text-slate-900 text-lg leading-snug mt-1 mb-2 group-hover:text-emerald-800 transition-colors">
                            {ev.judul}
                          </h3>
                          <p className="text-slate-550 text-xs line-clamp-3 leading-relaxed">
                            {ev.deskripsi}
                          </p>
                        </div>
                      </div>

                      {/* Card triggers */}
                      <div className="px-5 pb-5 border-t border-slate-100/40 pt-3 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium italic">📍 {ev.lokasi || 'Komp. Kampus B'}</span>
                        <button
                          onClick={() => setSelectedEvent(ev)}
                          className="flex items-center gap-1 text-xs font-bold text-emerald-805 hover:text-[#1A5C38]"
                        >
                          Selengkapnya <ChevronRight className="w-4 h-4 text-[#F5C518]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </section>

          {/* GURU ROSTER SECTION */}
          <section id="guru-section" className="py-16 bg-slate-50 border-b border-slate-100">
            <div className="container mx-auto px-6 max-w-7xl">
              
              <div className="text-center mb-12">
                <span className="text-emerald-700 tracking-widest text-xs uppercase font-bold inline-block mb-1">STAF PENGAJAR</span>
                <h2 className="text-3xl sm:text-4xl font-serif-oxford font-semibold text-slate-900 relative inline-block pb-3">
                  Tenaga Asatidzah Madrasah
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-[#F5C518]"></span>
                </h2>
                <p className="text-slate-500 max-w-xl mx-auto mt-4 text-sm font-light">
                  Dididik langsung oleh guru lulusan universitas ternama dunia (Al-Azhar Kairo, Univ. Madinah, dll.) serta asatidzah luhur huffadzul qur'an.
                </p>
              </div>

              {/* Roster Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {teachers.slice(0, 8).map(teacher => (
                  <div key={teacher.id} className="p-4 bg-white border border-slate-200 rounded-sm hover:-translate-y-1 transition-transform shadow-sm text-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border bg-slate-100">
                      <img src={teacher.foto_url} alt={teacher.nama} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-serif-oxford font-bold text-xs text-slate-900">{teacher.nama}</h4>
                    <span className="text-[9px] text-[#2D8A56] font-mono leading-none tracking-wide font-bold block mt-1 uppercase">{teacher.mata_pelajaran}</span>
                    <span className="text-[9px] text-slate-400 leading-none">{teacher.jabatan}</span>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* ALUMNI SUCCESS PORTAL ROW */}
          <section id="alumni-section" className="py-16 bg-white border-b border-slate-100">
            <div className="container mx-auto px-6 max-w-7xl">
              
              <div className="text-center mb-12">
                <span className="text-emerald-700 tracking-widest text-xs uppercase font-bold inline-block mb-1">PORTAL KELULUSAN</span>
                <h2 className="text-3xl sm:text-4xl font-serif-oxford font-semibold text-slate-900 relative inline-block pb-3">
                  Alumni Berprestasi Global
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-[#F5C518]"></span>
                </h2>
                <p className="text-slate-500 max-w-xl mx-auto mt-4 text-sm font-light">
                  Kisah sukses santri melanglang buana, mendapatkan tempat di universitas terbaik nasional maupun beasiswa bergengsi timur tengah.
                </p>
              </div>

              {/* Alumni Grid Slider */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {alumniList.slice(0, 3).map(alumni => (
                  <div key={alumni.id} className="border border-slate-100 bg-slate-50/50 p-6 rounded relative">
                    <span className="absolute top-4 right-4 text-3xl text-emerald-900/10 font-serif">“</span>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border">
                        <img src={alumni.foto_url} alt={alumni.nama} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{alumni.nama}</h4>
                        <span className="text-[10px] text-emerald-800 font-mono">Angkatan Lulus: {alumni.tahun_lulus}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 italic bg-white p-3 rounded border border-slate-100 leading-relaxed mb-3">
                      "{alumni.prestasi || 'Alhamdulillah, bekal ilmu bilingual dan penguasaan kitab lisan di MA Bilingual mengantarkan saya lulus beasiswa penuh.'}"
                    </p>
                    <div className="text-[11px] text-slate-500 font-semibold">
                      🎓 {alumni.karir_sekarang} di <span className="text-emerald-800 font-bold">{alumni.institusi_sekarang}</span>, {alumni.kota_sekarang}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* INTERACTIVE MULTI-STEP PPDB PENDAFTARAN FORM */}
          <PPDBForm 
            onSuccess={(msg) => showToast(msg, 'success')} 
            onError={(msg) => showToast(msg, 'error')} 
          />

        </div>
      )}

      {/* DETAILED EVENT DRAWER INFO MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border-2 border-emerald-950 max-w-xl w-full p-6 text-sm rounded shadow-xl relative">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:scale-110 transition-transform text-lg font-bold"
              aria-label="Tutup Detail"
            >
              ✕
            </button>
            
            <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-[#1A5C38] font-bold text-[10px] uppercase rounded mb-3">
              {selectedEvent.kategori}
            </span>
            <h3 className="text-2xl font-serif-oxford font-bold text-slate-900 leading-snug mb-2">{selectedEvent.judul}</h3>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono mb-4 pb-3 border-b border-slate-100">
              <span>📅 Mulai: {new Date(selectedEvent.tanggal_mulai).toLocaleDateString()}</span>
              <span>📍 Ruang: {selectedEvent.lokasi || 'Komp. Madrasatuna'}</span>
            </div>

            {/* Img Banner */}
            {selectedEvent.gambar_url && (
              <img 
                src={selectedEvent.gambar_url} 
                alt="Banner Event" 
                className="w-full h-44 object-cover rounded border mb-4 shadow-sm"
              />
            )}

            <div className="text-slate-705 leading-relaxed text-xs overflow-y-auto max-h-[180px] bg-slate-50 p-3 rounded border">
              {selectedEvent.konten ? (
                <div dangerouslySetInnerHTML={{ __html: selectedEvent.konten.replace(/\n/g, '<br/>') }} />
              ) : (
                <p>{selectedEvent.deskripsi}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-sm hover:bg-slate-800 transition-colors"
              >
                Tutup Ringkasan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER SECTION: INFRASTRUCTURE INFO & SOCIALS */}
      <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t-[4px] border-[#F5C518]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-slate-800 pb-12 mb-8">
            
            {/* Col 1: Madrasah Bio */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-9 h-9 bg-emerald-800 text-[#F5C518] flex items-center justify-center font-bold font-serif shadow-sm rounded-sm">
                  MAB
                </span>
                <span className="font-serif-oxford font-bold text-white uppercase text-sm tracking-tight">{schoolSettings.nama_madrasah}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light mb-4">
                {schoolSettings.deskripsi_singkat}
              </p>
              {/* Halal clock sign */}
              <div className="text-[10px] text-emerald-500 font-mono font-bold bg-slate-900 px-3 py-1.5 rounded border border-slate-800 inline-block">
                🕌 TA: {schoolSettings.ppdb_tahun} REGISTERED
              </div>
            </div>

            {/* Col 2: Navigation link shortcuts */}
            <div>
              <h4 className="font-serif-oxford font-bold text-white text-sm mb-4 uppercase tracking-wider">Akses Pintas</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => scrollSection('hero-section')} className="hover:text-white transition-colors cursor-pointer text-left">Beranda Website</button></li>
                <li><button onClick={() => scrollSection('akademik-section')} className="hover:text-white transition-colors cursor-pointer text-left">Akademik & Kurikulum</button></li>
                <li><button onClick={() => scrollSection('kegiatan-section')} className="hover:text-white transition-colors cursor-pointer text-left">Liputan Hubungan Masyarakat</button></li>
                <li><button onClick={() => scrollSection('guru-section')} className="hover:text-white transition-colors cursor-pointer text-left">Registrasi Asatidzah</button></li>
                <li><button onClick={() => scrollSection('alumni-section')} className="hover:text-white transition-colors cursor-pointer text-left">Ikatan Alumni Santri</button></li>
                <li>
                  <button 
                    onClick={() => {
                      setCurrentView(currentView === 'public' ? 'admin' : 'public');
                    }} 
                    className="text-[#F5C518] hover:underline font-bold text-left"
                  >
                    🔐 Portal Supervisor Madrasah
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Contact */}
            <div>
              <h4 className="font-serif-oxford font-bold text-white text-sm mb-4 uppercase tracking-wider">Alamat & Sekretariat</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                {schoolSettings.alamat}
              </p>
              <p className="text-xs mb-1">📞 {schoolSettings.telepon}</p>
              <p className="text-xs">✉️ {schoolSettings.email}</p>
            </div>

            {/* Col 4: Social media & WhatsApp direct call */}
            <div>
              <h4 className="font-serif-oxford font-bold text-white text-sm mb-4 uppercase tracking-wider">Ikuti Media Sosial</h4>
              <div className="flex gap-3 mb-4">
                <a href={schoolSettings.facebook} target="_blank" rel="noreferrer" className="p-2 bg-slate-900 hover:bg-[#F5C518] text-slate-400 hover:text-slate-950 transition-colors rounded-full" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href={schoolSettings.instagram} target="_blank" rel="noreferrer" className="p-2 bg-slate-900 hover:bg-[#F5C518] text-slate-400 hover:text-slate-950 transition-colors rounded-full" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href={schoolSettings.youtube} target="_blank" rel="noreferrer" className="p-2 bg-slate-900 hover:bg-[#F5C518] text-slate-400 hover:text-slate-950 transition-colors rounded-full" aria-label="Youtube">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-[#1A5C38] text-white p-3.5 border border-[#F5C518] rounded flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold font-serif-oxford text-[#F5C518]">Layanan PPDB WA</h4>
                  <p className="text-[10px] text-slate-200 truncate">Dapatkan balasan langsung panitia</p>
                </div>
                <a
                  href={`https://wa.me/${schoolSettings.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-emerald-900 hover:bg-emerald-950 rounded text-white shrink-0 flex items-center justify-center border border-[#F5C518]/30"
                  aria-label="Direct Chat"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-550 gap-4">
            <p>© 2026 {schoolSettings.nama_madrasah}. Hak Cipta Dilindungi Undang-Undang.</p>
            <p>Rilis Versi 1.4-Secure // Crafted with passion for Indonesian Islamic Education.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

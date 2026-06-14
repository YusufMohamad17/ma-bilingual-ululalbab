import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  tag: string;
}

const slides: Slide[] = [
  {
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1600",
    title: "Membentuk Generasi Qur'ani, Dwibahasa & Berprestasi",
    subtitle: "Pendidikan integratif yang menyelaraskan kedalaman spritual kepesantrenan dengan keunggulan sains global modern.",
    tag: "Tafsir Al-Qur'an & Bilingual"
  },
  {
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1600",
    title: "Akademik Klasik dengan Fasilitas Modern",
    subtitle: "Kurikulum Oxford-style diadaptasikan berbaurkan tradisi madrasah guna mencetak intelektual muslim global masa depan.",
    tag: "Kurikulum Internasional"
  },
  {
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1600",
    title: "Pendaftaran Siswa Baru (PPDB) Telah Dibuka",
    subtitle: "Dapatkan kesempatan emas menerima beasiswa prestasi penuh untuk tahun pelajaran 2026/2027.",
    tag: "Pendaftaran Online Aktif"
  }
];

interface HeroCarouselProps {
  onRegisterClick: () => void;
}

export default function HeroCarousel({ onRegisterClick }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div id="hero-section" class="relative hover:shadow-lg w-full h-[450px] sm:h-[550px] bg-slate-900 overflow-hidden">
      {/* Slides wrapper */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image with Dark Linear Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-slate-900/60 z-10" />
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center scale-105 transform hover:scale-100 transition-transform duration-[6000ms]"
            referrerPolicy="no-referrer"
          />
          
          {/* Content container */}
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="container mx-auto px-6 sm:px-12 max-w-7xl">
              <div className="max-w-2xl text-white animate-fade-in">
                {/* Badge Tagline */}
                <span className="inline-block px-3 py-1 bg-[#F5C518] hover:bg-[#E8A800] text-[#1A5C38] text-xs font-bold uppercase tracking-wider rounded-sm mb-4">
                  {slide.tag}
                </span>
                
                {/* Header title */}
                <h1 className="text-3xl sm:text-5xl font-serif-oxford font-bold leading-tight mb-4 tracking-tight drop-shadow-md">
                  {slide.title}
                </h1>
                
                {/* description */}
                <p className="text-slate-200 text-sm sm:text-lg mb-8 font-light leading-relaxed">
                  {slide.subtitle}
                </p>
                
                {/* Actions */}
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={onRegisterClick}
                    className="px-6 py-3 bg-[#F5C518] hover:bg-[#E8A800] text-[#1A5C38] font-bold text-sm tracking-wide transition-colors duration-200 rounded-sm shadow-md"
                  >
                    Daftar PPDB Online
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('akademik-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-3 border border-slate-300 hover:border-[#F5C518] text-white hover:text-[#F5C518] font-medium text-sm tracking-wide bg-transparent transition-all duration-200 rounded-sm"
                  >
                    Pelajari Kurikulum
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Manual navigations */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 text-white/50 hover:text-white bg-slate-900/30 hover:bg-slate-900/60 rounded-full transition-all focus:outline-none hidden sm:block"
        aria-label="Slide Sebelumnya"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 text-white/50 hover:text-white bg-slate-900/30 hover:bg-slate-900/60 rounded-full transition-all focus:outline-none hidden sm:block"
        aria-label="Slide Selanjutnya"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slider indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-1.5 transition-all ${
              idx === current ? 'w-8 bg-[#F5C518]' : 'bg-slate-400/50 hover:bg-white/50'
            }`}
            aria-label={`Ke slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

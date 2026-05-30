import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Bookmark, Play, Pause, Volume2, BookOpen, ZoomIn, ZoomOut, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';

export default function MushafReader({ 
  quranData, 
  surahsData, 
  playingVerseId, 
  handlePlayToggle, 
  activeReciter,
  setActiveReciter,
  autoplay,
  setAutoplay
}) {
  // Navigation State
  const [currentSurahId, setCurrentSurahId] = useState(1);
  const [fontSize, setFontSize] = useState(36); // in px
  
  // Persisted Bookmark State
  const [bookmark, setBookmark] = useState(null);
  const [justJumped, setJustJumped] = useState(false);

  // Load bookmark on mount
  useEffect(() => {
    const savedBookmark = localStorage.getItem('quran_bookmark');
    if (savedBookmark) {
      setBookmark(JSON.parse(savedBookmark));
    }
  }, []);

  // Filter verses of the current selected Surah
  const surahVerses = useMemo(() => {
    return quranData.filter(v => v.surah === currentSurahId);
  }, [currentSurahId, quranData]);

  // Current Surah Details
  const currentSurah = useMemo(() => {
    return surahsData.find(s => s.id === currentSurahId) || surahsData[0];
  }, [currentSurahId, surahsData]);

  // Reciter list
  const reciters = [
    { id: 'ar.alafasy', name: 'مشاري راشد العفاسي' },
    { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط (مرتل)' },
    { id: 'ar.abdulsamad', name: 'عبد الباسط (مجود)' },
    { id: 'ar.husary', name: 'محمود خليل الحصري' },
    { id: 'ar.minshawi', name: 'محمد صديق المنشاوي' },
    { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي' },
    { id: 'ar.saoodshuraym', name: 'سعود الشريم' }
  ];

  // Save Bookmark
  const handleSaveBookmark = (verse) => {
    const newBookmark = {
      id: verse.id,
      surahId: verse.surah,
      ayah: verse.ayah,
      surahName: currentSurah.name_ar
    };
    localStorage.setItem('quran_bookmark', JSON.stringify(newBookmark));
    setBookmark(newBookmark);
  };

  // Clear Bookmark
  const handleClearBookmark = (e) => {
    e.stopPropagation();
    localStorage.removeItem('quran_bookmark');
    setBookmark(null);
  };

  // Jump to saved Bookmark
  const handleJumpToBookmark = () => {
    if (!bookmark) return;
    
    // 1. Set current Surah
    setCurrentSurahId(bookmark.surahId);
    setJustJumped(true);
  };

  // Handle smooth scroll to bookmarked or playing verse
  useEffect(() => {
    if (justJumped && bookmark) {
      setTimeout(() => {
        const element = document.getElementById(`mushaf-ayah-${bookmark.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add temporary pulsing glow effect
          element.classList.add('ring-2', 'ring-amber-500/50', 'bg-amber-500/5');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-amber-500/50', 'bg-amber-500/5');
          }, 3000);
        }
        setJustJumped(false);
      }, 300);
    }
  }, [justJumped, bookmark]);

  // Auto-scroll to currently playing verse in continuous recitation
  useEffect(() => {
    if (playingVerseId) {
      const element = document.getElementById(`mushaf-ayah-${playingVerseId}`);
      // Find if this verse is in the current Surah, if not, switch Surah!
      const verseObj = quranData.find(v => v.id === playingVerseId);
      if (verseObj && verseObj.surah !== currentSurahId) {
        setCurrentSurahId(verseObj.surah);
      }
      
      setTimeout(() => {
        const element = document.getElementById(`mushaf-ayah-${playingVerseId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    }
  }, [playingVerseId]);

  // Navigating Surahs
  const handleNextSurah = () => {
    if (currentSurahId < 114) {
      setCurrentSurahId(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevSurah = () => {
    if (currentSurahId > 1) {
      setCurrentSurahId(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-4xl mx-auto py-4 animate-fade-in px-4">
      
      {/* Dynamic Bookmark Alert Prompter */}
      {bookmark && (
        <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div className="text-right sm:text-right">
              <h4 className="text-sm font-bold text-amber-300">لديك علامة توقف محفوظة</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                آخر قراءة كانت في <strong className="text-slate-200">{bookmark.surahName}</strong> (الآية {bookmark.ayah})
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearBookmark}
              className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/15 rounded-xl cursor-pointer transition-all"
            >
              حذف العلامة
            </button>
            <button
              onClick={handleJumpToBookmark}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 hover:scale-[1.02] active:scale-95 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              <span>متابعة القراءة الآن</span>
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Control Header Bar */}
      <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        
        {/* Font Size & Autoplay Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl p-1">
            <button
              onClick={() => fontSize > 20 && setFontSize(prev => prev - 4)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg cursor-pointer transition-all"
              title="تصغير الخط"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-400 px-2 font-mono">{fontSize}px</span>
            <button
              onClick={() => fontSize < 56 && setFontSize(prev => prev + 4)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg cursor-pointer transition-all"
              title="تكبير الخط"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Autoplay toggle */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-3.5 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400 font-semibold">توالي التلاوة تلقائياً</span>
            <button
              onClick={() => setAutoplay(!autoplay)}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${
                autoplay ? 'bg-emerald-500' : 'bg-slate-850'
              }`}
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-slate-950 transition-all duration-300 ${
                autoplay ? 'translate-x-4.5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Dynamic Selector of active reciter & Surah */}
        <div className="flex items-center gap-3 flex-wrap flex-grow sm:flex-grow-0 justify-end">
          {/* Reciter dropdown */}
          <select
            value={activeReciter}
            onChange={(e) => setActiveReciter(e.target.value)}
            className="bg-slate-950 border border-slate-850 hover:border-slate-850 text-slate-200 text-xs font-bold rounded-xl py-2 px-3 outline-none cursor-pointer font-sans"
            dir="rtl"
          >
            {reciters.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          {/* Surah dropdown select */}
          <select
            value={currentSurahId}
            onChange={(e) => setCurrentSurahId(Number(e.target.value))}
            className="bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/30 text-emerald-300 text-xs font-extrabold rounded-xl py-2 px-4 outline-none cursor-pointer font-sans"
            dir="rtl"
          >
            {surahsData.map((s) => (
              <option key={s.id} value={s.id}>{s.id}. {s.name_ar}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Surah calligraphic banner decoration */}
      {currentSurah && (
        <div className="w-full bg-gradient-to-r from-slate-900/60 via-emerald-950/20 to-slate-900/60 border border-slate-800/80 p-6 md:p-8 rounded-3xl text-center shadow-lg relative overflow-hidden flex flex-col items-center justify-center gap-3">
          {/* Background glowing decorations */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />

          {/* Arabic Surah details */}
          <h2 className="text-3xl md:text-4xl font-extrabold font-arabic text-slate-100 flex items-center justify-center gap-2">
            {currentSurah.name_ar}
          </h2>
          
          <div className="flex items-center gap-3 text-xs md:text-sm text-slate-400 font-light mt-1">
            <span className="bg-slate-950/60 border border-slate-850 px-3 py-1 rounded-full">
              آياتها {surahVerses.length}
            </span>
            <span className="text-slate-700">•</span>
            <span className="bg-slate-950/60 border border-slate-850 px-3 py-1 rounded-full">
              {currentSurah.type === 'Meccan' ? 'مكية' : 'مدنية'}
            </span>
            <span className="text-slate-700">•</span>
            <span className="bg-slate-950/60 border border-slate-850 px-3 py-1 rounded-full">
              ترتيبها {currentSurah.id}
            </span>
          </div>

          {/* Golden/Emerald Bismillah header for all Surahs except Surah At-Tawbah (9) */}
          {currentSurahId !== 9 && (
            <div className="text-2xl md:text-3xl font-arabic text-emerald-400 tracking-wider mt-4 select-none leading-relaxed font-bold">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </div>
          )}
        </div>
      )}

      {/* Main Mushaf Content: Reading flow */}
      <div className="w-full flex flex-col gap-4">
        {surahVerses.map((verse) => {
          const isPlaying = playingVerseId === verse.id;
          const isBookmarked = bookmark && bookmark.id === verse.id;
          
          // Render a clean verse without the Bismillah prefix if it is Al-Fatihah or standard verses
          // (Since we already render Bismillah in the header, except for Ayah 1 of Surah 1)
          let verseText = verse.ar;
          if (currentSurahId === 1 && verse.ayah === 1) {
            // keep it
          } else if (verse.ayah === 1 && verseText.startsWith('﻿بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ')) {
            verseText = verseText.replace('﻿بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ', '');
          } else if (verse.ayah === 1 && verseText.startsWith('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ')) {
            verseText = verseText.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ', '');
          }

          return (
            <div
              key={verse.id}
              id={`mushaf-ayah-${verse.id}`}
              className={`w-full bg-[#0a0f1b]/70 backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col gap-4 border transition-all duration-300 relative group overflow-hidden ${
                isPlaying
                  ? 'border-emerald-500/60 bg-[#0a0f1b]/95 shadow-[0_0_20px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/20'
                  : isBookmarked
                  ? 'border-amber-500/40 bg-[#0a0f1b]/80 shadow-md ring-1 ring-amber-500/10'
                  : 'border-slate-900/60 hover:border-slate-800/80 hover:bg-[#0a0f1b]/90'
              }`}
            >
              {/* Background accent glow when active */}
              {isPlaying && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full opacity-100 transition-opacity pointer-events-none" />
              )}
              {isBookmarked && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full opacity-100 transition-opacity pointer-events-none" />
              )}

              {/* Top Controls Toolbar of each Verse */}
              <div className="flex items-center justify-between border-b border-slate-900/60 pb-3 flex-row-reverse">
                {/* Verse indices details */}
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-900 text-slate-400 border border-slate-850 px-2.5 py-1 rounded-lg">
                    الآية {verse.ayah}
                  </span>
                  <span className="text-[10px] bg-slate-900 text-slate-500 border border-slate-850 px-2.5 py-1 rounded-lg">
                    الجزء {verse.juz}
                  </span>
                </div>

                {/* Audio & Bookmark Action Controls */}
                <div className="flex items-center gap-2">
                  {/* Play Recitation Button */}
                  <button
                    onClick={() => handlePlayToggle(verse.id)}
                    className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isPlaying
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse'
                        : 'bg-slate-950 border-slate-900 hover:border-slate-800 hover:bg-slate-900 text-slate-500 hover:text-emerald-400'
                    }`}
                    title={isPlaying ? "إيقاف التلاوة" : "تشغيل التلاوة"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => handleSaveBookmark(verse)}
                    className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isBookmarked
                        ? 'bg-amber-500/25 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'bg-slate-950 border-slate-900 hover:border-slate-800 hover:bg-slate-900 text-slate-500 hover:text-amber-400'
                    }`}
                    title="حفظ علامة التوقف عند هذه الآية"
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Calligraphy text display with adjustable font sizing */}
              <div className="flex items-start justify-end gap-5 py-4 w-full">
                <p 
                  className="arabic-text text-right text-slate-100 font-arabic leading-loose tracking-wide w-full font-bold"
                  style={{ fontSize: `${fontSize}px`, lineHeight: '2.1' }}
                >
                  {verseText}
                </p>
                {/* Calligraphic Verse Divider */}
                <div className="flex-shrink-0 w-11 h-11 rounded-full border-2 border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400 font-arabic select-none bg-emerald-500/5 mt-1.5">
                  {verse.ayah}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Dynamic Navigation Pagination of Surahs */}
      <div className="w-full flex items-center justify-between py-6 mt-4 border-t border-slate-900/60">
        
        {/* Next Surah Button (Lefthand navigation - Surah increases) */}
        <button
          onClick={handleNextSurah}
          disabled={currentSurahId === 114}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl border font-semibold text-xs transition-all cursor-pointer ${
            currentSurahId === 114
              ? 'border-slate-950 bg-slate-950/20 text-slate-700 pointer-events-none'
              : 'border-slate-850 hover:border-emerald-500/30 bg-slate-900/50 hover:bg-slate-900 hover:text-emerald-400 shadow-md'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>السورة التالية</span>
        </button>

        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans">
          سورة {currentSurahId} من 114
        </span>

        {/* Previous Surah Button (Righthand navigation - Surah decreases) */}
        <button
          onClick={handlePrevSurah}
          disabled={currentSurahId === 1}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl border font-semibold text-xs transition-all cursor-pointer ${
            currentSurahId === 1
              ? 'border-slate-950 bg-slate-950/20 text-slate-700 pointer-events-none'
              : 'border-slate-850 hover:border-emerald-500/30 bg-slate-900/50 hover:bg-slate-900 hover:text-emerald-400 shadow-md'
          }`}
        >
          <span>السورة السابقة</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}

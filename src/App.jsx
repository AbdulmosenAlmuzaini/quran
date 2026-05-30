import React, { useState, useMemo, useEffect, useRef } from 'react';
import SearchHeader from './components/SearchHeader';
import FilterPanel from './components/FilterPanel';
import VerseCard from './components/VerseCard';
import MushafReader from './components/MushafReader';
import PdfMushafReader from './components/PdfMushafReader';
import { searchQuran } from './utils/searchEngine';
import { BookOpen, Compass, ChevronDown, Award, Globe, ShieldAlert } from 'lucide-react';

export default function App() {
  // Database States loaded via static fetch
  const [surahsData, setSurahsData] = useState([]);
  const [quranData, setQuranData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [query, setQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState('');
  const [selectedJuz, setSelectedJuz] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  
  // Navigation Tab State ('search' | 'mushaf')
  const [activeTab, setActiveTab] = useState('search');
  const activeTabRef = useRef('search');

  // Mushaf mode State ('digital' | 'printed')
  const [mushafMode, setMushafMode] = useState('digital');

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Autoplay state for consecutive recitations in Mushaf mode
  const [autoplay, setAutoplay] = useState(true);
  const autoplayRef = useRef(true);

  useEffect(() => {
    autoplayRef.current = autoplay;
  }, [autoplay]);

  // Ref to always refer to the latest handlePlayToggle without stale closures
  const playToggleRef = useRef(null);

  // Audio Recitation States
  const [playingVerseId, setPlayingVerseId] = useState(null);
  const [activeReciter, setActiveReciter] = useState('ar.alafasy');
  const audioRef = useRef(null);

  // Stop audio when changing reciter
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingVerseId(null);
    }
  }, [activeReciter]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Audio Play/Pause Trigger
  const handlePlayToggle = (verseId) => {
    if (playingVerseId === verseId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingVerseId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Dynamic bitrate mapping for each reciter based on verified CDN availability
      const reciterBitrates = {
        'ar.alafasy': 128,
        'ar.husary': 128,
        'ar.minshawi': 128,
        'ar.mahermuaiqly': 128,
        'ar.abdulbasitmurattal': 64,
        'ar.abdulsamad': 64,
        'ar.saoodshuraym': 64,
        'en.walk': 192
      };

      
      const bitrate = reciterBitrates[activeReciter] || 128;
      
      // cdn.islamic.network streams verses using the absolute verse index (1 to 6236)
      const audioUrl = `https://cdn.islamic.network/quran/audio/${bitrate}/${activeReciter}/${verseId}.mp3`;
      const newAudio = new Audio(audioUrl);
      audioRef.current = newAudio;
      setPlayingVerseId(verseId);
      
      newAudio.play().catch(err => {
        console.error("Audio playback failed:", err);
        setPlayingVerseId(null);
        alert("عذراً، تعذر تشغيل الصوت. يرجى التحقق من اتصال الإنترنت.");
      });
      
      newAudio.onended = () => {
        setPlayingVerseId(null);
        // Autoplay consecutive verse if in Mushaf mode and autoplay is enabled
        if (activeTabRef.current === 'mushaf' && autoplayRef.current && verseId < 6236) {
          setTimeout(() => {
            if (playToggleRef.current) {
              playToggleRef.current(verseId + 1);
            }
          }, 800);
        }
      };
    }
  };

  // Keep playToggleRef synced with latest handlePlayToggle
  useEffect(() => {
    playToggleRef.current = handlePlayToggle;
  });


  // Pagination State (for extreme DOM performance)
  const [visibleCount, setVisibleCount] = useState(25);


  // Load database dynamically on mount
  useEffect(() => {
    Promise.all([
      fetch('/surahs.json').then(res => {
        if (!res.ok) throw new Error('فشل تحميل بيانات السور');
        return res.json();
      }),
      fetch('/quran_data.json').then(res => {
        if (!res.ok) throw new Error('فشل تحميل المصحف الشريف');
        return res.json();
      })
    ])
    .then(([surahsList, quranList]) => {
      setSurahsData(surahsList);
      setQuranData(quranList);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء تحميل البيانات. يرجى إعادة المحاولة.');
      setLoading(false);
    });
  }, []);

  // Reset pagination when search query or filters change
  useEffect(() => {
    setVisibleCount(25);
  }, [query, selectedSurah, selectedJuz, selectedType]);

  // Quick lookup maps for Surah names
  const surahMap = useMemo(() => {
    const map = {};
    surahsData.forEach(s => {
      map[s.id] = s.name_ar;
    });
    return map;
  }, [surahsData]);

  const surahDetailsMap = useMemo(() => {
    const map = {};
    surahsData.forEach(s => {
      map[s.id] = s;
    });
    return map;
  }, [surahsData]);

  // Filter Surahs based on revelation type
  const filteredSurahsList = useMemo(() => {
    if (selectedType === 'all') return surahsData;
    return surahsData.filter(s => s.type === selectedType);
  }, [selectedType, surahsData]);

  // Combined smart search & filter execution
  const finalResults = useMemo(() => {
    if (loading || quranData.length === 0) return [];
    
    // 1. Run Search Logic
    let results = searchQuran(quranData, query, {
      surahId: selectedSurah ? Number(selectedSurah) : null,
      juzId: selectedJuz ? Number(selectedJuz) : null
    });

    // 2. Filter by Revelation Type (Meccan / Medinan)
    if (selectedType !== 'all') {
      results = results.filter(item => {
        const surahInfo = surahDetailsMap[item.surah];
        return surahInfo && surahInfo.type === selectedType;
      });
    }

    return results;
  }, [query, selectedSurah, selectedJuz, selectedType, quranData, surahDetailsMap, loading]);

  // Paginated/Visible subset of results
  const visibleResults = useMemo(() => {
    return finalResults.slice(0, visibleCount);
  }, [finalResults, visibleCount]);

  // Reset All Filters & Query
  const handleResetFilters = () => {
    setQuery('');
    setSelectedSurah('');
    setSelectedJuz('');
    setSelectedType('all');
  };

  // If no search or filter is active, default to displaying Surah 1 (Al-Fatihah) for a warm onboarding
  const isBrowsingDefault = !query && !selectedSurah && !selectedJuz && selectedType === 'all';
  
  // Set default view to Surah 1 when browsing default
  const displayedResults = useMemo(() => {
    if (loading || quranData.length === 0) return [];
    if (isBrowsingDefault) {
      return quranData.filter(item => item.surah === 1);
    }
    return visibleResults;
  }, [isBrowsingDefault, visibleResults, quranData, loading]);

  const displayedCount = isBrowsingDefault ? displayedResults.length : finalResults.length;

  // Check if any filter is active
  const hasActiveFilters = !!(selectedSurah || selectedJuz || selectedType !== 'all');

  // Premium loading screen

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col items-center justify-center gap-6 antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        <div className="relative">
          {/* Breathing glow behind the loader */}
          <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-20 animate-pulse" />
          
          <div className="relative bg-slate-900/80 border border-slate-800/60 p-10 rounded-3xl flex flex-col items-center gap-5 shadow-2xl backdrop-blur-md max-w-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center animate-spin-slow">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                <Compass className="w-8 h-8" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-emerald-300 bg-clip-text text-transparent">
              الباحث القرآني الذكي
            </h2>
            
            <div className="flex flex-col items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs text-slate-400 font-medium">جاري تهيئة المصحف الشريف والترجمات...</span>
              </div>
              <p className="text-[10px] text-slate-600">سيستغرق هذا لحظة واحدة فقط لتنزيل قاعدة البيانات في الذاكرة.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Elegant error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900/80 border border-rose-500/20 p-8 rounded-3xl max-w-md text-center flex flex-col items-center gap-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-rose-400">خطأ في تهيئة التطبيق</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-2.5 rounded-xl border border-slate-750 text-xs font-semibold cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Premium Glassmorphic Top Navbar */}
      <nav className="sticky top-0 z-50 bg-[#090d16]/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <span className="font-arabic font-extrabold text-lg bg-gradient-to-r from-slate-100 to-emerald-300 bg-clip-text text-transparent">
            الباحث القرآني الذكي
          </span>
        </div>

        {/* Premium Tab Buttons */}
        <div className="flex items-center bg-slate-950/80 border border-slate-850 p-1 rounded-2xl shadow-inner">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
              activeTab === 'search'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-950/50'
                : 'border border-transparent text-slate-400 hover:text-slate-250 hover:bg-slate-900/40'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>الباحث الذكي</span>
          </button>
          
          <button
            onClick={() => setActiveTab('mushaf')}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
              activeTab === 'mushaf'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-950/50'
                : 'border border-transparent text-slate-400 hover:text-slate-250 hover:bg-slate-900/40'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>المصحف الشريف</span>
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>قاعدة البيانات كاملة</span>
          </div>
          <span className="text-slate-800">|</span>
          <div className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>بثلاث لغات</span>
          </div>
        </div>
      </nav>

      {/* Tab Conditional Rendering */}
      {activeTab === 'search' ? (
        <>
          {/* Hero Search Header */}
          <SearchHeader 
            query={query} 
            setQuery={setQuery} 
            resultsCount={finalResults.length} 
            totalCount={quranData.length} 
          />

          {/* Main Grid Content */}
          <div className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-6 flex flex-col lg:flex-row-reverse gap-8 flex-grow">
            
            {/* Left Side: Surah Navigation Panel (30% width) */}
            <aside className="w-full lg:w-[350px] flex-shrink-0 flex flex-col gap-4">
              <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
                
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">سورة وتصفح سريع</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">114 سورة</span>
                </div>

                {/* Scrollable Surah Grid list */}
                <div className="max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-1 flex flex-col gap-1.5 custom-scrollbar">
                  {filteredSurahsList.map((surah) => {
                    const isCurrent = Number(selectedSurah) === surah.id;
                    return (
                      <button
                        key={surah.id}
                        onClick={() => {
                          setSelectedSurah(isCurrent ? '' : String(surah.id));
                          // If a different surah is clicked, clear Juz filter to prevent empty intersections
                          setSelectedJuz('');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-right transition-all duration-200 cursor-pointer ${
                          isCurrent 
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-950/20' 
                            : 'bg-slate-950/40 border-slate-900 hover:border-slate-850 hover:bg-slate-900/60 text-slate-300'
                        }`}
                      >
                        {/* English details */}
                        <div className="text-left font-sans flex flex-col">
                          <span className={`text-xs font-semibold ${isCurrent ? 'text-emerald-300' : 'text-slate-300'}`}>
                            {surah.name_en}
                          </span>
                          <span className="text-[9px] text-slate-500 tracking-wide font-light">
                            {surah.name_en_translation}
                          </span>
                        </div>

                        {/* Arabic details */}
                        <div className="flex items-center gap-3">
                          <div className="text-right flex flex-col">
                            <span className="text-sm font-bold font-arabic tracking-wide">
                              {surah.name_ar}
                            </span>
                            <span className="text-[9px] text-slate-500">
                              {surah.type === 'Meccan' ? 'مكية' : 'مدنية'}
                            </span>
                          </div>
                          
                          {/* Surah Number Bubble */}
                          <span className={`w-7 h-7 rounded-lg text-[10px] font-bold font-sans flex items-center justify-center border transition-all ${
                            isCurrent 
                              ? 'bg-emerald-500/25 border-emerald-400/40 text-emerald-200' 
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}>
                            {surah.id}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Right Side: Search Results & Filter Controls (70% width) */}
            <main className="flex-1 flex flex-col gap-6">
              
              {/* Advanced Filter Panel */}
              <FilterPanel 
                surahs={surahsData} 
                selectedSurah={selectedSurah} 
                setSelectedSurah={setSelectedSurah} 
                selectedJuz={selectedJuz} 
                setSelectedJuz={setSelectedJuz} 
                selectedType={selectedType} 
                setSelectedType={setSelectedType}
                activeReciter={activeReciter}
                setActiveReciter={setActiveReciter}
                onReset={handleResetFilters}
              />


              {/* Results Grid List */}
              <div className="flex flex-col gap-6 w-full">
                
                {/* Header message of what is being viewed */}
                <div className="flex items-center justify-between text-sm px-2 text-slate-400 font-semibold border-l-2 border-emerald-500 pl-3">
                  {isBrowsingDefault ? (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>تصفح افتراضي: <strong className="text-slate-200">سورة الفاتحة (فاتحة الكتاب)</strong></span>
                    </div>
                  ) : (
                    <span>
                      عرض <strong className="text-emerald-400 font-bold">{Math.min(displayedCount, visibleCount)}</strong> من أصل <strong className="text-slate-200">{displayedCount}</strong> نتيجة مطابقة
                    </span>
                  )}
                  
                  {!isBrowsingDefault && hasActiveFilters && (
                    <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-lg">
                      فلاتر مفعّلة
                    </span>
                  )}
                </div>

                {/* Verses Loop */}
                {displayedResults.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    {displayedResults.map((verse) => (
                      <VerseCard 
                        key={verse.id} 
                        verse={verse} 
                        surahName={surahMap[verse.surah] || `سورة ${verse.surah}`}
                        searchQueryParams={query}
                        isPlaying={playingVerseId === verse.id}
                        onPlayToggle={() => handlePlayToggle(verse.id)}
                      />
                    ))}


                    {/* Load More Button for paginated search results */}
                    {!isBrowsingDefault && finalResults.length > visibleCount && (
                      <button
                        onClick={() => setVisibleCount(prev => prev + 25)}
                        className="w-full bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 py-4 px-6 rounded-2xl text-sm font-semibold text-slate-300 hover:text-emerald-400 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md"
                      >
                        <ChevronDown className="w-4 h-4" />
                        <span>عرض المزيد من النتائج ({finalResults.length - visibleCount} آية إضافية)</span>
                      </button>
                    )}
                  </div>
                ) : (
                  /* No Results State */
                  <div className="w-full bg-slate-900/20 border border-slate-900 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                      <Compass className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-bold text-slate-200">لا توجد نتائج مطابقة لبحثك</h3>
                      <p className="text-sm text-slate-500 max-w-md">
                        تأكد من كتابة الكلمات بشكل صحيح، أو حاول إزالة التشكيل، أو قم بتغيير الفلاتر النشطة (مثل السورة أو الجزء المحدد).
                      </p>
                    </div>
                    <button
                      onClick={handleResetFilters}
                      className="mt-2 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-slate-100 px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
                    >
                      إعادة تعيين البحث
                    </button>
                  </div>
                )}
              </div>
            </main>
          </div>
        </>
      ) : (
        <div className="w-full flex flex-col items-center">
          {/* Elegant Internal Segmented Mode Toggle */}
          <div className="w-full max-w-md mx-auto mt-4 mb-2 flex items-center bg-slate-950/60 border border-slate-850 p-1 rounded-2xl shadow-inner">
            <button
              onClick={() => setMushafMode('digital')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                mushafMode === 'digital'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-md'
                  : 'border border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>المصحف التفاعلي (الرقمي)</span>
            </button>
            
            <button
              onClick={() => setMushafMode('printed')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                mushafMode === 'printed'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-md'
                  : 'border border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>المصحف المصور (PDF)</span>
            </button>
          </div>

          {/* Conditional Sub-Render */}
          {mushafMode === 'digital' ? (
            <MushafReader 
              quranData={quranData}
              surahsData={surahsData}
              playingVerseId={playingVerseId}
              handlePlayToggle={handlePlayToggle}
              activeReciter={activeReciter}
              setActiveReciter={setActiveReciter}
              autoplay={autoplay}
              setAutoplay={setAutoplay}
            />
          ) : (
            <PdfMushafReader 
              quranData={quranData}
              surahsData={surahsData}
            />
          )}
        </div>
      )}

      {/* Elegant Footer */}
      <footer className="w-full py-8 text-center text-xs text-slate-600 border-t border-slate-900 bg-slate-950/40">
        <p className="font-sans">
          © {new Date().getFullYear()} Quran Smart Search. Built with React, Tailwind CSS and Uthmani Database.
        </p>
        <p className="mt-1 font-arabic text-[11px] opacity-75">
          صدقة جارية • اللهم تقبل منا ومنكم صالح الأعمال
        </p>
      </footer>
    </div>
  );
}

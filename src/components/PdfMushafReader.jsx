import React, { useState, useEffect, useMemo } from 'react';
import { Bookmark, BookOpen, ChevronRight, ChevronLeft, Settings, Compass, Search, AlignRight } from 'lucide-react';

export default function PdfMushafReader({ quranData, surahsData }) {
  // Page Navigation State
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfOffset, setPdfOffset] = useState(0);
  const [pageInput, setPageInput] = useState('1');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Bookmark State
  const [bookmark, setBookmark] = useState(null);

  // Load bookmark & offset on mount
  useEffect(() => {
    const savedBookmark = localStorage.getItem('quran_pdf_bookmark');
    if (savedBookmark) {
      setBookmark(JSON.parse(savedBookmark));
    }
    const savedOffset = localStorage.getItem('quran_pdf_offset');
    if (savedOffset) {
      setPdfOffset(Number(savedOffset));
    }
  }, []);

  // Update input text when current page changes
  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  // Dynamically calculate the starting page of all 114 Surahs from quranData
  const surahStartPages = useMemo(() => {
    const pages = {};
    quranData.forEach((verse) => {
      if (!pages[verse.surah]) {
        pages[verse.surah] = verse.page;
      }
    });
    return pages;
  }, [quranData]);

  // Dynamically calculate the starting page of all 30 Juz' from quranData
  const juzStartPages = useMemo(() => {
    const pages = {};
    quranData.forEach((verse) => {
      if (!pages[verse.juz]) {
        pages[verse.juz] = verse.page;
      }
    });
    return pages;
  }, [quranData]);

  // Navigation handlers
  const handleNextPage = () => {
    if (currentPage < 604) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const parsedPage = Number(pageInput);
    if (parsedPage >= 1 && parsedPage <= 604) {
      setCurrentPage(parsedPage);
    } else {
      setPageInput(String(currentPage));
    }
  };

  // Adjust page offset & persist
  const handleOffsetChange = (val) => {
    const newOffset = pdfOffset + val;
    setPdfOffset(newOffset);
    localStorage.setItem('quran_pdf_offset', String(newOffset));
  };

  // Save PDF Bookmark
  const handleSaveBookmark = () => {
    // Find which Surah corresponds to this page (approximately)
    let currentSurahName = 'سورة الفاتحة';
    let closestDiff = 999;
    
    surahsData.forEach((s) => {
      const startPage = surahStartPages[s.id] || 1;
      if (currentPage >= startPage) {
        const diff = currentPage - startPage;
        if (diff >= 0 && diff < closestDiff) {
          closestDiff = diff;
          currentSurahName = s.name_ar;
        }
      }
    });

    const newBookmark = {
      page: currentPage,
      surahName: currentSurahName
    };

    localStorage.setItem('quran_pdf_bookmark', JSON.stringify(newBookmark));
    setBookmark(newBookmark);
  };

  // Clear PDF Bookmark
  const handleClearBookmark = (e) => {
    e.stopPropagation();
    localStorage.removeItem('quran_pdf_bookmark');
    setBookmark(null);
  };

  // Jump to saved PDF bookmark
  const handleJumpToBookmark = () => {
    if (bookmark) {
      setCurrentPage(bookmark.page);
    }
  };

  // Calculate current Surah name for the header title
  const activeSurahName = useMemo(() => {
    let activeName = 'سورة الفاتحة';
    let closestStart = 1;
    
    surahsData.forEach((s) => {
      const startPage = surahStartPages[s.id] || 1;
      if (currentPage >= startPage && startPage >= closestStart) {
        closestStart = startPage;
        activeName = s.name_ar;
      }
    });
    return activeName;
  }, [currentPage, surahsData, surahStartPages]);

  // Calculate current Juz number
  const activeJuzNumber = useMemo(() => {
    let activeJuz = 1;
    let closestStart = 1;
    
    for (let j = 1; j <= 30; j++) {
      const startPage = juzStartPages[j] || 1;
      if (currentPage >= startPage && startPage >= closestStart) {
        closestStart = startPage;
        activeJuz = j;
      }
    }
    return activeJuz;
  }, [currentPage, juzStartPages]);

  // Embed source URL with hash page parameter
  const pdfUrl = useMemo(() => {
    const pageNum = currentPage + pdfOffset;
    return `/quran.pdf#page=${pageNum}&toolbar=0&navpanes=0&scrollbar=1`;
  }, [currentPage, pdfOffset]);

  return (
    <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto py-4 animate-fade-in px-4">
      
      {/* Dynamic Bookmark Alert */}
      {bookmark && (
        <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div className="text-right">
              <h4 className="text-sm font-bold text-amber-300">لديك علامة توقف محفوظة في المصحف المصور</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                آخر قراءة كانت في الصفحة <strong className="text-slate-200">{bookmark.page}</strong> ({bookmark.surahName})
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
              <span>متابعة القراءة</span>
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
        
        {/* Left Side: Navigation Sidebar (Surahs and Juz) */}
        <aside 
          className={`w-full lg:w-[280px] bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-3xl p-5 flex flex-col gap-4 shadow-xl transition-all duration-300 ${
            sidebarOpen ? 'block' : 'hidden lg:flex'
          }`}
        >
          {/* Section Headers Toggle */}
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">فهرس المصحف المصور</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">114 سورة</span>
          </div>

          {/* Quick Scroll List */}
          <div className="max-h-[500px] lg:max-h-[700px] overflow-y-auto pr-1 flex flex-col gap-1.5 custom-scrollbar" dir="rtl">
            
            {/* Juz Quick Buttons */}
            <div className="mb-4">
              <span className="text-[10px] text-slate-500 font-bold block mb-2 mr-1">الانتقال السريع للأجزاء</span>
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
                  const startPage = juzStartPages[juzNum] || 1;
                  const isCurrentJuz = activeJuzNumber === juzNum;
                  return (
                    <button
                      key={juzNum}
                      onClick={() => setCurrentPage(startPage)}
                      className={`py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                        isCurrentJuz
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-slate-950/40 border-slate-900 hover:border-slate-850 hover:bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                      title={`الجزء ${juzNum} - يبدأ بصفحة ${startPage}`}
                    >
                      ج{juzNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Surah List */}
            <div>
              <span className="text-[10px] text-slate-500 font-bold block mb-2 mr-1">الفهرس التفصيلي للسور</span>
              <div className="flex flex-col gap-1">
                {surahsData.map((surah) => {
                  const startPage = surahStartPages[surah.id] || 1;
                  const isCurrentSurah = activeSurahName === surah.name_ar;
                  return (
                    <button
                      key={surah.id}
                      onClick={() => setCurrentPage(startPage)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isCurrentSurah
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-950/20'
                          : 'bg-slate-950/40 border-slate-900 hover:border-slate-850 hover:bg-slate-900/60 text-slate-350'
                      }`}
                    >
                      {/* Name */}
                      <span className="text-xs font-extrabold font-arabic">
                        {surah.id}. {surah.name_ar}
                      </span>
                      {/* Page Bubble */}
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold border ${
                        isCurrentSurah
                          ? 'bg-emerald-500/25 border-emerald-400/40 text-emerald-200'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}>
                        ص {startPage}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </aside>

        {/* Right Side: PDF Viewer Content Area */}
        <main className="flex-1 flex flex-col gap-4">
          
          {/* Toolbar Header Dashboard */}
          <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-3xl p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
            
            {/* Left Controls: Sidebar toggle & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 bg-slate-950 border border-slate-850 hover:border-slate-800 hover:bg-slate-900 rounded-xl cursor-pointer text-slate-400 hover:text-slate-200 transition-all lg:hidden"
                title="تصفح الفهرس"
              >
                <AlignRight className="w-4 h-4" />
              </button>

              <div className="text-right lg:text-left">
                <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                  <span className="font-arabic text-emerald-400 text-lg">{activeSurahName}</span>
                  <span className="text-slate-600 font-light">•</span>
                  <span className="text-xs text-slate-400 font-semibold bg-slate-950 px-2.5 py-1 border border-slate-850 rounded-lg">
                    الجزء {activeJuzNumber}
                  </span>
                </h3>
              </div>
            </div>

            {/* Middle Controls: Page Navigation & Manual Input */}
            <div className="flex items-center bg-slate-950 border border-slate-850 rounded-2xl p-1 shadow-inner">
              {/* Prev Page (goes right in Islamic sequence) */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  currentPage === 1
                    ? 'text-slate-800 pointer-events-none'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="الصفحة السابقة"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Form Input */}
              <form onSubmit={handlePageInputSubmit} className="flex items-center px-1">
                <input
                  type="text"
                  value={pageInput}
                  onChange={handlePageInputChange}
                  className="w-12 bg-slate-900 border border-slate-800 rounded-lg text-center text-xs font-bold font-mono text-emerald-400 py-1 outline-none focus:border-emerald-500/40"
                />
                <span className="text-[10px] text-slate-600 font-bold px-1.5 select-none font-mono">/ 604</span>
              </form>

              {/* Next Page */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === 604}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  currentPage === 604
                    ? 'text-slate-800 pointer-events-none'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title="الصفحة التالية"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Right Controls: Bookmark & Page Calibration */}
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {/* Calibration Settings Dropdown Toggle */}
              <div className="relative group">
                <button
                  className="p-2 bg-slate-950 border border-slate-850 hover:border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                  title="معايرة صفحات الـ PDF"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-[10px] font-bold">إزاحة الغلاف ({pdfOffset > 0 ? `+${pdfOffset}` : pdfOffset})</span>
                </button>
                
                {/* Calibration Dropdown Tooltip Drawer */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl backdrop-blur-md hidden group-hover:block hover:block z-30 animate-fade-in" dir="rtl">
                  <span className="text-[10px] text-slate-400 font-bold block mb-2">معايرة صفحات الغلاف:</span>
                  <p className="text-[9px] text-slate-500 leading-normal mb-3">
                    إذا كانت الصفحة المعروضة لا تطابق السورة، اضغط على الأزرار أدناه لتغيير إزاحة صفحات الـ PDF التمهيدية.
                  </p>
                  <div className="flex items-center justify-between bg-slate-950 border border-slate-850 rounded-xl p-1">
                    <button
                      onClick={() => handleOffsetChange(-1)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-300 rounded-lg cursor-pointer transition-all"
                    >
                      -1
                    </button>
                    <span className="text-xs font-mono font-bold text-emerald-400">{pdfOffset}</span>
                    <button
                      onClick={() => handleOffsetChange(1)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-300 rounded-lg cursor-pointer transition-all"
                    >
                      +1
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setPdfOffset(0);
                      localStorage.setItem('quran_pdf_offset', '0');
                    }}
                    className="w-full text-center mt-2.5 text-[8px] font-bold text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                  >
                    إعادة تعيين الافتراضي (0)
                  </button>
                </div>
              </div>

              {/* Bookmark Save Button */}
              <button
                onClick={handleSaveBookmark}
                className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/30 text-amber-300 text-xs font-extrabold rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-amber-950/20"
                title="حفظ علامة التوقف عند هذه الصفحة"
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                <span>علامة التوقف</span>
              </button>
            </div>

          </div>

          {/* PDF Viewer Frame */}
          <div className="w-full bg-slate-950/50 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl h-[700px] lg:h-[800px] relative">
            <iframe 
              src={pdfUrl}
              className="w-full h-full border-none rounded-3xl"
              title="Quran Printed PDF Mushaf"
              allow="fullscreen"
            />
          </div>

        </main>
      </div>

    </div>
  );
}

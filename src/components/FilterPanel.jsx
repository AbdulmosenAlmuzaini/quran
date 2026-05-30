import React from 'react';
import { Filter, RotateCcw, Compass, MapPin } from 'lucide-react';

export default function FilterPanel({ 
  surahs, 
  selectedSurah, 
  setSelectedSurah, 
  selectedJuz, 
  setSelectedJuz, 
  selectedType, 
  setSelectedType, 
  activeReciter,
  setActiveReciter,
  onReset 
}) {
  
  // Array of 30 Juz's
  const juzOptions = Array.from({ length: 30 }, (_, i) => i + 1);

  // Famous Reciters list
  const reciterOptions = [
    { id: 'ar.alafasy', name: 'مشاري راشد العفاسي' },
    { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط (مرتل)' },
    { id: 'ar.abdulsamad', name: 'عبد الباسط (مجود)' },
    { id: 'ar.husary', name: 'محمود خليل الحصري' },
    { id: 'ar.minshawi', name: 'محمد صديق المنشاوي' },
    { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي' },
    { id: 'ar.saoodshuraym', name: 'سعود الشريم' },
    { id: 'en.walk', name: 'إبراهيم ووك (ترجمة إنجليزية)' }
  ];



  // Check if any filter is active
  const hasActiveFilters = selectedSurah || selectedJuz || selectedType !== 'all';

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col gap-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span>تصفية النتائج والخيارات</span>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-rose-500/15 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة تعيين</span>
          </button>
        )}
      </div>

      {/* Filter Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Surah Dropdown Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-bold text-right flex items-center justify-end gap-1">
            <span>اختر السورة</span>
            <Compass className="w-3.5 h-3.5 text-slate-500" />
          </label>
          <select
            value={selectedSurah}
            onChange={(e) => setSelectedSurah(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-3 text-slate-200 text-sm outline-none transition-all cursor-pointer font-sans"
            dir="rtl"
          >
            <option value="">كل السور (114 سورة)</option>
            {surahs.map((surah) => (
              <option key={surah.id} value={surah.id}>
                {surah.id}. {surah.name_ar} ({surah.name_en})
              </option>
            ))}
          </select>
        </div>

        {/* Juz Dropdown Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-bold text-right flex items-center justify-end gap-1">
            <span>اختر الجزء</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">1-30</span>
          </label>
          <select
            value={selectedJuz}
            onChange={(e) => setSelectedJuz(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-3 text-slate-200 text-sm outline-none transition-all cursor-pointer font-sans"
            dir="rtl"
          >
            <option value="">كل الأجزاء (30 جزءاً)</option>
            {juzOptions.map((juz) => (
              <option key={juz} value={juz}>
                الجزء {juz}
              </option>
            ))}
          </select>
        </div>

        {/* Reciter Dropdown Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-bold text-right flex items-center justify-end gap-1">
            <span>اختر القارئ</span>
            <span className="text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-bold">صوت</span>
          </label>
          <select
            value={activeReciter}
            onChange={(e) => setActiveReciter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 px-3 text-slate-200 text-sm outline-none transition-all cursor-pointer font-sans"
            dir="rtl"
          >
            {reciterOptions.map((reciter) => (
              <option key={reciter.id} value={reciter.id}>
                {reciter.name}
              </option>
            ))}
          </select>
        </div>

        {/* Revelation Type Toggle Tabs */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-bold text-right flex items-center justify-end gap-1">
            <span>مكان النزول</span>
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
          </label>
          
          <div className="w-full bg-slate-950 border border-slate-850 rounded-xl p-1 flex items-center h-[42px]">
            <button
              onClick={() => setSelectedType('all')}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                selectedType === 'all' 
                  ? 'bg-slate-800 text-slate-100 border border-slate-700/50 shadow' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedType('Meccan')}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                selectedType === 'Meccan' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              مكي
            </button>
            <button
              onClick={() => setSelectedType('Medinan')}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                selectedType === 'Medinan' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              مدني
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}


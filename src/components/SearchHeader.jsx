import React from 'react';
import { Search, X, BookOpen, Compass, Flame } from 'lucide-react';

export default function SearchHeader({ query, setQuery, resultsCount, totalCount }) {
  
  // Suggested Searches
  const suggestions = [
    { label: "الحمد لله", value: "الحمد لله" },
    { label: "الرحمن الرحيم", value: "الرحمن الرحيم" },
    { label: "آية الكرسي (2:255)", value: "2:255" },
    { label: "In the name of Allah", value: "in the name of allah" },
    { label: "Merciful", value: "merciful" },
  ];

  return (
    <div className="w-full flex flex-col gap-6 items-center text-center py-8 md:py-12 px-4 border-b border-slate-800/50 bg-radial-[at_top] from-emerald-950/20 via-transparent to-transparent">
      {/* Branding Logo & Title */}
      <div className="flex flex-col items-center gap-4">
        {/* Glow emblem */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center animate-bounce-slow">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
            <Compass className="w-8 h-8" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-emerald-100 to-teal-300 bg-clip-text text-transparent">
            الباحث القرآني الذكي
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl font-light leading-relaxed">
            محرك بحث تفاعلي فائق السرعة للبحث بالرسم العثماني، التشكيل، الترجمة الإنجليزية، والكتابة اللاتينية الصوتية. تصفية ذكية ولحظية للنتائج بدون إشغار أو إعادة تحميل الصفحة.
          </p>
        </div>
      </div>

      {/* Main Search Input */}
      <div className="w-full max-w-2xl relative mt-4 group">
        {/* Background glow on focus */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-25 group-focus-within:opacity-40 transition duration-300" />
        
        <div className="relative w-full bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center p-1.5 shadow-2xl focus-within:border-emerald-500/50 transition-all duration-300">
          <div className="p-3 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بكلمة، آية، ترجمة إنجليزية، أو رقم السورة والآية (مثال: 2:255)..."
            className="w-full bg-transparent border-0 outline-0 py-3 px-1 text-slate-100 placeholder-slate-500 text-base md:text-lg text-right md:text-right font-sans font-medium"
            dir="auto"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-3 text-slate-500 hover:text-slate-200 transition-colors rounded-xl hover:bg-slate-800"
              title="مسح البحث"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Suggestions */}
      <div className="flex flex-wrap justify-center items-center gap-2 max-w-2xl mt-1">
        <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          جرّب البحث عن:
        </span>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setQuery(s.value)}
            className="text-xs bg-slate-900/80 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/25 px-3 py-1.5 rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Statistics Banner */}
      {query && (
        <div className="mt-2 animate-fade-in">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs md:text-sm font-semibold px-4 py-2 rounded-xl shadow-md">
            تم العثور على <strong className="text-emerald-300 font-bold mx-1">{resultsCount}</strong> آية من أصل {totalCount} آية
          </span>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Copy, Check, Share2, Eye, EyeOff, Play, Pause, Volume2 } from 'lucide-react';
import { highlightText } from '../utils/searchEngine';

export default function VerseCard({ verse, surahName, searchQueryParams = '', isPlaying = false, onPlayToggle }) {
  const [copied, setCopied] = useState(false);
  const [showTrans, setShowTrans] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  // Cancel any speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-To-Speech for English Translation
  const handleSpeakEnglish = () => {
    if ('speechSynthesis' in window) {
      // Pause Arabic recitation first if it's running
      if (isPlaying) {
        onPlayToggle();
      }

      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(verse.en);
      
      // Get all available system voices
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      
      // Prioritize the deepest, most prestigious & luxurious male voices (Natural British / US voices)
      let luxuriousVoice = null;
      
      // 1. Natural Deep British or US Premium Male Voices (Brian, Ryan, Guy, etc.)
      luxuriousVoice = englishVoices.find(v => {
        const name = v.name.toLowerCase();
        return name.includes('natural') && (name.includes('brian') || name.includes('ryan') || name.includes('guy') || name.includes('male'));
      });
      
      // 2. Prestigious British Male Voices (Brian, George, Daniel - famous for deep, royal British tones)
      if (!luxuriousVoice) {
        luxuriousVoice = englishVoices.find(v => {
          const name = v.name.toLowerCase();
          const lang = v.lang.toLowerCase();
          return (lang.includes('gb') || lang.includes('uk')) && (name.includes('brian') || name.includes('george') || name.includes('daniel') || name.includes('male'));
        });
      }
      
      // 3. Google/Microsoft Natural US Male Voices (Guy, Ryan, David)
      if (!luxuriousVoice) {
        luxuriousVoice = englishVoices.find(v => {
          const name = v.name.toLowerCase();
          return name.includes('guy') || name.includes('ryan') || name.includes('david') || name.includes('male');
        });
      }
      
      // 4. Fallback to standard system male voices (Alex, etc.)
      if (!luxuriousVoice) {
        luxuriousVoice = englishVoices.find(v => {
          const name = v.name.toLowerCase();
          return name.includes('alex') || name.includes('male');
        });
      }
      
      // 5. Fallback to any English voice
      if (!luxuriousVoice && englishVoices.length > 0) {
        luxuriousVoice = englishVoices[0];
      }
      
      if (luxuriousVoice) {
        utterance.voice = luxuriousVoice;
      }
      
      utterance.lang = 'en-US';
      utterance.pitch = 0.92; // Lowered pitch to make the voice sound deeper, warmer, and more luxurious
      utterance.rate = 0.82;  // Calm, majestic, and slower pace for dignified reading


      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert("عذراً، متصفحك لا يدعم خاصية نطق النصوص.");
    }
  };



  // Copy Verse to Clipboard
  const handleCopy = () => {
    const textToCopy = `﴿${verse.ar}﴾ [سورة ${surahName}: آية ${verse.ayah}]\n\n${verse.en}\n\n(Transliteration: ${verse.trans})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share Verse
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `آية من سورة ${surahName}`,
        text: `﴿${verse.ar}﴾ [سورة ${surahName}: آية ${verse.ayah}]\n\n${verse.en}`,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      handleCopy();
      alert('تم نسخ الرابط والآية للمشاركة!');
    }
  };

  // Render Highlighted Arabic Text
  const renderArabic = () => {
    const highlighted = highlightText(verse.ar, searchQueryParams, true);
    return (
      <p 
        className="arabic-text text-right text-3xl md:text-4xl text-slate-100 leading-loose md:leading-relaxed font-arabic tracking-wide select-all"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  };

  // Render Highlighted English Text
  const renderEnglish = () => {
    const highlighted = highlightText(verse.en, searchQueryParams, false);
    return (
      <p 
        className="text-left text-slate-300 text-base md:text-lg leading-relaxed select-all"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  };

  // Render Highlighted Transliteration
  const renderTransliteration = () => {
    const highlighted = highlightText(verse.trans, searchQueryParams, false);
    return (
      <p 
        className="text-left text-slate-400 italic text-sm md:text-base leading-relaxed select-all font-light"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  };

  return (
    <div className={`w-full backdrop-blur-md rounded-2xl p-6 md:p-8 transition-all duration-500 shadow-lg flex flex-col gap-6 relative group overflow-hidden border ${
      isPlaying 
        ? 'bg-slate-900/95 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30' 
        : 'bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/80'
    }`}>
      {/* Background glow on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header / Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-2">
          {/* Verse Address Badge */}
          <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs md:text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <span className="font-bold">{surahName}</span>
            <span className="text-emerald-500/40">•</span>
            <span>الآية {verse.ayah}</span>
          </div>

          {/* Juz Badge */}
          <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2.5 py-1.5 rounded-full">
            الجزء {verse.juz}
          </div>

          {/* Page Badge */}
          <div className="bg-slate-800 text-slate-400 text-xs px-2.5 py-1.5 rounded-full border border-slate-700/50">
            الصفحة {verse.page}
          </div>

          {/* Sajda Badge */}
          {verse.sajda === 1 && (
            <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs px-2.5 py-1.5 rounded-full font-medium flex items-center gap-1 animate-pulse">
              سجدة تلاوة
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Play/Pause Recitation */}
          <button 
            onClick={onPlayToggle}
            className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
              isPlaying 
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-pulse' 
                : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-emerald-400'
            }`}
            title={isPlaying ? "إيقاف التلاوة" : "تشغيل التلاوة"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Show/Hide Transliteration */}
          <button 
            onClick={() => setShowTrans(!showTrans)}
            className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
              showTrans 
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-emerald-400' 
                : 'bg-transparent border-slate-850 text-slate-500 hover:text-slate-300'
            }`}
            title={showTrans ? "إخفاء الكتابة اللاتينية" : "إظهار الكتابة اللاتينية"}
          >
            {showTrans ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Show/Hide Translation */}
          <button 
            onClick={() => setShowTranslation(!showTranslation)}
            className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
              showTranslation 
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-emerald-400' 
                : 'bg-transparent border-slate-850 text-slate-500 hover:text-slate-300'
            }`}
            title={showTranslation ? "إخفاء الترجمة الإنجليزية" : "إظهار الترجمة الإنجليزية"}
          >
            <span className="text-xs font-semibold px-0.5">EN</span>
          </button>

          {/* Copy Button */}
          <button 
            onClick={handleCopy}
            className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
              copied 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="نسخ الآية"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Share Button */}
          <button 
            onClick={handleShare}
            className="p-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all duration-200 cursor-pointer"
            title="مشاركة الآية"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Arabic Content */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-end gap-4">
          {renderArabic()}
          {/* Elegant Verse Divider (Ayah number in Arabic design) */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-emerald-500/25 flex items-center justify-center text-xs font-bold text-emerald-400 font-arabic select-none bg-emerald-500/5 mt-1.5">
            {verse.ayah}
          </div>
        </div>
      </div>

      {/* Translations and Transliterations */}
      {(showTranslation || showTrans) && (
        <div className="flex flex-col gap-3 border-t border-slate-800/40 pt-4 mt-2">
          {showTrans && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold tracking-wider text-left uppercase">Transliteration</span>
              {renderTransliteration()}
            </div>
          )}
          {showTranslation && showTrans && <div className="h-px bg-slate-800/30 my-1" />}
          {showTranslation && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] text-slate-500 font-bold tracking-wider text-left uppercase">English Translation (Saheeh International)</span>
                <button
                  onClick={handleSpeakEnglish}
                  className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                    speaking 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)] animate-pulse' 
                      : 'bg-slate-800/20 border-transparent hover:border-slate-700/50 text-slate-500 hover:text-emerald-400 hover:bg-slate-800/60'
                  }`}
                  title={speaking ? "إيقاف القراءة الصوتية" : "قراءة الترجمة بالإنجليزية بصوت واضح"}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {renderEnglish()}
            </div>
          )}

        </div>
      )}
    </div>
  );
}

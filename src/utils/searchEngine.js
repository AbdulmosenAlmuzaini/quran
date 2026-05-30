/**
 * Normalizes Arabic text by removing diacritics (Tashkeel), Tatweel,
 * and normalizing letters (Alef, Teh Marbuta, Alef Maksura) to basic forms.
 */
export function normalizeArabic(text) {
  if (!text) return "";
  
  // Remove diacritics (tashkeel): Fatha, Damma, Kasra, Sukun, Shadda, Tanween, Superscript Alef
  let normalized = text.replace(/[\u064B-\u065F\u0670]/g, "");
  
  // Normalize Alefs (أ, إ, آ, ٱ) to bare Alef (ا)
  normalized = normalized.replace(/[أإآٱ]/g, "ا");
  
  // Normalize Teh Marbuta (ة) to Heh (ه)
  normalized = normalized.replace(/ة/g, "ه");
  
  // Normalize Alef Maksura (ى) to Yeh (ي)
  normalized = normalized.replace(/ى/g, "ي");
  
  // Remove Tatweel/Kashida (ـ)
  normalized = normalized.replace(/ـ/g, "");
  
  return normalized;
}

/**
 * Searches the Quran database in Arabic, English, and Transliteration.
 * Supports multi-word queries.
 * 
 * @param {Array} quranData The parsed Quran JSON data array.
 * @param {string} query The raw search query.
 * @param {Object} filters Additional filters { surahId, juzId, revelationType }
 * @returns {Array} List of matching verses with match metadata.
 */
export function searchQuran(quranData, query, filters = {}) {
  if (!quranData) return [];
  
  const cleanQuery = query ? query.trim().toLowerCase() : "";
  const normalizedArQuery = query ? normalizeArabic(cleanQuery) : "";
  const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 0);
  const normalizedArWords = normalizedArQuery.split(/\s+/).filter(w => w.length > 0);
  
  return quranData.filter(item => {
    // Apply Filters First
    if (filters.surahId && item.surah !== Number(filters.surahId)) {
      return false;
    }
    if (filters.juzId && item.juz !== Number(filters.juzId)) {
      return false;
    }
    
    // If query is empty, we return all matching the filters
    if (queryWords.length === 0) {
      return true;
    }
    
    // Prepare search fields
    const itemEn = item.en.toLowerCase();
    const itemTrans = item.trans.toLowerCase();
    const itemArNormalized = normalizeArabic(item.ar);
    
    // Smart matching: every query word must match at least one of the fields
    return queryWords.every((word, idx) => {
      const arWord = normalizedArWords[idx];
      
      // Match word in English translation, Transliteration, or Normalized Arabic
      return (
        itemEn.includes(word) ||
        itemTrans.includes(word) ||
        (arWord && itemArNormalized.includes(arWord)) ||
        // Check if query matches specific Surah:Ayah format, e.g., "2:255"
        (word.includes(":") && `${item.surah}:${item.ayah}`.startsWith(word))
      );
    });
  });
}

/**
 * Helper function to highlight text in search results.
 * Wraps matches in a tag for rendering in React.
 */
export function highlightText(text, query, isArabic = false) {
  if (!text || !query) return text;
  
  const cleanQuery = query.trim();
  if (!cleanQuery) return text;
  
  if (isArabic) {
    // Arabic highlighting is complex because of diacritics.
    // We will do a character-by-character mapping of normalized index back to raw text.
    try {
      const normalized = normalizeArabic(text);
      const normalizedQuery = normalizeArabic(cleanQuery);
      const queryLength = normalizedQuery.length;
      
      if (!normalizedQuery || !normalized.includes(normalizedQuery)) {
        return text;
      }
      
      // Find all start indices in the normalized text
      const matches = [];
      let idx = normalized.indexOf(normalizedQuery);
      while (idx !== -1) {
        matches.push(idx);
        idx = normalized.indexOf(normalizedQuery, idx + 1);
      }
      
      if (matches.length === 0) return text;
      
      // Now, map normalized indices back to raw text indices
      // We will trace which character in `text` maps to which character in `normalized`
      const rawToNormMap = [];
      let normIdx = 0;
      for (let r = 0; r < text.length; r++) {
        const rawChar = text[r];
        // Check if rawChar was removed or kept during normalization
        const isDiacritic = /[\u064B-\u065F\u0670ـ]/.test(rawChar);
        if (!isDiacritic) {
          rawToNormMap[r] = normIdx;
          normIdx++;
        } else {
          rawToNormMap[r] = -1; // diacritic doesn't have a direct index
        }
      }
      
      // Reconstruct raw text with highlight tags
      let result = [];
      let lastIndex = 0;
      
      for (const mStart of matches) {
        const mEnd = mStart + queryLength; // normalized end index
        
        // Find raw start and end indices
        let rawStart = -1;
        let rawEnd = -1;
        
        // Find first raw index mapping to mStart
        for (let r = 0; r < text.length; r++) {
          if (rawToNormMap[r] === mStart && rawStart === -1) {
            rawStart = r;
          }
          if (rawToNormMap[r] === mEnd - 1) {
            rawEnd = r + 1; // inclusive end plus one
          }
        }
        
        // If rawEnd wasn't found (e.g. at the end of text), search for next valid norm mapping
        if (rawEnd === -1 && rawStart !== -1) {
          for (let r = rawStart; r < text.length; r++) {
            if (rawToNormMap[r] >= mEnd) {
              rawEnd = r;
              break;
            }
          }
          if (rawEnd === -1) rawEnd = text.length;
        }
        
        if (rawStart !== -1 && rawEnd !== -1) {
          // Add text before match
          result.push(text.slice(lastIndex, rawStart));
          // Add wrapped match
          result.push(`<mark class="bg-emerald-500/30 text-emerald-300 px-0.5 rounded">${text.slice(rawStart, rawEnd)}</mark>`);
          lastIndex = rawEnd;
        }
      }
      
      result.push(text.slice(lastIndex));
      return result.join("");
    } catch (e) {
      // Fallback
      return text;
    }
  } else {
    // English/Transliteration simple highlight
    try {
      const regex = new RegExp(`(${cleanQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi');
      return text.replace(regex, `<mark class="bg-brand-400/30 text-amber-300 font-semibold px-0.5 rounded">$1</mark>`);
    } catch (e) {
      return text;
    }
  }
}

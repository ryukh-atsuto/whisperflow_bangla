// Banglish normalization and dialect correction library.
// Following MVC, this is part of the Model Layer.

const phraseCorrections: Record<string, string> = {
  "gachh er": "gacher",
  "gachh-er": "gacher",
  "gach er": "gacher",
  "gach-er": "gacher",
  "bhaat khai": "bhat khai",
  "bhaat khaitasi": "bhat khacchi",
  "bhaat khaisi": "bhat kheyechi",
  "bhaat khamu": "bhat khabo",
  "bhat khaitasi": "bhat khacchi",
  "bhat khaisi": "bhat kheyechi",
  "bhat khamu": "bhat khabo",
  "bari er": "barier",
  "bari-er": "barier",
  "matha er": "mathar",
  "shobuj gach": "sobuj gacher",
  "dekh tesi": "dekhi"
};

const wordCorrections: Record<string, string> = {
  // Core mappings
  "amii": "ami",
  "amiya": "ami",
  "tmi": "tumi",
  "tumiya": "tumi",
  "she": "se",
  "amara": "amra",
  "orae": "ora",
  "khaisi": "kheyechi",
  "khaichi": "kheyechi",
  "kortesi": "korchi",
  "kortasi": "korchi",
  "kortaci": "korchi",
  "korotasi": "korchi",
  "korotesi": "korchi",
  "korotici": "korchi",
  "jaitesi": "jacchi", // User specifically requested "jaitesi → jacchi" in the new spec
  "jaitechhi": "jacchi",
  "jaitachi": "jacchi",
  "boltesi": "bolchi",
  "boltasi": "bolchi",
  "dekhtesi": "dekhi",
  "dekhtachi": "dekhi",
  "ashtesi": "ashchi",
  "astesi": "ashchi",

  // BanglishFix mappings
  "shobuj": "sobuj", // User requested "shobuj → sobuj"
  "bhalo": "valo",
  "kisu": "kichu",
  "kicchu": "kichu",
  "nai": "nei",
  "nahi": "nei",
  "hoise": "hoyeche",
  "hoiche": "hoyeche",
  "gese": "geche",
  "ashtese": "asche",
  "jacchi": "jachhi",
  "jaitasi": "jachhi",

  // Dialect mappings
  "fani": "pani", // User requested "fani → pani"
  "hani": "pani", // User requested "hani → pani"
  "fata": "pata",
  "hata": "pata",
  "fao": "pao",
  "hao": "pao",
  "fua": "pola",
  "hua": "pola",
  "furi": "meyere",
  "huri": "meyere",
  "loia": "niye",
  "loya": "niye",
  "giasi": "gechi",
  "khaitasi": "khacchi",
  "baid": "bhat",
  "zaid": "bhat",

  // Corrections list (dialects, regional, continuous verbs, etc.)
  "fara": "para",
  "hara": "para",
  "ha": "cha",
  "horil": "shoril",
  "aslo": "chilo",
  "asilo": "chilo",
  "hailam": "pailam",
  "fala": "pela",
  "hala": "pela",
  "lokto": "rokto",
  "hise": "hoise",
  "aise": "esheche",
  "giese": "giyeche",
  "zaitam": "jaitam",
  "kortici": "korchi",
  "korthasi": "korchi",
  "jaiteci": "jacchi",
  "khaitesi": "khacchi",
  "khaitici": "khacchi",
  "khaitaci": "khacchi",
  "khaytesi": "khacchi",
  "khaitechi": "khacchi",
  "koretesi": "korchi",
  "astasi": "ashchi",
  "khayesi": "kheyechi",
  "khayechi": "kheyechi",
  "korsi": "korechi",
  "korlam": "korechi",
  "daikhasi": "dekhechi",
  "dekhesi": "dekhechi",
  "gaysi": "giyechi",
  "gechi": "giyechi",
  "gesilam": "giyachilam",
  "khoj": "khuj",
  "khujteci": "khujchi",
  "asole": "assole",
  "vhalo": "valo"
};

// Helper function to match casing (UPPERCASE, Capitalized, or lowercase)
function applyCasing(original: string, replacement: string): string {
  if (!original || !replacement) return replacement;

  // Check if original is all uppercase (excluding punctuation-only or digit-only)
  if (original === original.toUpperCase() && original !== original.toLowerCase()) {
    return replacement.toUpperCase();
  }

  // Check if first character is uppercase
  if (original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }

  return replacement.toLowerCase();
}

/**
 * Normalizes Banglish terms, standardizing dialects, regional colloquial verbs,
 * and spelling typos to their standard Banglish representations.
 */
export function normalizeBanglish(text: string): string {
  if (!text) return '';

  let normalized = text;

  // 1. Phrase-level replacements (longest first)
  const phrases = Object.keys(phraseCorrections).sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    const escapedPhrase = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
    normalized = normalized.replace(regex, (match) => {
      return applyCasing(match, phraseCorrections[phrase]);
    });
  }

  // 2. Word-level tokenization and correction
  // Match letters, digits, whitespace, or punctuation
  const tokenRegex = /([a-zA-Z0-9]+|[^a-zA-Z0-9\s]+|\s+)/g;
  const tokens = normalized.match(tokenRegex) || [];

  const processedTokens = tokens.map(token => {
    // If it's a word-like alphabetic string
    if (/^[a-zA-Z0-9]+$/.test(token)) {
      const lowerToken = token.toLowerCase();
      if (wordCorrections[lowerToken]) {
        return applyCasing(token, wordCorrections[lowerToken]);
      }
    }
    return token;
  });

  return processedTokens.join('');
}

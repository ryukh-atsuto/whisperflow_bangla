import { PHONETIC_FIX } from "./phoneticFix";
import { phoneticMatch } from "./phoneticMatch";
import { phoneticRules } from "./phoneticRules";
import { closestDictionaryMatch, BANGLA_DICTIONARY } from "./dictionary";

export function cleanPhoneticInput(text: string): string {
  if (!text) return "";
  // 1. Lowercase and pre-replace multi-word keys from PHONETIC_FIX
  let cleaned = text.toLowerCase();
  for (const [key, value] of Object.entries(PHONETIC_FIX)) {
    if (key.includes(" ")) {
      const regex = new RegExp(`\\b${key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
      cleaned = cleaned.replace(regex, value);
    }
  }

  // 2. Apply general phonetic rules
  cleaned = phoneticRules(cleaned);

  // 3. Split by whitespace and process individual words
  return cleaned
    .split(/\s+/)
    .map(word => {
      if (!word) return "";
      const lower = word.toLowerCase();

      if (PHONETIC_FIX[lower]) return PHONETIC_FIX[lower];
      if (BANGLA_DICTIONARY.has(lower)) return lower;

      const fuzzy = phoneticMatch(lower);
      const rule = phoneticRules(fuzzy);

      return closestDictionaryMatch(rule);
    })
    .filter(Boolean)
    .join(" ");
}

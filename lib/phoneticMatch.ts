import { PHONETIC_FIX } from "./phoneticFix";
import { BANGLA_DICTIONARY } from "./dictionary";

export function phoneticMatch(word: string): string {
  const lower = word.toLowerCase();

  if (PHONETIC_FIX[lower]) return PHONETIC_FIX[lower];
  if (BANGLA_DICTIONARY.has(lower)) return lower;

  // Specific phonetic rules rather than overly broad startsWith/endsWith patterns
  if (lower === "kaadz" || lower === "kaaz" || lower === "kaz") return "kaaj";
  if (lower === "khai" || lower === "kai" || lower === "khae") return "khai";
  if (lower === "bhat" || lower === "bat" || lower === "vat") return "bhaat";

  // General fallback for common patterns only if they match known variations
  if (lower.startsWith("ka") && (lower.includes("d") || lower.includes("z"))) return "kaaj";
  if (lower.endsWith("ai") && (lower.startsWith("k") || lower.startsWith("kh"))) return "khai";
  if (lower.includes("bha") && (lower.startsWith("bh") || lower.startsWith("v"))) return "bhaat";

  return word;
}

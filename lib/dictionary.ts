export const BANGLA_DICTIONARY = new Set([
  // Pronouns
  "ami", "tumi", "amra", "tomra", "se", "tara", "amar", "tomar", "apnar", "tar", "amader", "tomader", "apnader",
  
  // Verbs (Common conjugations)
  "kori", "koro", "kore", "korchen", "korchi", "korechi", "korbo", "korba",
  "khai", "khao", "khae", "khachhen", "khachhi", "kheyechi", "khabo", "khaba",
  "jai", "jao", "jae", "jacche", "jacchi", "gechi", "jabo", "jaba",
  "dekhi", "dekho", "dekhe", "dekhche", "dekchi", "dekhlam", "dekhbo", "dekhba", "dekha",
  "dei", "deo", "dae", "dicchi", "diche", "dicche", "diyechi", "diyecchi", "dibo", "dibe",
  "hobe", "hacche", "hoyeche", "achhe", "achi", "acho", "nei", "nai",
  "parbo", "pari", "paro", "pare", "bhalobashi", "bashi",
  
  // Nouns & Adjectives
  "bhaat", "pani", "gach", "gacher", "pata", "patai", "daag", "kalo", "khabar", 
  "bari", "ghor", "sokal", "bikal", "raat", "din", "kaj", "kaaj", "mathe",
  "school", "bazar", "taka", "poisa", "lok", "manush", "bhasha", "krishok", "krishokra",
  "bangladesh", "bangla", "desh", "sundor", "valo", "bhalo", "kharap",
  "lal", "nil", "sobuj", "holud", "choto", "boro", "onek", "kom", "khub",
  
  // Particles & Helpers
  "ki", "kene", "keno", "kothay", "kobe", "kivabe", "kemon", "ekta",
  "ebong", "kintu", "ar", "o", "na", "ha", "to"
]);

function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]) + 1;
    }
  }

  return dp[a.length][b.length];
}

export function closestDictionaryMatch(word: string): string {
  if (BANGLA_DICTIONARY.has(word)) return word;

  let best = word;
  let min = Infinity;

  for (const dictWord of BANGLA_DICTIONARY) {
    const dist = levenshtein(word, dictWord);
    if (dist < min) {
      min = dist;
      best = dictWord;
    }
  }

  // Only return dictionary match if it's reasonably close (threshold <= 1 for short words, <= 2 for others)
  const threshold = word.length <= 3 ? 1 : 2;
  if (min <= threshold) {
    return best;
  }
  return word;
}

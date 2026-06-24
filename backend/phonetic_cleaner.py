import re

PHONETIC_FIX = {
  "bat": "bhaat",
  "vat": "bhaat",
  "bhat": "bhaat",

  "kai": "khai",
  "khae": "khai",
  "kha": "khai",

  "ami": "ami",
  "ame": "ami",

  "tumi": "tumi",
  "tume": "tumi",
  "to me": "tumi",

  "ki": "ki",

  "nai": "nei",

  "korsi": "korechi",
  "korchi": "korchi",
  "kortesi": "korchi",

  "jaitesi": "jacchi",
  "khaitesi": "khacchi",
  "boltesi": "bolchi",

  "dekhtesi": "dekchi",

  "kaaz": "kaaj",
  "kaz": "kaaj",
  "kaj": "kaaj",

  "pani": "pani",
  "fani": "pani",
  "hani": "pani",

  "gach": "gach",
  "gaach": "gach",

  "pata": "pata",
  "fata": "pata",
  "patay": "patai",
  "dag": "daag",
  "daag": "daag",
  "krishokora": "krishokra",
  "krishok ra": "krishokra",

  "tu mi": "tumi",
  "kor ba": "korba",
  "ka az": "kaaj",
  "na a": "na"
}

BANGLA_DICTIONARY = {
  # Pronouns
  "ami", "tumi", "amra", "tomra", "se", "tara", "amar", "tomar", "apnar", "tar", "amader", "tomader", "apnader",
  
  # Verbs
  "kori", "koro", "kore", "korchen", "korchi", "korechi", "korbo", "korba",
  "khai", "khao", "khae", "khachhen", "khachhi", "kheyechi", "khabo", "khaba",
  "jai", "jao", "jae", "jacche", "jacchi", "gechi", "jabo", "jaba",
  "dekhi", "dekho", "dekhe", "dekhche", "dekchi", "dekhlam", "dekhbo", "dekhba", "dekha",
  "dei", "deo", "dae", "dicchi", "diche", "dicche", "diyechi", "diyecchi", "dibo", "dibe",
  "hobe", "hacche", "hoyeche", "achhe", "achi", "acho", "nei", "nai",
  "parbo", "pari", "paro", "pare", "bhalobashi", "bashi",
  
  # Nouns & Adjectives
  "bhaat", "pani", "gach", "gacher", "pata", "patai", "daag", "kalo", "khabar", 
  "bari", "ghor", "sokal", "bikal", "raat", "din", "kaj", "kaaj", "mathe",
  "school", "bazar", "taka", "poisa", "lok", "manush", "bhasha", "krishok", "krishokra",
  "bangladesh", "bangla", "desh", "sundor", "valo", "bhalo", "kharap",
  "lal", "nil", "sobuj", "holud", "choto", "boro", "onek", "kom", "khub",
  
  # Particles & Helpers
  "ki", "kene", "keno", "kothay", "kobe", "kivabe", "kemon", "ekta",
  "ebong", "kintu", "ar", "o", "na", "ha", "to"
}

def phonetic_match(word: str) -> str:
    lower = word.lower()
    if lower in PHONETIC_FIX:
        return PHONETIC_FIX[lower]
    if lower in BANGLA_DICTIONARY:
        return lower
        
    # Specific phonetic rules rather than overly broad startsWith/endsWith patterns
    if lower in ["kaadz", "kaaz", "kaz"]:
        return "kaaj"
    if lower in ["khai", "kai", "khae"]:
        return "khai"
    if lower in ["bhat", "bat", "vat"]:
        return "bhaat"

    # General fallback for common patterns only if they match known variations
    if lower.startswith("ka") and ("d" in lower or "z" in lower):
        return "kaaj"
    if lower.endswith("ai") and (lower.startswith("k") or lower.startswith("kh")):
        return "khai"
    if "bha" in lower and (lower.startswith("bh") or lower.startswith("v")):
        return "bhaat"
        
    return word

def phonetic_rules(word: str) -> str:
    return (word
            .replace("kaaz", "kaaj")
            .replace("kaz", "kaaj")
            .replace("kai", "khai")
            .replace("khae", "khai")
            .replace("bhat", "bhaat")
            .replace("bat", "bhaat")
            .replace("vat", "bhaat")
            .replace("to me", "tumi")
            .replace("ka az", "kaaj")
            .replace("kor ba", "korba"))

def levenshtein(a: str, b: str) -> int:
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) + 1):
        dp[i][0] = i
    for j in range(len(b) + 1):
        dp[0][j] = j
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]) + 1
    return dp[len(a)][len(b)]

def closest_dictionary_match(word: str) -> str:
    if word in BANGLA_DICTIONARY:
        return word
    best = word
    min_dist = float('inf')
    for dict_word in BANGLA_DICTIONARY:
        dist = levenshtein(word, dict_word)
        if dist < min_dist:
            min_dist = dist
            best = dict_word
    
    threshold = 1 if len(word) <= 3 else 2
    if min_dist <= threshold:
        return best
    return word

def clean_phonetic_input(text: str) -> str:
    if not text:
        return ""
    
    # 1. Lowercase and pre-replace multi-word keys
    cleaned = text.lower()
    for key, value in PHONETIC_FIX.items():
        if " " in key:
            pattern = re.compile(rf'\b{re.escape(key)}\b', re.IGNORECASE)
            cleaned = pattern.sub(value, cleaned)
            
    # 2. Apply general phonetic rules
    cleaned = phonetic_rules(cleaned)
    
    # 3. Split and process individual words
    words = cleaned.split()
    result = []
    for word in words:
        if not word:
            continue
        lower = word.lower()
        if lower in PHONETIC_FIX:
            result.append(PHONETIC_FIX[lower])
        elif lower in BANGLA_DICTIONARY:
            result.append(lower)
        else:
            fuzzy = phonetic_match(lower)
            rule = phonetic_rules(fuzzy)
            result.append(closest_dictionary_match(rule))
            
    return " ".join(result)

import re
from dict_loader import BANGLISH_WORDS, PHONETIC_KEY_MAP, make_phonetic_key

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
  "kreshok": "krishok",
  "kreshokra": "krishokra",
  "dichchhe": "dicche",

  "tu mi": "tumi",
  "kor ba": "korba",
  "ka az": "kaaj",
  "na a": "na"
}

BANGLA_DICTIONARY = BANGLISH_WORDS

def phonetic_match(word: str) -> str:
    lower = word.lower().strip()
    if lower in PHONETIC_FIX:
        return PHONETIC_FIX[lower]
    if lower in BANGLA_DICTIONARY:
        return lower
        
    # Specific phonetic rules
    if lower in ["kaadz", "kaaz", "kaz"]:
        return "kaaj"
    if lower in ["khai", "kai", "khae"]:
        return "khai"
    if lower in ["bhat", "bat", "vat"]:
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
        
    # 1. Try fast O(1) phonetic key lookup
    key = make_phonetic_key(word)
    if key in PHONETIC_KEY_MAP:
        return PHONETIC_KEY_MAP[key]
        
    # 2. Levenshtein fallback on words of similar length to prevent high latency
    best = word
    min_dist = float('inf')
    
    # Filter dictionary words with length diff <= 1 for efficiency
    candidates = [w for w in BANGLA_DICTIONARY if abs(len(w) - len(word)) <= 1]
    
    for dict_word in candidates:
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

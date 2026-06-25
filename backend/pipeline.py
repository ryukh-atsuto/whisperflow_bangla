import re

def sanitize_by_language(text: str, language: str) -> str:
    """
    Ensure the output text only contains permitted character sets (Latin/English for 'en',
    and Bengali/Latin for 'bn'). Removes any foreign scripts (like Telugu, Arabic, etc.)
    that might be hallucinated by the model.
    """
    if language == "en":
        # Allow ASCII/Latin characters, digits, spaces, and punctuation
        allowed_pattern = re.compile(r'[a-zA-Z0-9\s.,!?;:\'"()\-–—\[\]{}<>@#%&*+=\/\\|`~^_\u00c0-\u00ff]')
        chars = [char for char in text if allowed_pattern.match(char)]
        return "".join(chars).strip()
    elif language == "bn":
        # Allow Bengali script (\u0980-\u09FF), Latin/ASCII characters, digits, spaces, and punctuation
        allowed_pattern = re.compile(r'[\u0980-\u09FFa-zA-Z0-9\s.,!?;:\'"()\-–—\[\]{}<>@#%&*+=\/\\|`~^_\u09e6-\u09ef]')
        chars = [char for char in text if allowed_pattern.match(char)]
        return "".join(chars).strip()
    return text


def devanagari_to_bengali(text: str) -> str:
    """
    Convert any Hindi (Devanagari) characters in the text to their corresponding
    Bengali Unicode characters based on structural offset mapping.
    """
    exceptions = {
        chr(0x0931): chr(0x09B0),  # Devanagari RRA to Bengali RA
        chr(0x0933): chr(0x09B2),  # Devanagari LLA to Bengali LA
        chr(0x0934): chr(0x09B2),  # Devanagari LLLA to Bengali LA
        chr(0x0935): chr(0x09AC),  # Devanagari VA to Bengali BA ('ব')
        chr(0x093B): "",            # Remove Devanagari tone marks
        chr(0x093C): "",            # Remove nukta
        chr(0x0943): chr(0x09C3),  # Devanagari vocalic R to Bengali vocalic R
        chr(0x0944): chr(0x09C4),
    }
    
    converted = []
    for char in text:
        if char in exceptions:
            converted.append(exceptions[char])
        else:
            val = ord(char)
            if 0x0900 <= val <= 0x097F:
                # Add offset of 128 (0x0080) to shift from Devanagari to Bengali block
                converted.append(chr(val + 0x0080))
            else:
                converted.append(char)
    return "".join(converted)


def normalize_bangla(text: str) -> str:
    """
    Fix Whisper mistakes and normalize Bangla speech output.
    """
    # 1. Translate any Hindi characters (Devanagari) into their Bengali equivalents
    text = devanagari_to_bengali(text)

    # 2. Apply common vocabulary/dialect corrections
    corrections = {
        "tomoga": "tomato",
        "pukad": "poka",
        "dhora": "dhora",
        "diyeche": "diyeche",
        "gache": "gach",
        "khaisi": "kheyechi",
        "kortesi": "korchi",
        "jaitesi": "jacchi"
    }

    for wrong, correct in corrections.items():
        text = text.replace(wrong, correct)

    return text


from dict_loader import BANGLA_TO_BANGLISH
DICTIONARY = BANGLA_TO_BANGLISH

CONSONANTS = {
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
  'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'ny',
  'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
  'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
  'য': 'j', 'র': 'r', 'ল': 'l',
  'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
  'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't',
  'ং': 'ng', 'ঃ': 'h', 'ঁ': 'n'
}

VOWELS = {
  'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'ee', 'উ': 'u',
  'ঊ': 'u', 'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou'
}

VOWEL_SIGNS = {
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u',
  'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou'
}

def transliterate_word(word: str) -> str:
    if not any(0x0980 <= ord(c) <= 0x09FF for c in word):
        return word
        
    word = word.strip()
    if word in DICTIONARY:
        return DICTIONARY[word]
        
    result = []
    length = len(word)
    i = 0
    
    while i < length:
        char = word[i]
        
        if char == '্':
            i += 1
            continue
            
        if char in VOWELS:
            result.append(VOWELS[char])
            i += 1
            continue
            
        if char in VOWEL_SIGNS:
            result.append(VOWEL_SIGNS[char])
            i += 1
            continue
            
        if char in CONSONANTS:
            mapped = CONSONANTS[char]
            
            # Lookahead
            next_char = word[i + 1] if i + 1 < length else ''
            after_next = word[i + 2] if i + 2 < length else ''
            
            # check ya-phala
            if next_char == '্' and after_next == 'য':
                mapped += 'y'
                i += 3
                next_next = word[i] if i < length else ''
                if next_next in VOWEL_SIGNS:
                    result.append(mapped + VOWEL_SIGNS[next_next])
                    i += 1
                else:
                    result.append(mapped + 'a')
                continue
                
            # check conjunct
            if next_char == '্' and after_next in CONSONANTS:
                result.append(mapped + CONSONANTS[after_next])
                i += 3
                continue
                
            if next_char in VOWEL_SIGNS:
                result.append(mapped)
                i += 1
                continue
                
            if next_char in CONSONANTS:
                if char in ['ং', 'ঃ', 'ঁ']:
                    result.append(mapped)
                else:
                    result.append(mapped + 'o')
                i += 1
                continue
                
            result.append(mapped)
            i += 1
            continue
            
        result.append(char)
        i += 1
        
    res_str = "".join(result)
    res_str = (res_str
               .replace("oo", "o")
               .replace("aa", "a")
               .replace("yi", "i")
               .replace("iy", "i"))
    return res_str

def to_banglish(text: str) -> str:
    if not text:
        return ""
    token_pattern = re.compile(r'([\u0980-\u09FF]+|[a-zA-Z]+|[^\u0980-\u09FFa-zA-Z\s]+|\s+)')
    tokens = token_pattern.findall(text)
    
    result = []
    for token in tokens:
        if any(0x0980 <= ord(c) <= 0x09FF for c in token):
            result.append(transliterate_word(token))
        else:
            result.append(token)
            
    return "".join(result)


def process_pipeline(text: str, language: str):
    """
    Main pipeline controller.
    """
    if language == "bn":
        # Convert Devanagari first so they don't get stripped by sanitize_by_language
        text = devanagari_to_bengali(text)

    # Sanitize initial raw transcription
    text = sanitize_by_language(text, language)

    if language == "bn":
        cleaned = normalize_bangla(text)
        banglish = to_banglish(cleaned)
        
        # Ensure final Banglish is strictly clean Latin script
        banglish = sanitize_by_language(banglish, "en")

        # Apply phonetic cleaning + dictionary validation layer
        from phonetic_cleaner import clean_phonetic_input
        banglish = clean_phonetic_input(banglish)

        return {
            "raw": text,
            "clean_bangla": cleaned,
            "banglish": banglish
        }

    return {
        "raw": text,
        "clean_bangla": text,
        "banglish": text
    }

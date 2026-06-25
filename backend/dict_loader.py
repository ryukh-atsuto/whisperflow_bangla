import os
import json
import re

# Base agro words mapping to Banglish and English
AGRO_WORDS = {
    "কৃষক": {"banglish": "krishok", "english": "farmer"},
    "কৃষকরা": {"banglish": "krishokra", "english": "farmers"},
    "কৃষি": {"banglish": "krishi", "english": "agriculture"},
    "মাঠ": {"banglish": "math", "english": "field"},
    "মাঠে": {"banglish": "mathe", "english": "in the field"},
    "ফসল": {"banglish": "fosol", "english": "crop"},
    "ধান": {"banglish": "dhan", "english": "paddy"},
    "গম": {"banglish": "gom", "english": "wheat"},
    "পাট": {"banglish": "paat", "english": "jute"},
    "বীজ": {"banglish": "beej", "english": "seed"},
    "সার": {"banglish": "sar", "english": "fertilizer"},
    "কীটনাশক": {"banglish": "kitnashok", "english": "pesticide"},
    "জমি": {"banglish": "jomi", "english": "land"},
    "মাটি": {"banglish": "mati", "english": "soil"},
    "সেচ": {"banglish": "sech", "english": "irrigation"},
    "ফলন": {"banglish": "folon", "english": "yield"},
    "খামার": {"banglish": "khamar", "english": "farm"},
    "খামারী": {"banglish": "khamari", "english": "farmer"},
    "রোগ": {"banglish": "rog", "english": "disease"},
    "পোকামাকড়": {"banglish": "pokamakor", "english": "pests"},
    "পোকা": {"banglish": "poka", "english": "pest"},
    "দাগ": {"banglish": "daag", "english": "spot"},
    "পাতা": {"banglish": "pata", "english": "leaf"},
    "পাতায়": {"banglish": "patai", "english": "on the leaf"},
    "পাতাই": {"banglish": "patai", "english": "on the leaf"},
    "দিচ্ছে": {"banglish": "dicche", "english": "giving"},
    "গাছ": {"banglish": "gach", "english": "plant"},
    "গাছের": {"banglish": "gacher", "english": "of the plant"},
    "কালো": {"banglish": "kalo", "english": "black"},
    "লাল": {"banglish": "lal", "english": "red"},
    "হলুদ": {"banglish": "holud", "english": "yellow"},
    "সবুজ": {"banglish": "sobuj", "english": "green"},
    "সাদা": {"banglish": "shada", "english": "white"},
    "পচা": {"banglish": "pocha", "english": "rot"},
    "ছত্রাক": {"banglish": "chotrak", "english": "fungus"},
    "পানি": {"banglish": "pani", "english": "water"},
    "বৃষ্টি": {"banglish": "brishti", "english": "rain"},
    "গোবর": {"banglish": "gobor", "english": "manure"},
    "ইউরিয়া": {"banglish": "yuria", "english": "urea"},
    "বিষ": {"banglish": "bish", "english": "poison"},
    "ক্ষতি": {"banglish": "khoti", "english": "damage"},
    "লক্ষণ": {"banglish": "lokkhon", "english": "symptom"},
    "প্রতিকার": {"banglish": "protikar", "english": "remedy"},
    "চাষ": {"banglish": "chash", "english": "cultivation"},
    "লাঙ্গল": {"banglish": "langol", "english": "plow"},
    "ট্রাক্টর": {"banglish": "tractor", "english": "tractor"},
}

# Suffixes for generating common inflections
INFLECTIONS = [
    ("টা", "ta", " the"),
    ("টি", "ti", " the"),
    ("গুলো", "gulo", "s"),
    ("গুলা", "gula", "s"),
    ("এর", "er", " of"),
    ("র", "r", " of"),
    ("কে", "ke", " to"),
    ("তে", "te", " in"),
    ("দের", "der", " of"),
]

def make_phonetic_key(word: str) -> str:
    """
    Generate a normalized phonetic representation of a word.
    Strips vowels and collapses similar sounding letters.
    """
    w = word.lower().strip()
    w = w.replace('ch', 'c').replace('chh', 'c').replace('sh', 's').replace('z', 'j').replace('jh', 'j')
    w = w.replace('kh', 'k').replace('gh', 'g').replace('th', 't').replace('dh', 'd').replace('bh', 'b').replace('v', 'b')
    w = w.replace('ph', 'p').replace('f', 'p').replace('rh', 'r')
    w = re.sub(r'[aeiouy]', '', w)
    return w

# Global storage for loaded dictionaries
BANGLA_TO_BANGLISH = {}
BANGLA_TO_ENGLISH = {}
BANGLISH_WORDS = set()
PHONETIC_KEY_MAP = {}

def load_dictionaries():
    global BANGLA_TO_BANGLISH, BANGLA_TO_ENGLISH, BANGLISH_WORDS, PHONETIC_KEY_MAP
    
    # 1. Start with base agro words
    for bn, mapping in AGRO_WORDS.items():
        BANGLA_TO_BANGLISH[bn] = mapping["banglish"]
        BANGLA_TO_ENGLISH[bn] = mapping["english"]
        
        # Add common inflections
        for suffix_bn, suffix_en_b, suffix_en in INFLECTIONS:
            # Avoid duplicate 'r' or double vowels
            val_b = mapping["banglish"]
            if suffix_en_b == "r" and val_b.endswith(("a", "e", "i", "o", "u")):
                combined_b = val_b + "r"
            else:
                combined_b = val_b + suffix_en_b
                
            combined_bn = bn + suffix_bn
            combined_en = mapping["english"] + suffix_en
            
            BANGLA_TO_BANGLISH[combined_bn] = combined_b
            BANGLA_TO_ENGLISH[combined_bn] = combined_en

    # 2. Load the 5,500+ word dictionary
    try:
        dict_path = os.path.join(os.path.dirname(__file__), 'transliterator', 'common_words.json')
        if os.path.exists(dict_path):
            with open(dict_path, 'r', encoding='utf-8') as f:
                loaded_dict = json.load(f)
                for bn_w, en_w in loaded_dict.items():
                    # Preserve agro overrides
                    if bn_w not in BANGLA_TO_BANGLISH:
                        BANGLA_TO_BANGLISH[bn_w] = en_w
    except Exception as e:
        print(f"Error loading common_words.json: {e}")

    # 3. Populate English dictionary with some basic translation fallbacks
    default_translations = {
        "আমি": "I", "তুমি": "you", "আপনি": "you", "ভাত": "rice", "খাই": "eat",
        "নাম": "name", "রাহিম": "Rahim", "আমার": "my", "ভালো": "good", "ভাল": "good",
        "বন্ধু": "friend", "বাংলাদেশ": "Bangladesh", "ঢাকা": "Dhaka", "সুন্দর": "beautiful",
        "কেমন": "how", "আছ": "are", "আছো": "are", "যাই": "go", "যাব": "will go",
        "আসি": "come", "আসব": "will come", "কাজ": "work", "করছি": "doing", "করো": "do",
        "এবং": "and", "ও": "and", "আর": "and", "কিন্তু": "but", "না": "no", "হ্যাঁ": "yes",
        "যাচ্ছ": "going", "যাচ্ছো": "going", "যাচ্ছি": "going", "কোথায়": "where", 
        "স্কুল": "school", "স্কুলে": "to school", "দিচ্ছে": "giving"
    }
    for k, v in default_translations.items():
        if k not in BANGLA_TO_ENGLISH:
            BANGLA_TO_ENGLISH[k] = v

    # 4. Extract all unique Banglish words
    BANGLISH_WORDS = set(BANGLA_TO_BANGLISH.values())

    # 5. Precompute phonetic keys for fast O(1) matching
    for word in BANGLISH_WORDS:
        key = make_phonetic_key(word)
        if key:
            # Map key to shorter/more common word if collision
            if key not in PHONETIC_KEY_MAP or len(word) < len(PHONETIC_KEY_MAP[key]):
                PHONETIC_KEY_MAP[key] = word

# Initialize dictionaries on load
load_dictionaries()

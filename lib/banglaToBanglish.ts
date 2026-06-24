// Following MVC, this is part of the Model Layer.
import { normalizeBanglish } from './textNormalizer';

const dictionary: Record<string, string> = {
  // Pronouns
  'আমি': 'ami',
  'আমার': 'amar',
  'আমাকে': 'amake',
  'তুমি': 'tumi',
  'তোমার': 'tomar',
  'তোমাকে': 'tomake',
  'আপনি': 'apni',
  'আপনার': 'apnar',
  'आपको': 'apnake', // Hindi typo fallback if any
  'আপনাকে': 'apnake',
  'সে': 'se',
  'তার': 'tar',
  'তাকে': 'take',
  'তারা': 'tara',
  'তাদের': 'tader',
  'আমরা': 'amra',
  'আমাদের': 'amader',
  'তোমরা': 'tomra',
  'তোমাদের': 'tomader',

  // Verbs
  'খাই': 'khai',
  'খাব': 'khabo',
  'খাবো': 'khabo',
  'খাচ্ছি': 'khachhi',
  'খাচ্ছ': 'khachho',
  'খাচ্ছে': 'khachhe',
  'খেয়েছি': 'kheyechhi',
  'খেয়েছে': 'kheyechhe',
  'করি': 'kori',
  'করব': 'korbo',
  'করবো': 'korbo',
  'করছি': 'korchhi',
  'করছ': 'korchho',
  'করছে': 'korchhe',
  'করতে': 'korte',
  'করতেছে': 'kortechhe',
  'করেছি': 'korechhi',
  'করেছে': 'korechhe',
  'করো': 'koro',
  'করিস': 'koris',
  'যাই': 'jai',
  'যাব': 'jabo',
  'যাবো': 'jabo',
  'যাচ্ছি': 'jachhi',
  'যাচ্ছ': 'jachho',
  'যাচ্ছে': 'jachhe',
  'গিয়েছি': 'giyechhi',
  'গিয়েছে': 'giyechhe',
  'গেলাম': 'gelam',
  'গেল': 'gelo',
  'গেছে': 'gechhe',
  'আসি': 'asi',
  'আসব': 'asbo',
  'আসবো': 'asbo',
  'আসছি': 'aschhi',
  'আসছে': 'aschhe',
  'এসেছি': 'esechhi',
  'এসেছে': 'esechhe',
  'দেখি': 'dekhi',
  'দেখব': 'dekhbo',
  'দেখবো': 'dekhbo',
  'দেখছি': 'dekhchhi',
  'দেখছে': 'dekhchhe',
  'দেখেছি': 'dekhechhi',
  'বল': 'bol',
  'বলো': 'bolo',
  'বলি': 'boli',
  'বলব': 'bolbo',
  'বলবো': 'bolbo',
  'বলছে': 'bolchhe',
  'বলছ': 'bolchho',
  'বলেছি': 'bolechhi',
  'বলেছে': 'bolechhe',
  'লিখছি': 'likhchhi',
  'লিখব': 'likhbo',
  'লিখবো': 'likhbo',
  'পড়ছি': 'porchhi',
  'পড়ব': 'porbo',
  'পড়বো': 'porbo',
  'পড়াশোনা': 'porashona',
  'ঘুমাব': 'ghumabo',
  'ঘুমাবো': 'ghumabo',
  'ঘুমাচ্ছি': 'ghumachhi',
  'হবে': 'hobe',
  'হচ্ছে': 'hochhe',
  'হলাম': 'holam',
  'হল': 'holo',
  'হলো': 'holo',
  'হয়েছে': 'hoyeche',
  'হয়েছি': 'hoyechhi',

  // Nouns, Adjectives, Places
  'ভাত': 'bhaat',
  'পানি': 'pani',
  'জল': 'jol',
  'দুধ': 'dudh',
  'ফল': 'fol',
  'বাড়ি': 'bari',
  'বাসা': 'basha',
  'ঘর': 'ghor',
  'স্কুল': 'school',
  'স্কুলে': 'school-e',
  'কলেজ': 'college',
  'অফিস': 'office',
  'কাজ': 'kaj',
  'সময়': 'somoy',
  'দিন': 'din',
  'রাত': 'raat',
  'সকাল': 'shokal',
  'দুপুর': 'dupur',
  'বিকাল': 'bikal',
  'সন্ধ্যা': 'shondha',
  'খবর': 'khobor',
  'মানুষ': 'manush',
  'বন্ধু': 'bondhu',
  'মা': 'ma',
  'বাবা': 'baba',
  'ভাই': 'bhai',
  'বোন': 'bon',
  'ছেলে': 'chhele',
  'মেয়ে': 'meye',
  'ঢাকা': 'dhaka',
  'বাংলাদেশ': 'bangladesh',
  'বাংলা': 'bangla',
  'ইংরেজি': 'english',
  'খাবার': 'khabar',
  'ভালো': 'bhalo',
  'ভাল': 'bhalo',
  'মন্দ': 'mondo',
  'খারাপ': 'kharap',
  'সুন্দর': 'shundor',
  'বড়': 'boro',
  'ছোট': 'choto',
  'নতুন': 'notun',
  'পুরাতন': 'puraton',
  'অনেক': 'onek',
  'অল্প': 'olpo',
  'বেশি': 'beshi',
  'কম': 'kom',
  'ঠিক': 'thik',
  'ভুল': 'bhul',
  'নাম': 'nam',
  'রাহিম': 'rahim',
  'করিম': 'korim',
  'রহিম': 'rohim',
  'কষ্ট': 'koshto',
  'স্বপ্ন': 'shopno',

  // Adverbs, Conjunctions, Particles
  'এবং': 'ebong',
  'ও': 'o',
  'আর': 'ar',
  'কিন্তু': 'kintu',
  'তো': 'to',
  'না': 'na',
  'হ্যাঁ': 'ha',
  'কি': 'ki',
  'কী': 'ki',
  'কেন': 'keno',
  'কীভাবে': 'kibhabe',
  'কোথায়': 'kothay',
  'কখন': 'kokhon',
  'কেমন': 'kemon',
  'কারণ': 'karon',
  'জন্য': 'jonno',
  'থেকে': 'theke',
  'দিয়ে': 'diye',
  'ওপরে': 'opore',
  'নিচে': 'niche',
  'সামনে': 'shamne',
  'পেছনে': 'pechhone',
  'এই': 'ei',
  'ওই': 'oi',
  'সেই': 'sei',
  'যে': 'je',
  'তা': 'ta'
};

const consonants: Record<string, string> = {
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
  'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'ny',
  'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
  'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
  'য': 'j', 'র': 'r', 'ল': 'l',
  'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
  'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't',
  'ং': 'ng', 'ঃ': 'h', 'ঁ': 'n'
};

const vowels: Record<string, string> = {
  'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'ee', 'উ': 'u',
  'ঊ': 'u', 'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou'
};

const vowelSigns: Record<string, string> = {
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u',
  'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou'
};

// Transliterate a single cleaned word from Bangla to Banglish
function transliterateWord(word: string): string {
  // If it's not Bangla, keep it as is
  if (!/[\u0980-\u09FF]/.test(word)) {
    return word;
  }

  // Check dictionary
  const lowerWord = word.trim();
  if (dictionary[lowerWord]) {
    return dictionary[lowerWord];
  }

  let result = '';
  const len = word.length;
  let i = 0;

  while (i < len) {
    const char = word[i];

    // Handle Hasanta (্) representing joint consonants
    if (char === '্') {
      i++;
      continue;
    }

    // Handle independent vowels
    if (vowels[char]) {
      result += vowels[char];
      i++;
      continue;
    }

    // Handle vowel signs (kar)
    if (vowelSigns[char]) {
      // Typically, they modify the preceding consonant, and their phonetic equivalent is appended.
      result += vowelSigns[char];
      i++;
      continue;
    }

    // Handle consonants
    if (consonants[char]) {
      let mapped = consonants[char];
      
      // Lookahead rules
      const nextChar = i + 1 < len ? word[i + 1] : '';
      const afterNextChar = i + 2 < len ? word[i + 2] : '';

      // Check for 'ya-phala' (্য) which modifies consonant pronunciation
      if (nextChar === '্' && afterNextChar === 'য') {
        // e.g., ব্য -> bya/be
        mapped += 'y';
        i += 3; // skip consonant + hasanta + ya
        // Check if followed by a vowel sign
        const nextNextChar = i < len ? word[i] : '';
        if (vowelSigns[nextNextChar]) {
          result += mapped + vowelSigns[nextNextChar];
          i++;
        } else {
          result += mapped + 'a'; // default implicit vowel after ya-phala
        }
        continue;
      }

      // Check for standard conjunct with hasanta (্)
      if (nextChar === '্' && afterNextChar && consonants[afterNextChar]) {
        // e.g., ক্ + ষ = ksh
        result += mapped + consonants[afterNextChar];
        i += 3; // skip current consonant, hasanta, next consonant
        continue;
      }

      // If next char is a vowel sign, map the consonant, and let the next loop handle the vowel sign
      if (nextChar && vowelSigns[nextChar]) {
        result += mapped;
        i++;
        continue;
      }

      // If next char is another consonant (and not hasanta or vowel sign), insert implicit 'o'
      if (nextChar && consonants[nextChar]) {
        // Nasal/breath modifiers like ং, ঃ, ঁ do not get implicit vowel
        if (char === 'ং' || char === 'ঃ' || char === 'ঁ') {
          result += mapped;
        } else {
          result += mapped + 'o';
        }
        i++;
        continue;
      }

      // Default mapping
      result += mapped;
      i++;
      continue;
    }

    // Keep other characters as-is
    result += char;
    i++;
  }

  // Small cleanup of double vowels or phonetic artifacts
  return result
    .replace(/oo/g, 'o')
    .replace(/aa/g, 'a')
    .replace(/yi/g, 'i')
    .replace(/iy/g, 'i');
}

// Main exported transliteration function
export function banglaToBanglish(text: string): string {
  if (!text) return '';

  // Match words (Bangla and English) or white spaces/punctuations
  const tokenRegex = /([\u0980-\u09FF]+|[a-zA-Z]+|[^\u0980-\u09FFa-zA-Z\s]+|\s+)/g;
  const tokens = text.match(tokenRegex) || [];

  const transliterated = tokens
    .map(token => {
      // Transliterate word-like tokens
      if (/[\u0980-\u09FF]+/.test(token)) {
        return transliterateWord(token);
      }
      return token;
    })
    .join('');

  return normalizeBanglish(transliterated);
}

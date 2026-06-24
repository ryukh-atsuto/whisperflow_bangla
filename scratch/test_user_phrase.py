import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from pipeline import process_pipeline, to_banglish
from phonetic_cleaner import clean_phonetic_input

# Test Case 1
bengali_text = "আমার গাছের পাতায় কালো দাগ দেখা দিচ্ছে"
print("--- Test Case 1 ---")
print(f"Original Bengali: {bengali_text}")
raw_banglish = to_banglish(bengali_text)
print(f"Raw Banglish: {raw_banglish}")
cleaned_banglish = clean_phonetic_input(raw_banglish)
print(f"Cleaned Banglish: {cleaned_banglish}")
expected = "amar gacher patai kalo daag dekha dicche"
match = cleaned_banglish.strip().lower() == expected.strip().lower()
print(f"Expected:         {expected}")
print(f"Status:           {'✅ PASS' if match else '❌ FAIL'}\n")
if not match:
    sys.exit(1)

# Test Case 2
bengali_text_2 = "কৃষকরা মাঠে কাজ করে"
print("--- Test Case 2 ---")
print(f"Original Bengali: {bengali_text_2}")
raw_banglish_2 = to_banglish(bengali_text_2)
print(f"Raw Banglish: {raw_banglish_2}")
cleaned_banglish_2 = clean_phonetic_input(raw_banglish_2)
print(f"Cleaned Banglish: {cleaned_banglish_2}")
expected_2 = "krishokra mathe kaaj kore"
match_2 = cleaned_banglish_2.strip().lower() == expected_2.strip().lower()
print(f"Expected:         {expected_2}")
print(f"Status:           {'✅ PASS' if match_2 else '❌ FAIL'}\n")
if not match_2:
    sys.exit(1)

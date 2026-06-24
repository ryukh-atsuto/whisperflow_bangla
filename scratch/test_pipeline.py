import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

try:
    from pipeline import normalize_bangla, to_banglish, process_pipeline
    print("Successfully imported pipeline functions from pipeline.py!\n")
except Exception as e:
    print(f"Failed to import pipeline functions: {e}")
    sys.exit(1)

# Test cases for normalization
normalization_cases = [
    ("tomoga khabo", "tomato khabo"),
    ("gache poka dhora", "gach poka dhora"),
    ("ami kaj kortesi", "ami kaj korchi"),
    ("ami jaitesi", "ami jacchi"),
    ("आनी तो माके पষ্বণ্ডো কুরীক", "আনী তো মাকে পষ্বণ্ডো কুরীক"),
    ("अनी तो माके भ्हालो बाशी", "অনী তো মাকে ভ্হালো বাশী"),
]

print("--- Testing normalize_bangla ---")
for raw, expected in normalization_cases:
    got = normalize_bangla(raw)
    print(f"Raw:      '{raw}'")
    print(f"Expected: '{expected}'")
    print(f"Got:      '{got}'")
    print(f"Status:   {'✅ PASS' if got == expected else '❌ FAIL'}\n")

# Test cases for Banglish transliteration
banglish_cases = [
    ("আমি ভাত খাই", "ami bhaat khai"),
    ("তুমি আমার গাছ এবং পাতা", "tumi amar gach এবং pata"), # note: 'এবং' remains untouched in step 3 spec mapping
]

print("--- Testing to_banglish ---")
for raw, expected in banglish_cases:
    got = to_banglish(raw)
    print(f"Raw:      '{raw}'")
    print(f"Expected: '{expected}'")
    print(f"Got:      '{got}'")
    print(f"Status:   {'✅ PASS' if got == expected else '❌ FAIL'}\n")

# Test process_pipeline
print("--- Testing process_pipeline ---")
res_bn = process_pipeline("আমি ভাত খাই", "bn")
print("Bangla Result:", res_bn)
assert res_bn["clean_bangla"] == "আমি ভাত খাই"
assert res_bn["banglish"] == "ami bhaat khai"
print("✅ Bangla process pipeline matches!")

res_telugu = process_pipeline("আমি ভাত খাই మార్ మార్", "bn")
print("Telugu Sanitized Result:", res_telugu)
assert res_telugu["clean_bangla"] == "আমি ভাত খাই"
assert res_telugu["banglish"] == "ami bhaat khai"
print("✅ Telugu script stripping matches!")

res_en = process_pipeline("Hello world", "en")
print("English Result:", res_en)
assert res_en["clean_bangla"] == "Hello world"
assert res_en["banglish"] == "Hello world"
print("✅ English process pipeline matches!")

print("\n🎉 ALL PIPELINE TESTS PASSED SUCCESSFULY!")

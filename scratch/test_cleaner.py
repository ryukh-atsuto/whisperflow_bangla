import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from phonetic_cleaner import clean_phonetic_input

cases = [
    ("To me ki kaadz kor ba na", "tumi ki kaaj korba na"),
    ("ami vat kai", "ami bhaat khai"),
    ("tume korsi", "tumi korechi"),
    ("dekhtesi valo gach", "dekchi valo gach")
]

print("Running Python Phonetic Cleaner Tests:\n")
passed = True

for raw, expected in cases:
    got = clean_phonetic_input(raw)
    match = got.strip().lower() == expected.strip().lower()
    print(f"Input:    '{raw}'")
    print(f"Expected: '{expected}'")
    print(f"Got:      '{got}'")
    print(f"Status:   {'✅ PASS' if match else '❌ FAIL'}\n")
    if not match:
        passed = False

if passed:
    print("🎉 All python phonetic cleaner tests passed successfully!")
else:
    print("❌ Some python phonetic cleaner tests failed.")
    sys.exit(1)

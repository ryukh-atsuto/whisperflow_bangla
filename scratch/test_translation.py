import sys
import os

# Append backend directory to path to test the server translation helpers directly
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

try:
    from whisper_server import translate_bangla_to_english, fallback_dictionary_translate
    print("Successfully imported translation functions from whisper_server.py!")
except Exception as e:
    print(f"Failed to import translation functions: {e}")
    sys.exit(1)

# Test cases
test_cases = [
    ("আমি ভাত খাই", "I eat rice"),
    ("আমি স্কুলে যাচ্ছি", "I am going to school"),
    ("আমার নাম রাহিম", "My name is Rahim"),
    ("তুমি কোথায় যাচ্ছো", "Where are you going?"),
]

print("\n--- Testing Fallback Dictionary Translator ---")
for bn_text, expected_en in test_cases:
    translated = fallback_dictionary_translate(bn_text)
    print(f"Input:    '{bn_text}'")
    print(f"Expected: '{expected_en}'")
    print(f"Got:      '{translated}'")
    status = "✅ PASS" if translated.lower() == expected_en.lower() else "❌ FAIL"
    print(f"Status:   {status}\n")

print("--- Testing NMT / Model Translator Loader ---")
# This will attempt to dynamically check NMT model loading
translated_nmt = translate_bangla_to_english("আমি ভাত খাই")
print(f"NMT / Fallback output for 'আমি ভাত খাই': '{translated_nmt}'")
print("✅ Test executed successfully!")

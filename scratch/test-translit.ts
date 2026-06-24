import { banglaToBanglish } from '../lib/banglaToBanglish';

const testCases = [
  { input: "আমি ভাত খাই", expected: "ami bhat khai" },
  { input: "I am going to school", expected: "I am going to school" },
  { input: "আমার নাম রাহিম", expected: "amar nam rahim" },
  { input: "করিম স্কুলে যায়", expected: "korim school-e jay" },
  
  // Dialect & Colloquial test cases
  { input: "হানি", expected: "pani" },                      // Noakhali/Sylhet 'hani' -> 'pani'
  { input: "ফুরি", expected: "meyere" },                    // Sylhet 'furi' -> 'meyere'
  { input: "আমি ভাত খাইসি", expected: "ami bhat kheyechi" }, // Past tense 'khaisi' -> 'kheyechi'
  { input: "কাজ করতাসি", expected: "kaj korchi" },         // Continuous verb 'kortasi' -> 'korchi'
  { input: "খাইতাসি", expected: "khacchi" },                // 'khaitasi' -> 'khacchi'
  { input: "গাছ এর নিচে", expected: "gacher niche" }        // Possessive split 'gach er' -> 'gacher'
];

console.log("Running Transliteration & Dialect Normalization Tests:\n");
let passed = true;

for (const { input, expected } of testCases) {
  const result = banglaToBanglish(input);
  const isMatch = result.toLowerCase().trim() === expected.toLowerCase().trim();
  console.log(`Input:    "${input}"`);
  console.log(`Expected: "${expected}"`);
  console.log(`Got:      "${result}"`);
  console.log(`Status:   ${isMatch ? "✅ PASS" : "❌ FAIL"}\n`);
  if (!isMatch) passed = false;
}

if (passed) {
  console.log("🎉 All dialect and normalization tests passed successfully!");
} else {
  console.log("⚠️ Some tests failed. Please refine rules.");
  process.exit(1);
}

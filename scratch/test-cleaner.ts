import { cleanPhoneticInput } from '../lib/phoneticCleaner';

const cases = [
  { input: "To me ki kaadz kor ba na", expected: "tumi ki kaaj korba na" },
  { input: "ami vat kai", expected: "ami bhaat khai" },
  { input: "tume korsi", expected: "tumi korechi" },
  { input: "dekhtesi valo gach", expected: "dekchi valo gach" }
];

console.log("Running Phonetic Cleaner Tests:\n");
let passed = true;

for (const { input, expected } of cases) {
  const got = cleanPhoneticInput(input);
  const match = got.trim().toLowerCase() === expected.trim().toLowerCase();
  console.log(`Input:    "${input}"`);
  console.log(`Expected: "${expected}"`);
  console.log(`Got:      "${got}"`);
  console.log(`Status:   ${match ? "✅ PASS" : "❌ FAIL"}\n`);
  if (!match) passed = false;
}

if (passed) {
  console.log("🎉 All phonetic cleaner tests passed successfully!");
} else {
  console.log("❌ Some phonetic cleaner tests failed.");
  process.exit(1);
}

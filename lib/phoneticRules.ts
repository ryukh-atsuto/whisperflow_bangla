export function phoneticRules(word: string): string {
  return word
    .replace(/kaaz/g, "kaaj")
    .replace(/kaz/g, "kaaj")
    .replace(/kai/g, "khai")
    .replace(/khae/g, "khai")
    .replace(/bhat/g, "bhaat")
    .replace(/bat/g, "bhaat")
    .replace(/vat/g, "bhaat")
    .replace(/to me/g, "tumi")
    .replace(/ka az/g, "kaaj")
    .replace(/kor ba/g, "korba");
}

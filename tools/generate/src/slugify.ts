export function slugify(input: string, maxWords = 4): string {
  const ascii = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .toLowerCase()

  const words = ascii.trim().split(/\s+/).filter(Boolean)
  const n = Math.min(words.length, Math.max(3, Math.min(4, maxWords)))
  return words.slice(0, n).join("-")
}

// Diacritic-stripping, lowercase, hyphenated slug.
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ăâ]/gi, "a")
    .replace(/[îí]/gi, "i")
    .replace(/[șş]/gi, "s")
    .replace(/[țţ]/gi, "t")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

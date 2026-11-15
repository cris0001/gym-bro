// Text folded for search: lower-case and without diacritics, so "ryz bialy" matches
// "Ryż biały" and "zoltko" matches "Żółtko" (people often type without Polish
// characters on a phone). NFD splits most accented letters into base + mark; "ł"/"Ł"
// has no such decomposition, so it is mapped by hand. Mirrors the API's unaccent()
// search, so client-side filters and server search agree.
export function foldText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .toLowerCase();
}

// Whether `name` contains the (already folded) search query.
export function matchesQuery(name: string, foldedQuery: string): boolean {
  return foldText(name).includes(foldedQuery);
}

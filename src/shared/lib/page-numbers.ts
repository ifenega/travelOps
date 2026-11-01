/**
 * The page buttons to show, with "…" for gaps: the first three, the last three, and the pages
 * either side of the current one. Ten pages on page 1 → [1, 2, 3, "…", 8, 9, 10].
 */
export function pageNumbers(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)

  const shown = new Set<number>()
  for (const n of [1, 2, 3, page - 1, page, page + 1, pageCount - 2, pageCount - 1, pageCount]) {
    if (n >= 1 && n <= pageCount) shown.add(n)
  }

  const sorted = [...shown].sort((a, b) => a - b)
  const result: (number | "…")[] = []
  sorted.forEach((n, i) => {
    const previous = sorted[i - 1]
    if (previous !== undefined && n - previous > 1) result.push("…")
    result.push(n)
  })
  return result
}

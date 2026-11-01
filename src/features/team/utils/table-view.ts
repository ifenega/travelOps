// Search, sort and page a list in the browser. The mock service returns every row; if the real
// API pages on the server, these move there and only the hooks change.

export type SortKey = "name" | "date"
export type Sort = SortKey | `-${SortKey}`

export function parseSort(sort: Sort): { key: SortKey; direction: "ascending" | "descending" } {
  return sort.startsWith("-")
    ? { key: sort.slice(1) as SortKey, direction: "descending" }
    : { key: sort as SortKey, direction: "ascending" }
}

/** Clicking a sorted column flips it; clicking another sorts that one A→Z. */
export function nextSort(current: Sort, key: SortKey): Sort {
  return current === key ? `-${key}` : key
}

export function sortBy<T>(items: T[], sort: Sort, values: Record<SortKey, (item: T) => string>) {
  const { key, direction } = parseSort(sort)
  const sorted = [...items].sort((a, b) => values[key](a).localeCompare(values[key](b)))
  return direction === "ascending" ? sorted : sorted.reverse()
}

/** Keeps items where any of the given texts contains the query (ignoring case and spaces). */
export function search<T>(items: T[], query: string | undefined, texts: (item: T) => string[]) {
  const q = query?.trim().toLowerCase()
  if (!q) return items
  return items.filter((item) => texts(item).some((text) => text.toLowerCase().includes(q)))
}

/** One page of items. A page past the end shows the last page instead of nothing. */
export function paginate<T>(items: T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(Math.max(1, page), pageCount)
  return {
    items: items.slice((current - 1) * pageSize, current * pageSize),
    page: current,
    pageCount,
  }
}

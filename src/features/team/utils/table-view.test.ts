import { describe, expect, it } from "vitest"
import { nextSort, paginate, parseSort, search, sortBy } from "./table-view"

const people = [
  { name: "Tunde", date: "2026-03-01" },
  { name: "ada", date: "2026-01-15" },
  { name: "Musa", date: "2026-02-10" },
]
const values = {
  name: (p: (typeof people)[number]) => p.name,
  date: (p: (typeof people)[number]) => p.date,
}

describe("table view", () => {
  it("sorts A→Z and Z→A, ignoring case", () => {
    expect(sortBy(people, "name", values).map((p) => p.name)).toEqual(["ada", "Musa", "Tunde"])
    expect(sortBy(people, "-date", values).map((p) => p.name)).toEqual(["Tunde", "Musa", "ada"])
  })

  it("flips the sorted column, or sorts a new one A→Z", () => {
    expect(nextSort("name", "name")).toBe("-name")
    expect(nextSort("-name", "name")).toBe("name")
    expect(nextSort("-name", "date")).toBe("date")
    expect(parseSort("-date")).toEqual({ key: "date", direction: "descending" })
  })

  it("searches several fields", () => {
    expect(search(people, " MU ", (p) => [p.name, p.date])).toEqual([people[2]])
    expect(search(people, "", (p) => [p.name])).toBe(people)
  })

  it("pages, and shows the last page when asked for one past the end", () => {
    const items = Array.from({ length: 23 }, (_, i) => i)
    expect(paginate(items, 3, 10)).toEqual({ items: [20, 21, 22], page: 3, pageCount: 3 })
    expect(paginate(items, 9, 10).page).toBe(3)
    expect(paginate([], 1, 10)).toEqual({ items: [], page: 1, pageCount: 1 })
  })
})

import { describe, expect, it } from "vitest"
import { formatDayMonthYear, parseDayMonthYear } from "./day-month-year"

describe("DD/MM/YYYY dates", () => {
  it("formats with leading zeros", () => {
    expect(formatDayMonthYear(new Date(2026, 0, 1))).toBe("01/01/2026")
  })

  it("parses typed dates, with or without leading zeros", () => {
    expect(parseDayMonthYear("08/08/2026")).toEqual(new Date(2026, 7, 8))
    expect(parseDayMonthYear(" 8/8/2026 ")).toEqual(new Date(2026, 7, 8))
  })

  it("rejects text that isn't a real date", () => {
    expect(parseDayMonthYear("31/02/2026")).toBeNull()
    expect(parseDayMonthYear("2026-08-08")).toBeNull()
    expect(parseDayMonthYear("")).toBeNull()
  })
})

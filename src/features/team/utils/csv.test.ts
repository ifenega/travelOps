import { describe, expect, it } from "vitest"
import { seedMembers, seedPolicies, seedRoles } from "../api/mock-data"
import { countCsvRows, importTemplateCsv, membersCsv, toCsv } from "./csv"

describe("csv", () => {
  it("quotes values with commas, quotes or new lines", () => {
    expect(toCsv([["a", "b,c", 'say "hi"', "two\nlines"]])).toBe(
      'a,"b,c","say ""hi""","two\nlines"',
    )
  })

  it("writes members with role and policy names", () => {
    const [header, first] = membersCsv(seedMembers.slice(0, 1), seedRoles, seedPolicies).split(
      "\r\n",
    )
    expect(header).toBe("First name,Last name,Email,Role,Policy,Status,Date added")
    expect(first).toContain("Timilehin,Folagbade,timilehin.folagbade@example.com,Administrator")
  })

  it("counts data rows, ignoring the header and blank lines", () => {
    expect(countCsvRows(importTemplateCsv())).toBe(1)
    expect(countCsvRows("h\r\na\r\n\r\nb\r\n")).toBe(2)
    expect(countCsvRows("")).toBe(0)
  })
})

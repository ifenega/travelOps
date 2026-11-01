import { describe, expect, it } from "vitest"
import { seedTrips } from "../api/mock-data"
import { tripToIcs } from "./calendar"

const athens = seedTrips.find((t) => t.id === "athens-flight")
if (!athens) throw new Error("No mock Athens trip")

describe("tripToIcs", () => {
  const ics = tripToIcs(athens, new Date("2026-11-01T09:00:00Z"))
  const lines = ics.split("\r\n")

  it("is a calendar with one event per leg, using CRLF line endings", () => {
    expect(lines[0]).toBe("BEGIN:VCALENDAR")
    expect(lines.at(-1)).toBe("END:VCALENDAR")
    expect(lines.filter((line) => line === "BEGIN:VEVENT")).toHaveLength(2)
    expect(ics).not.toMatch(/[^\r]\n/)
  })

  it("writes times in UTC", () => {
    // 08:40 in London (BST, +01:00) is 07:40 UTC.
    expect(lines).toContain("DTSTART:20270903T074000Z")
    expect(lines).toContain("DTEND:20270903T112500Z")
    expect(lines).toContain("DTSTAMP:20261101T090000Z")
  })

  it("escapes commas and newlines in text", () => {
    const description = ics.slice(ics.indexOf("DESCRIPTION:")).split("\r\nEND:VEVENT")[0]
    // Unfold continuation lines before checking.
    expect(description?.replace(/\r\n /g, "")).toBe(
      "DESCRIPTION:Flight to Athens\\nAegean Airlines\\, Airbus A321\\nConfirmation A3X7PQ",
    )
  })

  it("keeps every line within 75 characters", () => {
    for (const line of lines) expect(line.length).toBeLessThanOrEqual(75)
  })
})

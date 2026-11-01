import { describe, expect, it } from "vitest"
import { seedTrips } from "../api/mock-data"
import {
  formatDateRange,
  formatDay,
  formatDuration,
  formatPrice,
  formatRoute,
  formatTime,
  localDate,
  pluralize,
} from "./format"

/** Intl puts thin spaces around range dashes; compare with plain spaces. */
const plain = (text: string) => text.replace(/\s/g, " ")

describe("formatting", () => {
  it("formats trip date ranges without shifting a day", () => {
    expect(plain(formatDateRange("2027-07-08", "2027-08-18", { locale: "en-US" }))).toBe(
      "Jul 8 – Aug 18",
    )
    expect(
      plain(formatDateRange("2027-05-01", "2027-05-08", { weekday: true, locale: "en-US" })),
    ).toBe("Sat, May 1 – Sat, May 8")
    expect(formatDay("2027-05-01", "en-US")).toBe("Sat, May 1")
  })

  it("formats money in the trip's currency", () => {
    expect(formatPrice({ amount: 1466.58, currency: "GBP" }, "en-US")).toBe("£1,466.58")
  })

  it("shows times and dates in the place's own time zone", () => {
    expect(plain(formatTime("2027-05-01T18:45:00+01:00", "Africa/Lagos", "en-US"))).toBe("6:45 PM")
    expect(localDate("2027-02-20T21:05:00+00:00", "Asia/Kolkata")).toBe("2027-02-21")
  })

  it("formats durations", () => {
    expect(formatDuration(370)).toBe("6h 10m")
    expect(formatDuration(120)).toBe("2h")
    expect(formatDuration(45)).toBe("45m")
  })

  it("describes the route as a round trip or one way", () => {
    const athens = seedTrips.find((t) => t.id === "athens-flight")
    const us = seedTrips.find((t) => t.id === "us-trip")
    expect(athens && formatRoute(athens)).toBe("Roundtrip LHR - ATH")
    expect(us && formatRoute(us)).toBe("One way LOS - PHL")
  })

  it("pluralizes counts", () => {
    expect(pluralize(1, "traveller")).toBe("1 traveller")
    expect(pluralize(12, "traveller")).toBe("12 travellers")
  })
})

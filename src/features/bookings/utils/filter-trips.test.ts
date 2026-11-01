import { describe, expect, it } from "vitest"
import { seedTrips } from "../api/mock-data"
import { filterTrips } from "./filter-trips"

const titles = (filters: Parameters<typeof filterTrips>[1]) =>
  filterTrips(seedTrips, filters).map((trip) => trip.title)

describe("filterTrips", () => {
  it("keeps only the tab's trips", () => {
    expect(titles({ owner: "team" })).toEqual([
      "Flight to Philadelphia",
      "Flight to Mumbai",
      "Train to Porto",
      "Team offsite in London",
    ])
  })

  it("filters by status", () => {
    expect(titles({ owner: "mine", status: "booked" })).toEqual([
      "Weekend in Paris",
      "Flight to Athens",
    ])
  })

  it("searches titles and destinations, ignoring case and spaces", () => {
    expect(titles({ owner: "mine", q: "  PARIS " })).toEqual([
      "Weekend in Paris",
      "Valentine's trip to France",
    ])
    expect(titles({ owner: "mine", q: "nowhere" })).toEqual([])
  })
})

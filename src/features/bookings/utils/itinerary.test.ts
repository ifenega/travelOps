import { describe, expect, it } from "vitest"
import { seedTrips } from "../api/mock-data"
import type { Booking } from "../types"
import { buildItinerary } from "./itinerary"

function trip(id: string) {
  const found = seedTrips.find((t) => t.id === id)
  if (!found) throw new Error(`No mock trip ${id}`)
  return found
}

/** A readable outline of the timeline: "• LOS", "[LOS-DOH]", "• DOH (layover 155m)". */
function outline(bookings: Booking[]) {
  return buildItinerary(bookings).map((day) => ({
    date: day.date,
    items: day.items.map((item) =>
      item.kind === "booking"
        ? `[${item.booking.departure.place.code}-${item.booking.arrival.place.code}]`
        : `• ${item.place.code}${item.layoverMinutes !== undefined ? ` (layover ${item.layoverMinutes}m)` : ""}`,
    ),
  }))
}

describe("buildItinerary", () => {
  it("joins a connection into one stop with the layover time, and splits by local day", () => {
    expect(outline(trip("us-trip").bookings)).toEqual([
      { date: "2027-05-01", items: ["• LOS", "[LOS-DOH]"] },
      // Arrive Doha 02:55, leave 05:30: one stop, a 2h 35m layover.
      { date: "2027-05-02", items: ["• DOH (layover 155m)", "[DOH-JFK]", "• JFK"] },
      // The train leaves from a different station two days later, so both stops show.
      { date: "2027-05-04", items: ["• NYP", "[NYP-PHL]", "• PHL"] },
    ])
  })

  it("doesn't call a stay of more than a day a layover", () => {
    // Paris → London, then back from London six weeks later.
    expect(outline(trip("london-train").bookings)).toEqual([
      { date: "2027-07-08", items: ["• PNO", "[PNO-STP]"] },
      { date: "2027-08-18", items: ["• STP", "[STP-PNO]", "• PNO"] },
    ])
  })

  it("puts each stop under its own local date, even when the clock crosses midnight", () => {
    // Leaves London on Feb 20 at 21:05, lands in Mumbai on Feb 21 local time.
    expect(outline(trip("mumbai-flight").bookings)).toEqual([
      { date: "2027-02-20", items: ["• LHR", "[LHR-BOM]"] },
      { date: "2027-02-21", items: ["• BOM"] },
    ])
  })

  it("works on one kind of leg at a time (the Flights tab)", () => {
    const flights = trip("us-trip").bookings.filter((b) => b.transport === "flight")
    expect(outline(flights).flatMap((day) => day.items)).toEqual([
      "• LOS",
      "[LOS-DOH]",
      "• DOH (layover 155m)",
      "[DOH-JFK]",
      "• JFK",
    ])
  })

  it("returns nothing for a trip with no legs", () => {
    expect(buildItinerary([])).toEqual([])
  })
})

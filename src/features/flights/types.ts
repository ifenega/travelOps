// What a flight search returns. The mock service and the real API both produce these.

export type Cabin = "economy" | "premium" | "business" | "first"

export const cabinLabels: Record<Cabin, string> = {
  economy: "Economy",
  premium: "Premium economy",
  business: "Business",
  first: "First",
}

export type Airport = {
  /** IATA code, e.g. "LOS". */
  code: string
  /** "Lagos Murtala Muhammed" */
  name: string
  city: string
}

export type Airline = {
  code: string
  name: string
  website: string
}

export type Amenity = "power" | "wifi"

/** One take-off and landing. */
export type Segment = {
  airline: Airline
  flightNumber: string
  aircraft: string
  cabin: Cabin
  from: Airport
  to: Airport
  departAt: Date
  arriveAt: Date
  amenities: Amenity[]
}

/** Whether the company's travel policy allows it, and if not, why. */
export type Policy =
  | { within: true }
  | {
      within: false
      /** "The flight is too expensive" */
      reason: string
      /** "The maximum budget is GBP 1,200 per passenger." */
      detail: string
    }

/** One way of getting there (departing) or back (return): one or more segments. */
export type Flight = {
  id: string
  leg: Leg
  airline: Airline
  segments: Segment[]
  /** Per passenger, for the whole round trip, in GBP. */
  price: number
  policy: Policy
}

export type Leg = "departing" | "return"

/** A ticket type for a flight, e.g. "Economy Light": what's included and what it costs. */
export type Fare = {
  id: string
  flightId: string
  name: string
  /** "Economy (X)" */
  bookingClass: string
  /** Per passenger, for the whole round trip, in GBP. */
  price: number
  policy: Policy
  checkedBags: number
  features: { label: string; included: boolean }[]
}

/** The question a flight search answers. */
export type FlightSearch = {
  from: Airport
  to: Airport
  departDate: Date
  returnDate: Date
  passengers: number
}

/** A departing and a return flight, as shown in the chat (design screen 15). */
export type RoundTrip = {
  departing: Flight
  returning: Flight
}

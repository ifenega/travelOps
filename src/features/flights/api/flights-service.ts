import { type ResultsFilters, resultsFiltersSchema } from "../search-params"
import type {
  Airline,
  Airport,
  Cabin,
  Fare,
  Flight,
  FlightSearch,
  Leg,
  Policy,
  RoundTrip,
  Segment,
} from "../types"
import { cabinLabels } from "../types"
import { summarizeFlight } from "../utils/format"

// Mock flight search until the backend exists. Results are made up, but the same search always
// gives the same flights. Filtering, sorting and paging happen here, as the real API would do them.
// Screens only use `flightsService` (through the hooks), so the real API replaces this file alone.

/** Lets stories show loading states. */
export const mockFlightControls = { delay: 500 }

export const pageSize = 10
const flightsPerLeg = 48

/** The company's travel policy, per passenger. */
const policyBudget = 1200
const policyCabins: Cabin[] = ["economy", "premium"]

const airlines: (Airline & { hub: Airport })[] = [
  {
    code: "TK",
    name: "Turkish Airlines",
    website: "https://www.turkishairlines.com",
    hub: { code: "IST", name: "Istanbul Airport", city: "Istanbul" },
  },
  {
    code: "AF",
    name: "Air France",
    website: "https://www.airfrance.com",
    hub: { code: "CDG", name: "Paris Charles de Gaulle", city: "Paris" },
  },
  {
    code: "LH",
    name: "Lufthansa",
    website: "https://www.lufthansa.com",
    hub: { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt" },
  },
  {
    code: "QR",
    name: "Qatar Airways",
    website: "https://www.qatarairways.com",
    hub: { code: "DOH", name: "Doha Hamad International", city: "Doha" },
  },
  {
    code: "EK",
    name: "Emirates",
    website: "https://www.emirates.com",
    hub: { code: "DXB", name: "Dubai International", city: "Dubai" },
  },
  {
    code: "BA",
    name: "British Airways",
    website: "https://www.britishairways.com",
    hub: { code: "LHR", name: "London Heathrow", city: "London" },
  },
]
const aircraft = ["Boeing 787", "Airbus A350", "Boeing 777", "Airbus A320"]
const cabinPrice: Record<Cabin, number> = { economy: 1, premium: 1.6, business: 3.2, first: 5 }

/** A seeded random number generator (mulberry32), so a search always gives the same flights. */
function randomFrom(seed: string) {
  let state = 0
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 2654435761)
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60_000)

function policyFor(price: number, cabin: Cabin): Policy {
  if (!policyCabins.includes(cabin)) {
    return {
      within: false,
      reason: `${cabinLabels[cabin]} is above your travel policy`,
      detail: "Your policy allows economy and premium economy.",
    }
  }
  if (price > policyBudget) {
    return {
      within: false,
      reason: "The flight is too expensive",
      detail: `The maximum budget is GBP ${policyBudget.toLocaleString("en-GB")} per passenger.`,
    }
  }
  return { within: true }
}

/** Every flight the mock has made, so a chosen flight can be looked up again by id. */
const flightsById = new Map<string, Flight>()

function makeFlights(search: FlightSearch, leg: Leg, cabin: Cabin, basePrice: number) {
  const [from, to, date] =
    leg === "departing"
      ? [search.from, search.to, search.departDate]
      : [search.to, search.from, search.returnDate]
  const random = randomFrom(`${from.code}-${to.code}-${date.toDateString()}-${cabin}`)
  const pick = <T>(list: T[]) => list[Math.floor(random() * list.length)]

  return Array.from({ length: flightsPerLeg }, (_, index): Flight => {
    const airline = pick(airlines)
    const roll = random()
    const stops = roll < 0.15 ? 0 : roll < 0.85 ? 1 : 2
    const via = [airline.hub, pick(airlines.filter((a) => a !== airline)).hub].slice(0, stops)
    const route = [from, ...via, to]

    let departAt = new Date(date)
    departAt.setHours(Math.floor(random() * 24), Math.floor(random() * 12) * 5, 0, 0)
    const segments: Segment[] = route.slice(1).map((arrival, stop) => {
      if (stop > 0) departAt = addMinutes(departAt, 60 + Math.floor(random() * 30) * 10)
      const arriveAt = addMinutes(departAt, 120 + Math.floor(random() * 36) * 10)
      const segment: Segment = {
        airline,
        flightNumber: `${airline.code} ${100 + Math.floor(random() * 900)}`,
        aircraft: pick(aircraft),
        cabin,
        from: route[stop],
        to: arrival,
        departAt,
        arriveAt,
        amenities: random() < 0.7 ? ["power", "wifi"] : ["power"],
      }
      departAt = arriveAt
      return segment
    })

    // Departing prices are for the whole round trip; return prices add a little to the chosen
    // departing fare.
    const extra = leg === "departing" ? 300 + random() * 900 : random() * 150
    const price = Math.round(basePrice + (extra + (stops === 0 ? 120 : 0)) * cabinPrice[cabin])
    const flight: Flight = {
      id: `${from.code}-${to.code}-${date.toLocaleDateString("en-CA")}-${cabin}-${index}`,
      leg,
      airline,
      segments,
      price,
      policy: policyFor(price, cabin),
    }
    flightsById.set(flight.id, flight)
    return flight
  })
}

const departHour: Record<Exclude<ResultsFilters["time"], "any">, [number, number]> = {
  night: [0, 5],
  morning: [5, 12],
  afternoon: [12, 18],
  evening: [18, 24],
}

function applyFilters(flights: Flight[], filters: ResultsFilters) {
  const matching = flights.filter((flight) => {
    const { stops, departAt } = summarizeFlight(flight)
    if (filters.stops !== "any" && stops > Number(filters.stops)) return false
    if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline.code)) return false
    if (filters.policy === "within" && !flight.policy.within) return false
    if (filters.time !== "any") {
      const [start, end] = departHour[filters.time]
      if (departAt.getHours() < start || departAt.getHours() >= end) return false
    }
    return true
  })
  const sortValue = (flight: Flight) => {
    const summary = summarizeFlight(flight)
    if (filters.sort === "cheapest") return flight.price
    if (filters.sort === "fastest") return summary.minutes
    if (filters.sort === "earliest") return summary.departAt.getTime()
    // "Best": cheap and quick together, like most flight search sites.
    return flight.price + summary.minutes * 0.5
  }
  return matching.sort((a, b) => sortValue(a) - sortValue(b))
}

const fareTiers = [
  {
    name: "Light",
    letter: "X",
    extra: 0,
    changes: false,
    refundable: false,
    carryOn: false,
    checkedBags: 0,
    priority: false,
    seat: false,
  },
  {
    name: "Classic",
    letter: "Y",
    extra: 180,
    changes: true,
    refundable: false,
    carryOn: true,
    checkedBags: 1,
    priority: false,
    seat: true,
  },
  {
    name: "Flex",
    letter: "B",
    extra: 420,
    changes: true,
    refundable: true,
    carryOn: true,
    checkedBags: 2,
    priority: true,
    seat: true,
  },
]

function faresFor(flight: Flight): Fare[] {
  const cabin = flight.segments[0].cabin
  return fareTiers.map((tier) => {
    const price = flight.price + Math.round(tier.extra * cabinPrice[cabin])
    const bags = tier.checkedBags
    return {
      id: `${flight.id}-${tier.name.toLowerCase()}`,
      flightId: flight.id,
      name: `${cabinLabels[cabin]} ${tier.name}`,
      bookingClass: `${cabinLabels[cabin]} (${tier.letter})`,
      price,
      policy: policyFor(price, cabin),
      checkedBags: bags,
      features: [
        { label: tier.changes ? "Changes allowed" : "No changes allowed", included: tier.changes },
        { label: tier.refundable ? "Refundable" : "Non-refundable", included: tier.refundable },
        { label: "Underseat bag included", included: true },
        {
          label: tier.carryOn ? "Carry-on bag included" : "No carry-on bag",
          included: tier.carryOn,
        },
        {
          label:
            bags === 0
              ? "No checked bags"
              : `${bags} checked ${bags === 1 ? "bag" : "bags"} included`,
          included: bags > 0,
        },
        {
          label: tier.priority ? "Priority boarding" : "No priority boarding",
          included: tier.priority,
        },
        { label: tier.seat ? "Reserved seat included" : "No reserved seat", included: tier.seat },
      ],
    }
  })
}

const wait = () => new Promise((resolve) => setTimeout(resolve, mockFlightControls.delay))

export type FlightResults = {
  flights: Flight[]
  total: number
  pageCount: number
  /** Every airline in the unfiltered results, for the Airlines filter. */
  airlines: Airline[]
}

export const flightsService = {
  /**
   * One page of departing or return flights. Return flights are priced from the chosen
   * departing fare, since a round trip is priced as a whole.
   */
  async search(
    search: FlightSearch,
    leg: Leg,
    filters: ResultsFilters,
    departingFarePrice = 0,
  ): Promise<FlightResults> {
    await wait()
    const all = makeFlights(search, leg, filters.cabin, departingFarePrice)
    const matching = applyFilters(all, filters)
    const start = (filters.page - 1) * pageSize
    return {
      flights: matching.slice(start, start + pageSize),
      total: matching.length,
      pageCount: Math.max(1, Math.ceil(matching.length / pageSize)),
      airlines: airlines.filter((airline) => all.some((f) => f.airline.code === airline.code)),
    }
  },

  /** The best few round trips, for the results inside the chat. */
  async roundTrips(
    search: FlightSearch,
    count = 4,
  ): Promise<{ trips: RoundTrip[]; total: number }> {
    await wait()
    const filters = resultsFiltersSchema.parse({})
    const departing = applyFilters(makeFlights(search, "departing", "economy", 0), filters)
    const returning = applyFilters(makeFlights(search, "return", "economy", 0), filters)
    const trips = departing
      .slice(0, count)
      .map((flight, index) => ({ departing: flight, returning: returning[index] }))
    return { trips, total: departing.length }
  },

  async fares(flightId: string): Promise<Fare[]> {
    await wait()
    const flight = flightsById.get(flightId)
    return flight ? faresFor(flight) : []
  },

  /** A flight from an earlier search (e.g. the chosen departing flight). */
  getFlight: (flightId: string) => flightsById.get(flightId),

  /** A fare of a flight from an earlier search. Fare ids are "<flight id>-<tier>". */
  getFare(fareId: string) {
    const flight = flightsById.get(fareId.slice(0, fareId.lastIndexOf("-")))
    return flight && faresFor(flight).find((fare) => fare.id === fareId)
  },
}

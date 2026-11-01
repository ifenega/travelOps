import type { Fare, Flight, FlightSearch } from "@/features/flights"

// A booking in progress, from the chosen flights to payment (design screens 20–28).

export type PassengerType = "adult" | "child" | "infant"

export type PassengerDetails = {
  title: string
  firstName: string
  lastName: string
  /** "YYYY-MM-DD"; only children and infants need it. */
  dateOfBirth?: string
}

export type Passenger = {
  id: string
  type: PassengerType
  /** Missing until the passenger is confirmed. */
  details?: PassengerDetails
}

export type Contact = {
  email: string
  phone: string
  address: string
}

/** A seat on one flight of the trip, e.g. "Flight 2 · 9B · £56". */
export type Seat = {
  /** Which flight of the trip, counting every segment both ways: 1, 2, 3… */
  flight: number
  seat: string
  price: number
}

export type Loyalty = {
  program: string
  number: string
}

export type ChosenFlight = { flight: Flight; fare: Fare }

export type Booking = {
  id: string
  /** The chat it was booked from, to go back to the flight results. */
  chatId: string
  search: FlightSearch
  departing: ChosenFlight
  returning: ChosenFlight
  passengers: Passenger[]
  contact?: Contact
  /** Seats per passenger id. Infants sit on a lap, so they have none. */
  seats: Record<string, Seat[]>
  loyalty?: Loyalty
  /** How much the price changed since the fares were chosen, per passenger, in GBP. */
  priceChange: number
  payment?: { reference: string; paidAt: Date }
}

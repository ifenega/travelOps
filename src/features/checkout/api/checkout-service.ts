import type { FlightSearch } from "@/features/flights"
import type {
  Booking,
  ChosenFlight,
  Contact,
  Loyalty,
  Passenger,
  PassengerDetails,
  PassengerType,
  Seat,
} from "../types"

// The checkout "backend" for now: bookings live in memory (gone after a refresh), like the chat
// service. Screens only use `checkoutService` and the hooks, so the real API replaces this file.
//
// Payment: the real version opens Paystack's popup with a reference from the backend, then asks
// the backend to verify the payment. Only the backend's answer decides "successful", never the
// popup's callback alone. The mock fails the first attempt when the contact email contains "fail".

/** Lets stories skip the waiting. */
export const mockCheckoutControls = { delay: 1200 }

export const seatPrice = 56
const priceChange = 0.32

type Listener = () => void
const bookings = new Map<string, Booking>()
const listeners = new Set<Listener>()
const paymentAttempts = new Map<string, number>()
const paymentsInFlight = new Map<string, Promise<PaymentResult>>()

function update(bookingId: string, change: (booking: Booking) => Booking) {
  const booking = bookings.get(bookingId)
  if (!booking) return
  bookings.set(bookingId, change(booking))
  for (const listener of listeners) listener()
}

const wait = () => new Promise((resolve) => setTimeout(resolve, mockCheckoutControls.delay))

/** Every flight of the trip, both ways, numbered for the seat chips. */
function flightCount(booking: Pick<Booking, "departing" | "returning">) {
  return booking.departing.flight.segments.length + booking.returning.flight.segments.length
}

/** The mock gives everyone a seat on every flight to start with: row 9, A, B, C… */
function defaultSeats(passengers: Passenger[], flights: number) {
  const seated = passengers.filter((passenger) => passenger.type !== "infant")
  return Object.fromEntries(
    seated.map((passenger, index) => [
      passenger.id,
      Array.from({ length: flights }, (_, flight) => ({
        flight: flight + 1,
        seat: `9${"ABCDEF"[index % 6]}`,
        price: seatPrice,
      })),
    ]),
  )
}

export type PaymentResult = { ok: true } | { ok: false; reason: string }

export const checkoutService = {
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  getBooking: (bookingId: string) => bookings.get(bookingId),

  /** Starts a booking for the chosen flights. Returns its id. */
  createBooking(input: {
    chatId: string
    search: FlightSearch
    travellers: Record<PassengerType, number>
    departing: ChosenFlight
    returning: ChosenFlight
  }) {
    const types: PassengerType[] = (["adult", "child", "infant"] as const).flatMap((type) =>
      Array<PassengerType>(input.travellers[type]).fill(type),
    )
    const passengers = types.map((type) => ({ id: crypto.randomUUID(), type }))
    const booking: Booking = {
      id: crypto.randomUUID().slice(0, 8),
      chatId: input.chatId,
      search: input.search,
      departing: input.departing,
      returning: input.returning,
      passengers,
      seats: defaultSeats(passengers, flightCount(input)),
      // The airline re-prices when a booking starts; the mock always goes up a little.
      priceChange,
    }
    bookings.set(booking.id, booking)
    return booking.id
  },

  savePassenger(bookingId: string, passengerId: string, details: PassengerDetails) {
    update(bookingId, (booking) => ({
      ...booking,
      passengers: booking.passengers.map((passenger) =>
        passenger.id === passengerId ? { ...passenger, details } : passenger,
      ),
    }))
  },

  saveContact(bookingId: string, contact: Contact) {
    update(bookingId, (booking) => ({ ...booking, contact }))
  },

  /** Sets (or with `seat` undefined, removes) a passenger's seat on one flight. */
  setSeat(bookingId: string, passengerId: string, flight: number, seat?: string) {
    update(bookingId, (booking) => {
      const others = (booking.seats[passengerId] ?? []).filter((s) => s.flight !== flight)
      const seats: Seat[] = seat ? [...others, { flight, seat, price: seatPrice }] : others
      return {
        ...booking,
        seats: { ...booking.seats, [passengerId]: seats.sort((a, b) => a.flight - b.flight) },
      }
    })
  },

  setLoyalty(bookingId: string, loyalty: Loyalty | undefined) {
    update(bookingId, (booking) => ({ ...booking, loyalty }))
  },

  /** Titles the airline accepts. Slow, like the real call: the "Pulling up passengers" screen. */
  async passengerOptions() {
    await wait()
    return { titles: ["Mr", "Mrs", "Ms", "Miss", "Dr"] }
  },

  /** Baggage allowances: the "Checking your baggage conditions" screen. */
  async baggage(bookingId: string) {
    await wait()
    const booking = bookings.get(bookingId)
    return {
      carryOn: "Includes personal item and carry-on bag",
      checkedBags: booking
        ? [booking.departing, booking.returning].map(({ fare }) => fare.checkedBags)
        : [],
    }
  },

  async loyaltyPrograms() {
    return [
      "Aegean Airlines - Miles & Bonus",
      "Air China - Phoenix Miles",
      "Air India - Flying Returns",
      "Air New Zealand - Airpoints",
      "ANA - Mileage Club",
      "Asiana Airlines - Asiana Club",
      "Turkish Airlines - Miles&Smiles",
    ]
  },

  /** Takes payment and verifies it. Calling it again while it's running returns the same attempt. */
  pay(bookingId: string): Promise<PaymentResult> {
    const running = paymentsInFlight.get(bookingId)
    if (running) return running
    const attempt = (async (): Promise<PaymentResult> => {
      await wait()
      const booking = bookings.get(bookingId)
      if (!booking) return { ok: false, reason: "This booking no longer exists." }
      if (booking.payment) return { ok: true }
      const attempts = (paymentAttempts.get(bookingId) ?? 0) + 1
      paymentAttempts.set(bookingId, attempts)
      if (attempts === 1 && booking.contact?.email.includes("fail")) {
        return {
          ok: false,
          reason: "Payment was declined or there was an error processing your transaction.",
        }
      }
      update(bookingId, (current) => ({
        ...current,
        payment: {
          reference: `ORD ${String(Math.floor(100000 + Math.random() * 900000))}`,
          paidAt: new Date(),
        },
      }))
      return { ok: true }
    })().finally(() => paymentsInFlight.delete(bookingId))
    paymentsInFlight.set(bookingId, attempt)
    return attempt
  },
}

/** What the booking costs: per passenger (with the change), seats, and the total. */
export function priceOf(booking: Booking) {
  const perPassenger = booking.returning.fare.price + booking.priceChange
  const passengers = perPassenger * booking.passengers.length
  const seats = Object.values(booking.seats)
    .flat()
    .reduce((sum, seat) => sum + seat.price, 0)
  return {
    perPassenger,
    passengers,
    change: booking.priceChange * booking.passengers.length,
    seats,
    total: passengers + seats,
  }
}

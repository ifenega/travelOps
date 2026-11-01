import type { Trip } from "../types"
import type { BookingsService } from "./bookings-service"
import { TripNotFoundError } from "./errors"
import { seedTeamMembers, seedTrips } from "./mock-data"

// An in-memory stand-in for the bookings API. Changes last until the page reloads.

/** Lets stories show loading and error states. */
export const mockControls = {
  /** Milliseconds each call takes. */
  delay: 300,
  /** When true, every call fails, as if the server were down. */
  fail: false,
  /** Puts the data back as it started (stories call this so they don't affect each other). */
  reset() {
    trips = structuredClone(seedTrips)
    shareLinks.clear()
    this.delay = 300
    this.fail = false
  },
}

let trips: Trip[] = structuredClone(seedTrips)
const shareLinks = new Map<string, string>()

/** Waits like a network call, then returns a copy so callers can't change the "server" data. */
async function respond<T>(getValue: () => T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, mockControls.delay))
  if (mockControls.fail) throw new Error("The server didn't respond")
  return structuredClone(getValue())
}

function findTrip(id: string) {
  const trip = trips.find((t) => t.id === id)
  if (!trip) throw new TripNotFoundError(id)
  return trip
}

/** Today as "YYYY-MM-DD" in the user's time zone, to compare with trip dates. */
function today() {
  return new Date().toLocaleDateString("en-CA")
}

export const mockBookingsService: BookingsService = {
  listTrips: (when) =>
    respond(() =>
      trips.filter((trip) =>
        when === "upcoming" ? trip.endDate >= today() : trip.endDate < today(),
      ),
    ),

  getTrip: (id) => respond(() => findTrip(id)),

  deleteTrip: (id) =>
    respond(() => {
      findTrip(id)
      trips = trips.filter((t) => t.id !== id)
    }),

  deleteBooking: (tripId, bookingId) =>
    respond(() => {
      const trip = findTrip(tripId)
      trip.bookings = trip.bookings.filter((b) => b.id !== bookingId)
    }),

  getShareLink: (tripId) => respond(() => shareLinks.get(tripId) ?? null),

  setShareLinkEnabled: (tripId, enabled) =>
    respond(() => {
      findTrip(tripId)
      if (!enabled) {
        shareLinks.delete(tripId)
        return null
      }
      const link =
        shareLinks.get(tripId) ?? `https://travelops.com/share/trip/${crypto.randomUUID()}`
      shareLinks.set(tripId, link)
      return link
    }),

  shareByEmail: (tripId) => respond(() => void findTrip(tripId)),

  listTeamMembers: () => respond(() => seedTeamMembers),
}

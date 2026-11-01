import type { TeamMember, Trip, TripsWhen } from "../types"
import { mockBookingsService } from "./mock-bookings-service"

// Everything the bookings screens ask the server for. There's no backend yet, so the app uses
// the mock. When the API exists, write a real implementation and change the last line only.

export type BookingsService = {
  /** Trips that haven't ended yet ("upcoming"), or have ("past"). Mine and the team's. */
  listTrips(when: TripsWhen): Promise<Trip[]>
  /** Throws TripNotFoundError if there's no such trip. */
  getTrip(id: string): Promise<Trip>
  deleteTrip(id: string): Promise<void>
  deleteBooking(tripId: string, bookingId: string): Promise<void>
  /** The trip's share link, or null when link sharing is off. */
  getShareLink(tripId: string): Promise<string | null>
  /** Turns link sharing on (returns the link) or off (returns null; the old link stops working). */
  setShareLinkEnabled(tripId: string, enabled: boolean): Promise<string | null>
  shareByEmail(tripId: string, memberIds: string[]): Promise<void>
  listTeamMembers(): Promise<TeamMember[]>
}

export const bookingsService: BookingsService = mockBookingsService

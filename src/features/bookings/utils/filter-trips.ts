import type { Trip, TripOwner, TripStatus } from "../types"

export type TripFilters = { owner: TripOwner; status?: TripStatus; q?: string }

/** The trips one tab shows: whose they are, then the status filter and the search text. */
export function filterTrips(trips: Trip[], { owner, status, q }: TripFilters) {
  const query = q?.trim().toLowerCase() ?? ""
  return trips.filter(
    (trip) =>
      trip.owner === owner &&
      (!status || trip.status === status) &&
      (!query ||
        trip.title.toLowerCase().includes(query) ||
        trip.destination.toLowerCase().includes(query)),
  )
}

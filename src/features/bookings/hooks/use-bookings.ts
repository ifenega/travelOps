import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/shared/ui/toast"
import { bookingsService } from "../api/bookings-service"
import type { Trip, TripsWhen } from "../types"

// The bookings screens' server data, through TanStack Query (loading, errors and caching).

const keys = {
  trips: ["trips"] as const,
  tripList: (when: TripsWhen) => ["trips", "list", when] as const,
  trip: (id: string) => ["trips", "detail", id] as const,
  shareLink: (tripId: string) => ["trips", "share-link", tripId] as const,
  teamMembers: ["team-members"] as const,
}

export function useTrips(when: TripsWhen) {
  return useQuery({ queryKey: keys.tripList(when), queryFn: () => bookingsService.listTrips(when) })
}

export function useTrip(id: string) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: keys.trip(id),
    queryFn: () => bookingsService.getTrip(id),
    // Opened from the list? Show the trip it already has straight away, then refresh it.
    initialData: () =>
      queryClient
        .getQueriesData<Trip[]>({ queryKey: ["trips", "list"] })
        .flatMap(([, trips]) => trips ?? [])
        .find((trip) => trip.id === id),
    initialDataUpdatedAt: 0,
  })
}

export function useTeamMembers() {
  return useQuery({ queryKey: keys.teamMembers, queryFn: () => bookingsService.listTeamMembers() })
}

/** Removes the trip from every list straight away, and puts it back if the server says no. */
export function useDeleteTrip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (trip: Trip) => bookingsService.deleteTrip(trip.id),
    onMutate: async (trip) => {
      await queryClient.cancelQueries({ queryKey: keys.trips })
      const lists = queryClient.getQueriesData<Trip[]>({ queryKey: ["trips", "list"] })
      queryClient.setQueriesData<Trip[]>({ queryKey: ["trips", "list"] }, (trips) =>
        trips?.filter((t) => t.id !== trip.id),
      )
      return { lists }
    },
    onError: (_error, trip, context) => {
      for (const [key, trips] of context?.lists ?? []) queryClient.setQueryData(key, trips)
      toast.error(`Couldn't delete ${trip.title}`, { description: "Please try again." })
    },
    onSuccess: (_data, trip) => {
      queryClient.removeQueries({ queryKey: keys.trip(trip.id) })
      toast.success(`${trip.title} deleted`)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["trips", "list"] }),
  })
}

export function useDeleteBooking(tripId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookingId: string) => bookingsService.deleteBooking(tripId, bookingId),
    onSuccess: () => toast.success("Booking deleted"),
    onError: () => toast.error("Couldn't delete the booking", { description: "Please try again." }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.trips }),
  })
}

export function useShareLink(tripId: string) {
  return useQuery({
    queryKey: keys.shareLink(tripId),
    queryFn: () => bookingsService.getShareLink(tripId),
  })
}

export function useSetShareLinkEnabled(tripId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (enabled: boolean) => bookingsService.setShareLinkEnabled(tripId, enabled),
    onSuccess: (link) => queryClient.setQueryData(keys.shareLink(tripId), link),
    onError: () =>
      toast.error("Couldn't change link sharing", { description: "Please try again." }),
  })
}

export function useShareByEmail(tripId: string) {
  return useMutation({
    mutationFn: (memberIds: string[]) => bookingsService.shareByEmail(tripId, memberIds),
    onError: () => toast.error("Couldn't send the trip", { description: "Please try again." }),
  })
}

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { flightsService } from "../api/flights-service"
import type { ResultsFilters } from "../search-params"
import type { FlightSearch, Leg } from "../types"

// The flight screens' server data, through TanStack Query (loading, errors and caching).

export function useFlightResults(
  search: FlightSearch,
  leg: Leg,
  filters: ResultsFilters,
  departingFarePrice?: number,
) {
  return useQuery({
    queryKey: ["flights", "results", search, leg, filters, departingFarePrice],
    queryFn: () => flightsService.search(search, leg, filters, departingFarePrice),
    // Keep the current page on screen while the next one loads, so the list doesn't jump.
    placeholderData: keepPreviousData,
  })
}

export function useRoundTrips(search: FlightSearch) {
  return useQuery({
    queryKey: ["flights", "round-trips", search],
    queryFn: () => flightsService.roundTrips(search),
  })
}

export function useFares(flightId: string) {
  return useQuery({
    queryKey: ["flights", "fares", flightId],
    queryFn: () => flightsService.fares(flightId),
  })
}

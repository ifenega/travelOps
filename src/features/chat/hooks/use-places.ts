import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"
import { searchPlaces } from "../api/places"
import type { TravelMode } from "../search"

/** Places matching what's been typed, for the From / To / Where autocomplete. */
export function usePlaces(query: string, mode: TravelMode) {
  const text = useDebouncedValue(query.trim())
  return useQuery({
    queryKey: ["places", mode, text],
    queryFn: () => searchPlaces(text, mode),
    enabled: text.length > 0,
    placeholderData: keepPreviousData, // keep showing the last results while the next ones load
  })
}

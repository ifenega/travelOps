import { QueryClient } from "@tanstack/react-query"

/** One place for TanStack Query defaults (the app and Storybook both use it). */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000, // reuse results for a minute before fetching again
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

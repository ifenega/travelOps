import { z } from "zod"
import { tripStatusSchema } from "./types"

// What the bookings URLs can say. Unknown or broken values fall back to the defaults, so an old
// or mistyped link still opens the page. routes.tsx uses these to check each URL.

/** /bookings?owner=team&when=past&status=booked&q=paris */
export const bookingsSearchSchema = z.object({
  owner: z.enum(["mine", "team"]).default("mine").catch("mine"),
  when: z.enum(["upcoming", "past"]).default("upcoming").catch("upcoming"),
  status: tripStatusSchema.optional().catch(undefined),
  q: z.string().optional().catch(undefined),
})

/** Left out of the URL when they're the value, so /bookings stays clean. */
export const bookingsSearchDefaults = { owner: "mine", when: "upcoming" } as const

/** /bookings/us-trip?tab=flights */
export const tripSearchSchema = z.object({
  tab: z.enum(["itinerary", "flights", "trains"]).default("itinerary").catch("itinerary"),
})

export const tripSearchDefaults = { tab: "itinerary" } as const

export type BookingsSearch = z.infer<typeof bookingsSearchSchema>
export type TripTab = z.infer<typeof tripSearchSchema>["tab"]

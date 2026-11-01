import { z } from "zod"
import type { DateRange } from "@/shared/ui/date-range-picker"

// The search bar's types and rules. The Zod schemas are the single source: the TypeScript types
// below come from them, and the same schemas will check the real API's data later.

export type TravelMode = "flights" | "trains" | "stays"

export const placeSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** "Lagos, Nigeria" — the second line in the autocomplete list. */
  region: z.string(),
  kind: z.enum(["airport", "city", "station"]),
  /** Where it is, for the map. */
  lng: z.number(),
  lat: z.number(),
})

export type Place = z.infer<typeof placeSchema>

/** Seated travellers (adults + children) per booking, the usual airline limit. */
export const maxSeatedTravellers = 9

export const travellersSchema = z
  .object({
    adults: z.number().int().min(1, "Add at least one adult"),
    /** One entry per child; null until an age is chosen. */
    childAges: z.array(z.number().int().min(2).max(17).nullable()),
    infants: z.number().int().min(0),
    pets: z.number().int().min(0),
  })
  .refine((t) => t.childAges.every((age) => age !== null), {
    message: "Choose an age for each child",
  })
  .refine((t) => t.infants <= t.adults, {
    message: "Each infant travels on an adult's lap, so add an adult for each infant",
  })
  .refine((t) => t.adults + t.childAges.length <= maxSeatedTravellers, {
    message: `You can book up to ${maxSeatedTravellers} travellers at once`,
  })

export type Travellers = z.infer<typeof travellersSchema>

const tripDatesSchema = z.custom<{ from: Date; to: Date }>(
  (dates) =>
    dates instanceof Object && "from" in dates && "to" in dates && !!dates.from && !!dates.to,
  "Choose your travel dates",
)

function required<T>(message: string) {
  return z.custom<T>((value) => value !== null && value !== undefined, message)
}

const journeySearchSchema = z
  .object({
    mode: z.enum(["flights", "trains"]),
    origin: required<Place>("Choose where you're leaving from"),
    destination: required<Place>("Choose where you're going"),
    dates: tripDatesSchema,
    travellers: required<Travellers>("Add who's travelling").pipe(travellersSchema),
  })
  .refine((search) => search.origin.id !== search.destination.id, {
    message: "Choose a destination that's different from where you're leaving",
    path: ["destination"],
  })

const staySearchSchema = z.object({
  mode: z.literal("stays"),
  destination: required<Place>("Choose where you're staying"),
  dates: tripDatesSchema,
  travellers: required<Travellers>("Add who's staying").pipe(travellersSchema),
})

export type SearchRequest = z.infer<typeof journeySearchSchema> | z.infer<typeof staySearchSchema>

/** What the search bar holds while the user fills it in. Anything can still be missing. */
export type SearchValues = {
  origin: Place | null
  destination: Place | null
  dates: DateRange | undefined
  travellers: Travellers | null
}

export type SearchField = keyof SearchValues

/** Checks the search bar. Returns the request, or the first problem in the order fields appear. */
export function validateSearch(
  mode: TravelMode,
  values: SearchValues,
):
  | { request: SearchRequest; error?: never }
  | { request?: never; error: { field: SearchField; message: string } } {
  const schema = mode === "stays" ? staySearchSchema : journeySearchSchema
  const result = schema.safeParse({ mode, ...values })
  if (result.success) return { request: result.data }
  const issue = result.error.issues[0]
  return { error: { field: issue.path[0] as SearchField, message: issue.message } }
}

/** "1 adult, 3 children, 2 infants" */
export function formatTravellers(travellers: Travellers) {
  const count = (n: number, one: string, many: string) => (n === 1 ? `1 ${one}` : `${n} ${many}`)
  return [
    count(travellers.adults, "adult", "adults"),
    travellers.childAges.length > 0 && count(travellers.childAges.length, "child", "children"),
    travellers.infants > 0 && count(travellers.infants, "infant", "infants"),
    travellers.pets > 0 && count(travellers.pets, "pet", "pets"),
  ]
    .filter(Boolean)
    .join(", ")
}

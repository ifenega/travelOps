import { z } from "zod"

// The results view's filters, sort and page, kept in the URL so a refresh or a shared link keeps
// them. Unknown or broken values fall back to the defaults.

export const resultsFiltersSchema = z.object({
  stops: z.enum(["any", "0", "1"]).default("any").catch("any"),
  airlines: z.array(z.string()).default([]).catch([]),
  time: z.enum(["any", "morning", "afternoon", "evening", "night"]).default("any").catch("any"),
  cabin: z.enum(["economy", "premium", "business", "first"]).default("economy").catch("economy"),
  policy: z.enum(["any", "within"]).default("any").catch("any"),
  sort: z.enum(["best", "cheapest", "fastest", "earliest"]).default("best").catch("best"),
  page: z.number().int().min(1).default(1).catch(1),
})

export type ResultsFilters = z.infer<typeof resultsFiltersSchema>

/** Left out of the URL when they're the value. */
export const resultsFiltersDefaults = {
  stops: "any",
  airlines: [],
  time: "any",
  cabin: "economy",
  policy: "any",
  sort: "best",
  page: 1,
} satisfies ResultsFilters

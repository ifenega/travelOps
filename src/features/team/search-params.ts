import { z } from "zod"

// What the /members URL can say. Broken values fall back to the defaults, so an old or mistyped
// link still opens the page. routes.tsx uses these to check the URL.

/** /members?tab=roles&q=ada&page=2&size=25&sort=-date */
export const teamSearchSchema = z.object({
  tab: z.enum(["members", "roles"]).default("members").catch("members"),
  q: z.string().optional().catch(undefined),
  page: z.number().int().min(1).default(1).catch(1),
  size: z
    .union([z.literal(10), z.literal(25), z.literal(50)])
    .default(10)
    .catch(10),
  sort: z.enum(["name", "-name", "date", "-date"]).default("name").catch("name"),
})

/** Left out of the URL when they're the value. */
export const teamSearchDefaults = { tab: "members", page: 1, size: 10, sort: "name" } as const

export type TeamSearch = z.infer<typeof teamSearchSchema>

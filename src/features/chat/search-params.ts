import { z } from "zod"
import { resultsFiltersDefaults, resultsFiltersSchema } from "@/features/flights"

// What a conversation URL can say. /chat/abc is the chat; /chat/abc?view=results shows its
// flight results full width (design screen 16), so Back returns to the chat.

export const conversationSearchSchema = resultsFiltersSchema.extend({
  view: z.enum(["chat", "results"]).default("chat").catch("chat"),
  leg: z.enum(["departing", "return"]).default("departing").catch("departing"),
  /** The chosen departing fare's id, once picked. */
  departing: z.string().optional().catch(undefined),
})

export type ConversationSearch = z.infer<typeof conversationSearchSchema>

export const conversationSearchDefaults = {
  ...resultsFiltersDefaults,
  view: "chat",
  leg: "departing",
} satisfies Partial<ConversationSearch>

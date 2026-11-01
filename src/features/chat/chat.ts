import { formatDateRange } from "@/shared/ui/date-range-picker"
import type { Place, SearchRequest, Travellers } from "./search"

// What a conversation is made of. The mock service and the real API both produce these.

export type QuestionOption = {
  id: string
  label: string
  description?: string
}

/** Sparky asking for one missing detail, answered by picking an option (design screen 14). */
export type Question = {
  prompt: string
  searchLabel: string
  options: QuestionOption[]
  state: "open" | "answered" | "dismissed"
}

export type UserMessage = {
  id: string
  role: "user"
  createdAt: number
  text: string
  /** Set when the message came from the search bar: shown as the summary bubble. */
  search?: SearchRequest
}

export type AssistantMessage = {
  id: string
  role: "assistant"
  createdAt: number
  text: string
  status: "thinking" | "streaming" | "done" | "error"
  question?: Question
}

export type ChatMessage = UserMessage | AssistantMessage

export type Chat = {
  id: string
  title: string
  createdAt: number
  messages: ChatMessage[]
}

/** "Lagos" from a city, or the city part of an airport's region ("Lagos, Nigeria" → "Lagos"). */
export function shortPlaceName(place: Place) {
  return place.kind === "city" ? place.name : place.region.split(",")[0]
}

/** "Round trip flight from Lagos to Athens", used as the bubble title and the chat title. */
export function describeSearch(search: SearchRequest) {
  const to = shortPlaceName(search.destination)
  if (search.mode === "stays") return `Stay in ${to}`
  const from = shortPlaceName(search.origin)
  return search.mode === "flights"
    ? `Round trip flight from ${from} to ${to}`
    : `Return train from ${from} to ${to}`
}

/** "1 adult, 4 children ages 4, 4, and 5, 2 infants" — the summary bubble's detail. */
export function describeTravellers({ adults, childAges, infants, pets }: Travellers) {
  const list = (items: (number | null)[]) =>
    items.length < 3 ? items.join(" and ") : `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`
  return [
    `${adults} ${adults === 1 ? "adult" : "adults"}`,
    childAges.length === 1 && `1 child age ${childAges[0]}`,
    childAges.length > 1 && `${childAges.length} children ages ${list(childAges)}`,
    infants > 0 && `${infants} ${infants === 1 ? "infant" : "infants"}`,
    pets > 0 && `${pets} ${pets === 1 ? "pet" : "pets"}`,
  ]
    .filter(Boolean)
    .join(", ")
}

/** The rows of the summary bubble: [label, value]. */
export function searchDetails(search: SearchRequest): [string, string][] {
  const rows: [string, string][] = [
    ["When", formatDateRange(search.dates) ?? ""],
    [
      search.mode === "stays"
        ? "Who's staying?"
        : search.mode === "flights"
          ? "Who's flying?"
          : "Who's travelling?",
      describeTravellers(search.travellers),
    ],
  ]
  if (search.mode === "flights") rows.push(["Cabin", "Economy"])
  return rows
}

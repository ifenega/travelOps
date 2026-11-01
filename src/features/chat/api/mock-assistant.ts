import type { FlightSearch } from "@/features/flights"
import { formatDateRange } from "@/shared/ui/date-range-picker"
import type { Question, UserMessage } from "../chat"
import { describeTravellers, shortPlaceName, toFlightSearch } from "../chat"
import type { SearchRequest } from "../search"
import { airportsInCountryOf } from "./places"

// Sparky's canned replies, so every chat state can be seen without the real LLM.
// Include "#fail" in a message to see a reply that breaks halfway (the error state), or
// "#ratelimit" to see the "too many messages" state.

type MockReply = {
  text: string
  question?: Omit<Question, "state">
  flights?: FlightSearch
  fail?: boolean
  rateLimited?: boolean
}

const intro =
  "Hello — I'm Sparky, your travel assistant. I can help plan and book full trips right here, including flights, stays and trains."

/**
 * @param search The search this reply is about: the message's own, or (after the user answers
 *   Sparky's question) the earlier search with the answer filled in.
 */
export function mockReply(message: UserMessage, search = message.search): MockReply {
  const fail = message.text.includes("#fail")
  if (message.text.includes("#ratelimit")) return { text: "", rateLimited: true }

  // Only ask when the search itself came in with a city; an answer ("I'm flexible") moves on.
  if (message.search && search?.mode !== "stays" && search?.origin.kind === "city") {
    const city = search.origin.name
    const airports = airportsInCountryOf(search.origin)
    return {
      fail,
      text: `${intro} For these ${search.mode}, I have the dates and passenger count, but I need one key detail before I can search properly: ${city} is too broad as an origin. Where in ${city} should your ${search.mode === "flights" ? "flight" : "train"} depart from?`,
      question: {
        prompt: `What ${search.mode === "flights" ? "airport" : "station"} would you like to depart from?`,
        searchLabel: "Search by location name",
        options: [
          ...airports.map((airport) => ({
            id: airport.id,
            label: shortPlaceName(airport),
            description: airport.name,
          })),
          { id: "flexible", label: "I'm flexible" },
        ],
      },
    }
  }

  if (search?.mode === "flights") return { fail, ...flightsReply(search) }

  if (search) {
    const to = shortPlaceName(search.destination)
    return {
      fail,
      text:
        search.mode === "stays"
          ? `${intro} I'm looking for places to stay in ${to} for ${describeTravellers(search.travellers)}. I'll show you the best options in a moment.`
          : `${intro} I'm searching trains from ${shortPlaceName(search.origin)} to ${to} for ${describeTravellers(search.travellers)}, with taxes and fees included. I'll show you the best options in a moment.`,
    }
  }

  return {
    fail,
    text: `Happy to help with "${message.text.replace("#fail", "").trim()}". Tell me where you're travelling from and to, and when, and I'll find the best options. You can also start a new chat with the Flights, Trains or Stays search.`,
  }
}

function flightsReply(search: Exclude<SearchRequest, { mode: "stays" }>) {
  const flights = toFlightSearch(search)
  return {
    text: `Here are the best round trips from ${flights.from.city} to ${flights.to.city} for ${formatDateRange(search.dates)}. I'm pricing this for ${flights.passengers} ${flights.passengers === 1 ? "passenger" : "passengers"} total with taxes and fees included: ${describeTravellers(search.travellers)}.`,
    flights,
  }
}

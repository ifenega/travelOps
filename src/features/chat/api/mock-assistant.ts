import type { Question, UserMessage } from "../chat"
import { describeTravellers, shortPlaceName } from "../chat"
import { airportsInCountryOf } from "./places"

// Sparky's canned replies, so every chat state can be seen without the real LLM.
// Include "#fail" in a message to see a reply that breaks halfway (the error state).

type MockReply = { text: string; question?: Omit<Question, "state">; fail?: boolean }

const intro =
  "Hello — I'm Sparky, your travel assistant. I can help plan and book full trips right here, including flights, stays and trains."

export function mockReply(message: UserMessage): MockReply {
  const fail = message.text.includes("#fail")
  const search = message.search

  if (search && search.mode !== "stays" && search.origin.kind === "city") {
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

  if (search) {
    const to = shortPlaceName(search.destination)
    return {
      fail,
      text:
        search.mode === "stays"
          ? `${intro} I'm looking for places to stay in ${to} for ${describeTravellers(search.travellers)}. I'll show you the best options in a moment.`
          : `${intro} I'm searching ${search.mode} from ${shortPlaceName(search.origin)} to ${to} for ${describeTravellers(search.travellers)}, with taxes and fees included. I'll show you the best options in a moment.`,
    }
  }

  return {
    fail,
    text: `Happy to help with "${message.text.replace("#fail", "").trim()}". Tell me where you're travelling from and to, and when, and I'll find the best options. You can also start a new chat with the Flights, Trains or Stays search.`,
  }
}

import { useNavigate } from "@tanstack/react-router"
import { ChevronLeft } from "@untitledui/icons"
import { useId, useState } from "react"
import { checkoutService } from "@/features/checkout"
import {
  ChosenFlightCard,
  type Fare,
  FlightResults,
  flightsService,
  formatDay,
} from "@/features/flights"
import { Button } from "@/shared/ui/button"
import { formatDateRange } from "@/shared/ui/date-range-picker"
import { Switch } from "@/shared/ui/switch"
import { chatService } from "../api/chat-service"
import type { AssistantMessage, Chat, UserMessage } from "../chat"
import { describeSearch, shortPlaceName } from "../chat"
import { formatTravellers, type SearchValues } from "../search"
import type { ConversationSearch } from "../search-params"
import { SearchForm } from "./search-bar/search-form"

/**
 * A chat's flight results, full width (design screens 16 and 19): pick a departing flight and
 * fare, then a return flight and fare, which starts checkout.
 */
export function ResultsView({
  chat,
  params,
  onParamsChange,
}: {
  chat: Chat
  params: ConversationSearch
  onParamsChange: (changes: Partial<ConversationSearch>) => void
}) {
  const navigate = useNavigate()
  // Open on wider screens, as designed; on phones it would fill the first screen, so it starts closed.
  const [showSearch, setShowSearch] = useState(
    () => window.matchMedia("(min-width: 40rem)").matches,
  )
  const switchId = useId()

  const userSearch = chat.messages.findLast(
    (message): message is UserMessage =>
      message.role === "user" && message.search?.mode === "flights",
  )?.search
  const flightSearch = chat.messages.findLast(
    (message): message is AssistantMessage => message.role === "assistant" && !!message.flights,
  )?.flights
  const [values, setValues] = useState<SearchValues>({
    origin: userSearch && userSearch.mode !== "stays" ? userSearch.origin : null,
    destination: userSearch?.destination ?? null,
    dates: userSearch?.dates,
    travellers: userSearch?.travellers ?? null,
  })

  if (!userSearch || userSearch.mode === "stays" || !flightSearch) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="font-medium text-lg">No flight results yet</h1>
        <p className="text-muted-foreground">Search for flights in the chat to see them here.</p>
        <Button variant="outline" onClick={() => onParamsChange({ view: "chat" })}>
          Back to chat
        </Button>
      </div>
    )
  }

  // Named again so the checks above still apply inside selectFare.
  const journey = userSearch
  const search = flightSearch
  const departingFare = params.departing ? flightsService.getFare(params.departing) : undefined
  const departingFlight = departingFare && flightsService.getFlight(departingFare.flightId)
  const leg = params.leg === "return" && departingFare && departingFlight ? "return" : "departing"
  const date = leg === "departing" ? search.departDate : search.returnDate

  function selectFare(fare: Fare) {
    if (leg === "departing") {
      onParamsChange({ leg: "return", departing: fare.id, page: 1 })
      return
    }
    const returningFlight = flightsService.getFlight(fare.flightId)
    if (!departingFare || !departingFlight || !returningFlight) return
    const { travellers } = journey
    const bookingId = checkoutService.createBooking({
      chatId: chat.id,
      search,
      travellers: {
        adult: travellers.adults,
        child: travellers.childAges.length,
        infant: travellers.infants,
      },
      departing: { flight: departingFlight, fare: departingFare },
      returning: { flight: returningFlight, fare },
    })
    navigate({ to: "/checkout/$bookingId/passengers", params: { bookingId } })
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => onParamsChange({ view: "chat" })}
        >
          <ChevronLeft className="size-4" />
          Back to chat
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm [&>span+span]:border-l [&>span+span]:pl-2">
          <span className="font-medium">
            {shortPlaceName(userSearch.origin)} to {shortPlaceName(userSearch.destination)}
          </span>
          <span className="text-muted-foreground">Round trip</span>
          <span className="text-muted-foreground">{formatDateRange(userSearch.dates)}</span>
          <span className="text-muted-foreground">{formatTravellers(userSearch.travellers)}</span>
        </p>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor={switchId}>Show search</label>
          <Switch id={switchId} checked={showSearch} onCheckedChange={setShowSearch} />
        </div>
      </div>

      {showSearch && (
        <SearchForm
          mode="flights"
          values={values}
          onChange={setValues}
          // A new search goes into the chat, where Sparky replies with fresh results.
          onSearch={(request) => {
            chatService.send(chat.id, describeSearch(request), request)
            onParamsChange({ view: "chat", leg: "departing", departing: undefined, page: 1 })
          }}
        />
      )}

      {leg === "return" && departingFlight && departingFare && (
        <ChosenFlightCard
          flight={departingFlight}
          fare={departingFare}
          onEdit={() => onParamsChange({ leg: "departing", departing: undefined, page: 1 })}
        />
      )}

      <h1 className="pt-2 text-lg">
        <span className="text-muted-foreground">
          {leg === "departing" ? "Departing flight" : "Return flight"}
        </span>{" "}
        for {formatDay(date)}
      </h1>

      <FlightResults
        // Each leg starts with fresh fares and pages.
        key={leg}
        search={flightSearch}
        leg={leg}
        filters={params}
        departingFarePrice={departingFare?.price}
        onFiltersChange={onParamsChange}
        onSelectFare={selectFare}
      />
    </div>
  )
}

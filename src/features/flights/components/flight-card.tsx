import { ChevronDown, ChevronRight } from "@untitledui/icons"
import { useId, useState } from "react"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import type { Fare, Flight } from "../types"
import { formatPrice, formatTime, summarizeFlight } from "../utils/format"
import { AirlineLogo } from "./airline-logo"
import { FareOptions } from "./fare-options"
import { FlightDetailsButton } from "./flight-details"
import { FlightTimes } from "./flight-times"
import { PolicyIcon } from "./policy-icon"

/** A flight in the full-width results (design screen 16). Select opens its fares underneath. */
export function FlightCard({
  flight,
  onSelectFare,
}: {
  flight: Flight
  onSelectFare: (fare: Fare) => void
}) {
  const [faresOpen, setFaresOpen] = useState(false)
  const faresId = useId()
  const { departAt, flightNumbers } = summarizeFlight(flight)

  return (
    <article className="rounded-xl border bg-background shadow-xs">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <AirlineLogo airline={flight.airline} />
            <h3 className="font-medium text-sm">
              {flight.airline.name}
              <span className="sr-only">, departs {formatTime(departAt)}</span>
            </h3>
            <ul aria-label="Flight numbers" className="flex flex-wrap gap-1.5">
              {flightNumbers.map((number) => (
                <li key={number}>
                  <Badge size="sm">{number}</Badge>
                </li>
              ))}
            </ul>
          </div>
          <FlightTimes flight={flight} />
          <div>
            <FlightDetailsButton flight={flight} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t pt-3 sm:w-36 sm:flex-col sm:items-end sm:justify-start sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
          <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
            <PolicyIcon policy={flight.policy} />
            <p className="text-right">
              <span className="block font-semibold">{formatPrice(flight.price)}</span>
              <span className="block text-muted-foreground text-xs">Round trip</span>
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            aria-expanded={faresOpen}
            aria-controls={faresId}
            onClick={() => setFaresOpen((open) => !open)}
          >
            Select
            <span className="sr-only"> {flight.airline.name} flight</span>
            {faresOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </Button>
        </div>
      </div>
      <div id={faresId} hidden={!faresOpen} className="mx-3 mb-3 rounded-xl bg-muted p-3">
        {faresOpen && <FareOptions flightId={flight.id} onSelect={onSelectFare} />}
      </div>
    </article>
  )
}

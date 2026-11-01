import { ArrowRight, Edit05 } from "@untitledui/icons"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import type { Fare, Flight } from "../types"
import { formatDay, formatPrice, formatTime, summarizeFlight } from "../utils/format"
import { AirlineLogo } from "./airline-logo"
import { FlightDetailsButton } from "./flight-details"

/** The departing flight already chosen, pinned above the return flights (design screen 19). */
export function ChosenFlightCard({
  flight,
  fare,
  onEdit,
}: {
  flight: Flight
  fare: Fare
  onEdit: () => void
}) {
  const { from, to, departAt } = summarizeFlight(flight)
  return (
    <section
      aria-label="Your departing flight"
      className="flex flex-col gap-3 rounded-xl border p-4 shadow-xs sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="flex flex-wrap items-center gap-2">
          <AirlineLogo airline={flight.airline} />
          <span className="sr-only">{flight.airline.name}: </span>
          {from.city} <Badge size="sm">{from.code}</Badge>
          <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground" />
          <span className="sr-only">to</span>
          {to.city} <Badge size="sm">{to.code}</Badge>
        </p>
        <p className="text-muted-foreground text-sm">
          {formatDay(departAt)} at {formatTime(departAt)} · <FlightDetailsButton flight={flight} />
        </p>
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-right">
          <span className="block font-semibold">{formatPrice(fare.price)}</span>
          <span className="block text-muted-foreground text-xs">{fare.name}</span>
        </p>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit05 className="size-4" />
          Edit departing flight
        </Button>
      </div>
    </section>
  )
}

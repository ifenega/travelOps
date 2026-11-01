import { ArrowRight } from "@untitledui/icons"
import { Banner } from "@/shared/ui/banner"
import { Button } from "@/shared/ui/button"
import { useRoundTrips } from "../hooks/use-flights"
import type { FlightSearch, RoundTrip } from "../types"
import { formatPrice } from "../utils/format"
import { AirlineLogo } from "./airline-logo"
import { FlightTimes } from "./flight-times"

/**
 * The best few round trips, inside the chat (design screen 15). Both "See more flights" and a
 * card's arrow open the full-width results.
 */
export function RoundTripResults({
  search,
  onSeeMore,
}: {
  search: FlightSearch
  onSeeMore: () => void
}) {
  const results = useRoundTrips(search)

  if (results.isPending) {
    return (
      <div role="status" className="flex flex-col gap-2 rounded-xl bg-muted p-2">
        <span className="sr-only">Loading flights…</span>
        {[1, 2, 3].map((row) => (
          <div key={row} className="h-28 rounded-lg bg-background" />
        ))}
      </div>
    )
  }
  if (results.isError) {
    return (
      <Banner variant="error" title="We couldn't load flights">
        <Button variant="outline" size="sm" className="mt-2" onClick={() => results.refetch()}>
          Try again
        </Button>
      </Banner>
    )
  }

  const { trips, total } = results.data
  return (
    <section aria-label="Flight results" className="flex flex-col gap-2 rounded-xl bg-muted p-2">
      <p className="px-1 text-muted-foreground text-sm">
        <span className="font-medium text-foreground">{trips.length}</span> of {total} results
      </p>
      <ul className="flex flex-col gap-2">
        {trips.map((trip) => (
          <li key={trip.departing.id}>
            <RoundTripCard trip={trip} onOpen={onSeeMore} />
          </li>
        ))}
      </ul>
      <Button variant="ghost" className="text-foreground" onClick={onSeeMore}>
        See more flights
      </Button>
    </section>
  )
}

function RoundTripCard({ trip, onOpen }: { trip: RoundTrip; onOpen: () => void }) {
  return (
    <article className="relative flex gap-3 rounded-lg bg-background p-3 shadow-xs">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {[trip.departing, trip.returning].map((flight) => (
          <div key={flight.id} className="flex items-center gap-3">
            <AirlineLogo airline={flight.airline} />
            <FlightTimes flight={flight} compact className="min-w-0 flex-1" />
          </div>
        ))}
      </div>
      <div className="flex w-20 shrink-0 flex-col items-end justify-between border-l pl-3">
        {/* The whole card is clickable; the button's name says what it opens. */}
        <button
          type="button"
          onClick={onOpen}
          className="rounded-full p-1 text-muted-foreground after:absolute after:inset-0 after:rounded-lg hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <ArrowRight aria-hidden="true" className="size-4" />
          <span className="sr-only">
            See {trip.departing.airline.name} round trip, {formatPrice(trip.departing.price)}
          </span>
        </button>
        <p className="text-right">
          <span className="block font-semibold text-sm">{formatPrice(trip.departing.price)}</span>
          <span className="block text-muted-foreground text-xs">Round trip</span>
        </p>
        <span />
      </div>
    </article>
  )
}

import { Link } from "@tanstack/react-router"
import { Edit05, TrendUp01 } from "@untitledui/icons"
import type { ReactNode } from "react"
import { FlightJourney, FlightTimes, formatDay, summarizeFlight } from "@/features/flights"
import { Dialog, DialogContent, DialogTrigger } from "@/shared/ui/dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet"
import { priceOf } from "../api/checkout-service"
import type { Booking } from "../types"
import { formatAmount } from "../utils/format"
import { SectionHeading } from "./checkout-shell"

const linkClassName =
  "w-fit rounded-sm text-primary-700 text-sm underline underline-offset-2 hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-ring dark:text-primary-300"

/**
 * The card beside every checkout step (design screens 20–22): both flights, what it costs, and a
 * way back to change the flights. On the itinerary it's just the price, with `children` below.
 */
export function OverviewCard({
  booking,
  title = "Overview",
  showFlights = true,
  children,
}: {
  booking: Booking
  title?: string
  showFlights?: boolean
  /** e.g. "Continue to checkout" */
  children?: ReactNode
}) {
  const price = priceOf(booking)
  const flights = [booking.departing.flight, booking.returning.flight]

  return (
    <section
      aria-labelledby="overview-heading"
      className="flex flex-col gap-4 rounded-xl bg-muted p-4 shadow-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <SectionHeading id="overview-heading">{title}</SectionHeading>
        <Link
          to="/chat/$chatId"
          params={{ chatId: booking.chatId }}
          search={{ view: "results", leg: "return", departing: booking.departing.fare.id }}
          className="flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-xs shadow-xs hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Edit05 aria-hidden="true" className="size-3.5" />
          Edit<span className="sr-only"> flights</span>
        </Link>
      </div>

      {showFlights && (
        <div className="flex flex-col gap-3">
          {flights.map((flight) => (
            <div key={flight.id} className="flex flex-col gap-1">
              <p className="text-muted-foreground text-sm">
                {formatDay(summarizeFlight(flight).departAt)}
              </p>
              <FlightTimes flight={flight} compact />
            </div>
          ))}
          <Sheet>
            <SheetTrigger className={linkClassName}>See flight details</SheetTrigger>
            <SheetContent title="Flight details">
              <div className="flex flex-col gap-4">
                {flights.map((flight) => (
                  <div key={flight.id} className="rounded-xl border px-3 pt-3">
                    <FlightJourney flight={flight} />
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      <dl className="flex flex-col gap-2 border-t pt-4 text-sm">
        <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
          <dt>{booking.passengers.length} × Passenger</dt>
          <dd className="font-medium">{formatAmount(price.passengers)}</dd>
          {price.change !== 0 && (
            <dd className="col-span-2 flex items-center gap-1 text-error-700 text-xs dark:text-error-300">
              <TrendUp01 aria-hidden="true" className="size-3.5" />
              {price.change > 0 ? "Increased" : "Decreased"} by{" "}
              {formatAmount(Math.abs(price.change))} since you chose these flights
            </dd>
          )}
        </div>
        {price.seats > 0 && (
          <div className="flex justify-between gap-3">
            <dt>Seats</dt>
            <dd className="font-medium">{formatAmount(price.seats)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3 font-medium">
          <dt>Total price</dt>
          <dd>{formatAmount(price.total)}</dd>
        </div>
      </dl>
      <PriceBreakdown booking={booking} />
      {children}
    </section>
  )
}

/** "See price breakdown". Not designed yet: a plain list in a dialog. */
function PriceBreakdown({ booking }: { booking: Booking }) {
  const price = priceOf(booking)
  const rows: [string, number][] = [
    [
      `${booking.departing.fare.name} and ${booking.returning.fare.name}`,
      booking.returning.fare.price,
    ],
    ["Price change since you chose", booking.priceChange],
    [`× ${booking.passengers.length} passengers`, price.passengers],
    ["Seats", price.seats],
  ]
  return (
    <Dialog>
      <DialogTrigger className={linkClassName}>See price breakdown</DialogTrigger>
      <DialogContent title="Price breakdown" description="All prices include taxes and fees.">
        <dl className="flex flex-col gap-2 text-sm">
          {rows.map(([label, amount]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{label}</dt>
              <dd>{formatAmount(amount)}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-3 border-t pt-2 font-medium">
            <dt>Total</dt>
            <dd>{formatAmount(price.total)}</dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  )
}

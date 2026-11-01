import { Link, useNavigate } from "@tanstack/react-router"
import { Fragment, type ReactNode } from "react"
import {
  AirlineLogo,
  type Flight,
  FlightTimes,
  formatDuration,
  isLongLayover,
  PolicyIcon,
  summarizeFlight,
} from "@/features/flights"
import { Avatar } from "@/shared/ui/avatar"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Chip } from "@/shared/ui/chip"
import { formatDateRange } from "@/shared/ui/date-range-picker"
import {
  BackLink,
  CheckoutColumns,
  CheckoutShell,
  SectionHeading,
} from "../components/checkout-shell"
import { OverviewCard } from "../components/overview-card"
import { useBooking } from "../hooks/use-booking"

// Checkout step 3 (design screen 26): the whole trip day by day, ideas to add trains or a stay,
// and the price with "Continue to checkout".

const dayHeading = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
})

export function ItineraryPage({ bookingId }: { bookingId: string }) {
  const booking = useBooking(bookingId)
  const navigate = useNavigate()
  if (!booking) return null

  const { search } = booking
  const travellers = booking.passengers.map((passenger, index) =>
    passenger.details
      ? `${passenger.details.firstName} ${passenger.details.lastName}`
      : `Passenger ${index + 1}`,
  )

  return (
    <CheckoutShell title="Review your trip itinerary" step="itinerary" chatId={booking.chatId}>
      <BackLink to="/checkout/$bookingId/extras" params={{ bookingId }}>
        Seats
      </BackLink>
      <CheckoutColumns
        aside={
          <OverviewCard booking={booking} title="Price breakdown" showFlights={false}>
            <Button
              size="lg"
              className="w-full"
              onClick={() =>
                navigate({ to: "/checkout/$bookingId/payment", params: { bookingId } })
              }
            >
              Continue to checkout
            </Button>
          </OverviewCard>
        }
      >
        <section className="flex flex-col gap-4">
          <SectionHeading as="h1">Review your trip itinerary</SectionHeading>
          <div className="border-y py-3">
            <p className="font-medium">Flight to {search.to.city}</p>
            <p className="text-muted-foreground text-sm">
              {formatDateRange({ from: search.departDate, to: search.returnDate })}
            </p>
          </div>
          <div className="flex flex-col gap-2 border-b pb-3">
            <h2 className="font-medium">Travellers</h2>
            <ul className="flex flex-wrap gap-1.5">
              {travellers.map((name, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: two travellers can share a name
                <li key={`${name}-${index}`}>
                  <Chip className="pl-1">
                    <Avatar name={name} className="size-5" />
                    {name}
                  </Chip>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Day flight={booking.departing.flight}>
          <Upsell
            title="Rent a train now, decide later"
            description="With free cancellation and unlimited mileage, you have total flexibility if plans change."
            action="Search trains"
          />
          <Upsell
            title={`Add a place to stay in ${search.to.city}`}
            description={formatDateRange({ from: search.departDate, to: search.returnDate }) ?? ""}
            action="Search stays"
          />
        </Day>
        <Day flight={booking.returning.flight} />
      </CheckoutColumns>
    </CheckoutShell>
  )
}

/** "Wednesday, July 8", then the flight's segments with the layovers between them. */
function Day({ flight, children }: { flight: Flight; children?: ReactNode }) {
  const { departAt, layovers } = summarizeFlight(flight)
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading>{dayHeading.format(departAt)}</SectionHeading>
      <ol className="flex flex-col gap-3 border-l border-dashed pl-4">
        {flight.segments.map((segment, index) => (
          <Fragment key={`${segment.flightNumber}-${segment.from.code}`}>
            {index > 0 && (
              <li className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
                {`${formatDuration(layovers[index - 1].minutes)} • Change planes in ${segment.from.city} (${segment.from.code})`}
                {isLongLayover(layovers[index - 1].minutes) && (
                  <Badge size="sm" variant="info">
                    Long layover
                  </Badge>
                )}
              </li>
            )}
            <li className="flex flex-col gap-3 rounded-xl border p-3 shadow-xs">
              <div className="flex items-center gap-2">
                <AirlineLogo airline={segment.airline} />
                <span className="font-medium text-sm">{segment.airline.name}</span>
                <Badge size="sm">{segment.flightNumber}</Badge>
                <span className="ml-auto">
                  <PolicyIcon policy={flight.policy} />
                </span>
              </div>
              {/* One segment shown as its own flight, for the times row. */}
              <FlightTimes flight={{ ...flight, segments: [segment] }} />
            </li>
          </Fragment>
        ))}
        {children}
      </ol>
    </section>
  )
}

/** "Rent a train now, decide later → Search trains". Both start a new chat for now. */
function Upsell({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: string
}) {
  return (
    <li className="flex flex-col gap-3 rounded-xl bg-warning-100 p-4 sm:flex-row sm:items-center dark:bg-warning-600/15">
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Button asChild variant="outline" size="sm" className="rounded-full">
        <Link to="/chat">{action}</Link>
      </Button>
    </li>
  )
}

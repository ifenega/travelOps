import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Edit05, Plane, Trash01 } from "@untitledui/icons"
import { useRef, useState } from "react"
import { AirlineLogo } from "@/features/flights"
import { Avatar } from "@/shared/ui/avatar"
import { Banner } from "@/shared/ui/banner"
import { Button } from "@/shared/ui/button"
import { Chip } from "@/shared/ui/chip"
import { toast } from "@/shared/ui/toast"
import { checkoutService } from "../api/checkout-service"
import {
  BackLink,
  CheckoutColumns,
  CheckoutShell,
  SectionHeading,
} from "../components/checkout-shell"
import { LoadingScreen } from "../components/loading-screen"
import { LoyaltyDialog } from "../components/loyalty-dialog"
import { OverviewCard } from "../components/overview-card"
import { SeatsDialog } from "../components/seats-dialog"
import { useBooking } from "../hooks/use-booking"
import type { Booking } from "../types"
import { formatAmount } from "../utils/format"

// Checkout step 2 (design screens 24–25): seats, loyalty points and baggage.

export function ExtrasPage({ bookingId }: { bookingId: string }) {
  const booking = useBooking(bookingId)
  const baggage = useQuery({
    queryKey: ["checkout", "baggage", bookingId],
    queryFn: () => checkoutService.baggage(bookingId),
  })
  if (!booking) return null

  return (
    <CheckoutShell title="Seats and extras" step="passengers" chatId={booking.chatId}>
      {baggage.isPending ? (
        <LoadingScreen message="Checking your baggage conditions." />
      ) : baggage.isError ? (
        <Banner variant="error" title="We couldn't check your baggage conditions">
          <Button variant="outline" size="sm" className="mt-2" onClick={() => baggage.refetch()}>
            Try again
          </Button>
        </Banner>
      ) : (
        <Extras booking={booking} baggage={baggage.data} />
      )}
    </CheckoutShell>
  )
}

function Extras({
  booking,
  baggage,
}: {
  booking: Booking
  baggage: { carryOn: string; checkedBags: number[] }
}) {
  const navigate = useNavigate()
  const [seatsOpen, setSeatsOpen] = useState(false)
  const [loyaltyOpen, setLoyaltyOpen] = useState(false)
  const loyaltyButton = useRef<HTMLButtonElement>(null)
  const seatsButton = useRef<HTMLButtonElement>(null)
  const airline = booking.departing.flight.airline
  const legs = [booking.departing.flight, booking.returning.flight]

  return (
    <>
      <BackLink to="/checkout/$bookingId/passengers" params={{ bookingId: booking.id }}>
        Passengers
      </BackLink>
      <CheckoutColumns aside={<OverviewCard booking={booking} />}>
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <SectionHeading as="h1">Seats</SectionHeading>
            <Button
              ref={seatsButton}
              variant="outline"
              size="sm"
              onClick={() => setSeatsOpen(true)}
            >
              Edit seats
            </Button>
          </div>
          <ul className="border-t">
            {booking.passengers.map((passenger, index) => {
              const name = passenger.details
                ? `${passenger.details.firstName} ${passenger.details.lastName}`
                : `Passenger ${index + 1}`
              const seats = booking.seats[passenger.id] ?? []
              return (
                <li key={passenger.id} className="flex gap-3 border-b py-3">
                  <Avatar name={name} className="size-9" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="font-medium">{name}</p>
                    {passenger.type === "infant" ? (
                      <Banner
                        variant="warning"
                        title="Infants under 2 must travel on the accompanying adult's lap"
                      />
                    ) : seats.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No seats chosen</p>
                    ) : (
                      <ul aria-label={`${name}'s seats`} className="flex flex-wrap gap-1.5">
                        {seats.map((seat) => (
                          <li key={seat.flight}>
                            <Chip
                              removeLabel={`Remove seat ${seat.seat} on flight ${seat.flight}`}
                              onRemove={() => {
                                checkoutService.setSeat(booking.id, passenger.id, seat.flight)
                                toast.success(`Seat ${seat.seat} removed`)
                                // The chip is gone; keep focus nearby.
                                seatsButton.current?.focus()
                              }}
                            >
                              Flight {seat.flight} · {seat.seat} · {formatAmount(seat.price)}
                            </Chip>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-labelledby="loyalty-heading" className="flex flex-col gap-3">
          <SectionHeading id="loyalty-heading">Loyalty points</SectionHeading>
          <div className="flex flex-wrap items-center gap-3 border-y py-3">
            <AirlineLogo airline={airline} className="size-9" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{airline.name}</p>
              <p className="text-muted-foreground text-xs">
                {booking.loyalty
                  ? `${booking.loyalty.program} · ${booking.loyalty.number}`
                  : "No loyalty program selected"}
              </p>
            </div>
            {booking.loyalty ? (
              <div className="flex gap-2">
                <Button
                  ref={loyaltyButton}
                  variant="outline"
                  size="sm"
                  onClick={() => setLoyaltyOpen(true)}
                >
                  Edit
                  <Edit05 className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    checkoutService.setLoyalty(booking.id, undefined)
                    toast.success("Loyalty program removed")
                    requestAnimationFrame(() => loyaltyButton.current?.focus())
                  }}
                >
                  Delete
                  <Trash01 className="size-4" />
                </Button>
              </div>
            ) : (
              <Button
                ref={loyaltyButton}
                variant="outline"
                size="sm"
                onClick={() => setLoyaltyOpen(true)}
              >
                Add loyalty
              </Button>
            )}
          </div>
        </section>

        <section aria-labelledby="carry-on-heading" className="flex flex-col gap-3">
          <SectionHeading id="carry-on-heading">Carry-on baggage</SectionHeading>
          <div className="flex flex-col gap-2 border-y py-3 text-sm">
            <p>Applies to both departing and return journeys</p>
            <Banner variant="warning" title="Carry-on bag">
              {baggage.carryOn}
            </Banner>
          </div>
        </section>

        <section aria-labelledby="checked-heading" className="flex flex-col gap-3">
          <SectionHeading id="checked-heading">Checked baggage</SectionHeading>
          <ul className="border-t">
            {legs.map((flight, index) => {
              const first = flight.segments[0]
              const last = flight.segments[flight.segments.length - 1]
              const bags = baggage.checkedBags[index] ?? 0
              return (
                <li key={flight.id} className="flex gap-3 border-b py-3">
                  <AirlineLogo airline={flight.airline} className="size-9" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="flex flex-wrap items-center gap-1.5 font-medium">
                      {first.from.city} ({first.from.code})
                      <Plane
                        aria-hidden="true"
                        className="size-4 rotate-45 text-muted-foreground"
                      />
                      <span className="sr-only">to</span>
                      {last.to.city} ({last.to.code})
                    </p>
                    <Banner
                      variant="warning"
                      title={
                        bags === 0
                          ? "No checked bags included"
                          : `${bags} checked ${bags === 1 ? "bag" : "bags"} included per passenger`
                      }
                    />
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="text-muted-foreground text-sm">
            Find out more about baggage sizes and weight limits on the{" "}
            <a
              href={airline.website}
              target="_blank"
              rel="noreferrer"
              className="text-primary-700 underline dark:text-primary-300"
            >
              {airline.name} website
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </section>

        <Button
          size="lg"
          className="w-full"
          onClick={() =>
            navigate({ to: "/checkout/$bookingId/itinerary", params: { bookingId: booking.id } })
          }
        >
          Proceed
        </Button>
      </CheckoutColumns>

      <SeatsDialog
        booking={booking}
        open={seatsOpen}
        onOpenChange={setSeatsOpen}
        returnFocusTo={seatsButton}
      />
      <LoyaltyDialog
        open={loyaltyOpen}
        onOpenChange={setLoyaltyOpen}
        loyalty={booking.loyalty}
        returnFocusTo={loyaltyButton}
        onSave={(loyalty) => {
          checkoutService.setLoyalty(booking.id, loyalty)
          toast.success("Loyalty program saved")
        }}
      />
    </>
  )
}

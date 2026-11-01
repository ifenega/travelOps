import { useNavigate } from "@tanstack/react-router"
import { DotsHorizontal, Edit05, Plane, Train, Trash01 } from "@untitledui/icons"
import { useRef, useState } from "react"
import { focusPageHeading } from "@/shared/lib/focus"
import { AlertDialog, AlertDialogContent } from "@/shared/ui/alert-dialog"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { useDeleteBooking } from "../hooks/use-bookings"
import type { Booking, Place } from "../types"
import { formatDuration, formatTime, minutesBetween } from "../utils/format"
import { TripStatusBadge } from "./trip-status-badge"

/** One leg on the trip page: "LOS - DOH", where and when it leaves and arrives. */
export function BookingCard({ tripId, booking }: { tripId: string; booking: Booking }) {
  const { departure, arrival } = booking
  const Icon = booking.transport === "flight" ? Plane : Train
  const kind = booking.transport === "flight" ? "Flight" : "Train"
  const duration = formatDuration(minutesBetween(departure.time, arrival.time))

  return (
    <article className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs">
      <div className="flex items-center gap-2 py-2 pr-2 pl-4">
        <Icon aria-hidden="true" className="size-5 shrink-0" />
        <h3 className="min-w-0 flex-1 font-semibold text-sm">
          <span aria-hidden="true">
            {departure.place.code} - {arrival.place.code}
          </span>
          <span className="sr-only">
            {kind} from {placeName(departure.place)} to {placeName(arrival.place)}
          </span>
        </h3>
        <TripStatusBadge status={booking.status} />
        <BookingMenu
          tripId={tripId}
          booking={booking}
          label={`${kind} ${departure.place.code} to ${arrival.place.code}`}
        />
      </div>

      <p className="bg-primary-50 px-4 py-1.5 text-primary-700 text-xs dark:bg-primary-600/15 dark:text-primary-300">
        {booking.status === "booked" ? "Booked on" : "Waiting for"} {booking.provider}
      </p>

      <div className="grid grid-cols-[auto_1fr_auto] gap-x-6 gap-y-5 p-4 text-sm">
        <TimeCell label="Depart" time={departure.time} timeZone={departure.place.timeZone} />
        <div>
          <p>{placeName(departure.place, { withCountry: true })}</p>
          <p className="text-muted-foreground text-xs">
            {booking.vehicle} · Duration {duration}
          </p>
          <p className="text-xs">
            Confirmation <span className="font-medium">{booking.confirmation}</span>
          </p>
        </div>
        <ProviderMark provider={booking.provider} />

        <TimeCell label="Arrive" time={arrival.time} timeZone={arrival.place.timeZone} />
        <p>{placeName(arrival.place, { withCountry: true })}</p>
      </div>
    </article>
  )
}

/** "Lagos (LOS)", or with the country "Lagos, NG (LOS)". */
function placeName(place: Place, { withCountry = false } = {}) {
  return withCountry
    ? `${place.city}, ${place.country} (${place.code})`
    : `${place.city} (${place.code})`
}

/** "6:45 PM" over "Depart". In the page the label comes first, so it's read "Depart, 6:45 PM". */
function TimeCell({ label, time, timeZone }: { label: string; time: string; timeZone: string }) {
  return (
    <div className="flex flex-col-reverse justify-end">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">
        <time dateTime={time}>{formatTime(time, timeZone)}</time>
      </p>
    </div>
  )
}

/** A letter tile for the airline or train company. We don't have their logos. */
function ProviderMark({ provider }: { provider: string }) {
  const letters = provider
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
  return (
    <span
      aria-hidden="true"
      className="row-span-2 flex size-8 items-center justify-center rounded-md bg-muted font-semibold text-muted-foreground text-xs"
    >
      {letters}
    </span>
  )
}

function BookingMenu({
  tripId,
  booking,
  label,
}: {
  tripId: string
  booking: Booking
  label: string
}) {
  const navigate = useNavigate()
  const deleteBooking = useDeleteBooking(tripId)
  const [confirming, setConfirming] = useState(false)
  const deleted = useRef(false)
  const menuButton = useRef<HTMLButtonElement>(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={menuButton}
            variant="ghost"
            size="icon"
            aria-label={`Manage ${label}`}
            className="print:hidden"
          >
            <DotsHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Manage booking</DropdownMenuLabel>
          <DropdownMenuItem
            icon={Edit05}
            description="Makes changes to your booking"
            onSelect={() => navigate({ to: "/chat", search: { tripId, bookingId: booking.id } })}
          >
            Edit booking
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={Trash01}
            variant="destructive"
            description="Remove booking from your list"
            onSelect={() => setConfirming(true)}
          >
            Delete booking
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent
          title="Delete this booking?"
          description={`${label} will be removed from the trip. This doesn't cancel the ticket.`}
          confirmLabel="Delete"
          onConfirm={() => {
            deleted.current = true
            deleteBooking.mutate(booking.id)
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            // The card is about to go, so after a delete focus goes to the trip's title.
            if (deleted.current) focusPageHeading()
            else menuButton.current?.focus()
          }}
        />
      </AlertDialog>
    </>
  )
}

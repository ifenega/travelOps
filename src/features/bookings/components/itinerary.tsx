import { useId } from "react"
import type { Booking } from "../types"
import { formatDay, formatDuration } from "../utils/format"
import { buildItinerary, type ItineraryDay, type Stop } from "../utils/itinerary"
import { BookingCard } from "./booking-card"

/** The trip page's timeline: a heading per day, then stops (dots) and bookings (cards) in order. */
export function Itinerary({ tripId, bookings }: { tripId: string; bookings: Booking[] }) {
  const days = buildItinerary(bookings)
  if (days.length === 0) {
    return <p className="py-8 text-center text-muted-foreground text-sm">Nothing booked yet.</p>
  }
  return (
    <div className="flex flex-col gap-6">
      {days.map((day) => (
        <Day key={day.date} tripId={tripId} day={day} />
      ))}
    </div>
  )
}

function Day({ tripId, day }: { tripId: string; day: ItineraryDay }) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId}>
      {/* The text is "Sat, May 1"; CSS makes it capitals, so screen readers don't spell out "SAT". */}
      <h2 id={headingId} className="font-display text-2xl uppercase leading-none tracking-normal">
        {formatDay(day.date)}
      </h2>
      <ol className="mt-1 flex flex-col">
        {day.items.map((item) =>
          item.kind === "stop" ? (
            <StopItem key={`${item.place.code}-${item.time}`} stop={item} />
          ) : (
            <li key={item.booking.id}>
              <BookingCard tripId={tripId} booking={item.booking} />
            </li>
          ),
        )}
      </ol>
    </section>
  )
}

/** A dot on the line: "Doha, DOH" and, for a connection, "Layover in Doha: ~2h 35m". */
function StopItem({ stop }: { stop: Stop }) {
  return (
    <li className="relative flex gap-3 py-3 pl-1 text-sm before:absolute before:top-0 before:bottom-0 before:left-2.25 before:w-px before:bg-gray-300 first:before:top-4.5 last:before:bottom-auto last:before:h-4.5 dark:before:bg-gray-700">
      <span
        aria-hidden="true"
        className="relative mt-1 size-2.5 shrink-0 rounded-full bg-foreground"
      />
      <div>
        <p>
          {stop.place.city}, {stop.place.code}
        </p>
        {stop.layoverMinutes !== undefined && (
          <p className="text-muted-foreground text-xs">
            Layover in {stop.place.city}: ~{formatDuration(stop.layoverMinutes)}
          </p>
        )}
      </div>
    </li>
  )
}

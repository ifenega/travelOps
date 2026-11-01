import { Plane, Power01, Wifi } from "@untitledui/icons"
import { Fragment } from "react"
import { Badge } from "@/shared/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/shared/ui/dialog"
import type { Amenity, Flight, Segment } from "../types"
import { cabinLabels } from "../types"
import {
  daysLater,
  formatAirport,
  formatDay,
  formatDuration,
  formatTime,
  isLongLayover,
  minutesBetween,
  summarizeFlight,
} from "../utils/format"

// A flight's timeline (design screen 18): each segment's airports and times, the airline, plane
// and cabin, amenities, and the layovers between segments.

const amenityLabels: Record<Amenity, { label: string; icon: typeof Wifi }> = {
  power: { label: "Power and USB outlets", icon: Power01 },
  wifi: { label: "Wi-Fi available", icon: Wifi },
}

/** "Depart • Mon, Jul 6 ... 14h 10m", then the timeline. */
export function FlightJourney({ flight }: { flight: Flight }) {
  const summary = summarizeFlight(flight)
  return (
    <section aria-label={flight.leg === "departing" ? "Departing flight" : "Return flight"}>
      <h3 className="flex items-baseline justify-between gap-3 border-b pb-3 text-sm">
        <span>
          {flight.leg === "departing" ? "Depart" : "Return"} • {formatDay(summary.departAt)}
        </span>
        <span className="text-muted-foreground">{formatDuration(summary.minutes)}</span>
      </h3>
      <ol className="flex flex-col">
        {flight.segments.map((segment, index) => (
          <Fragment key={`${segment.flightNumber}-${segment.from.code}`}>
            {index > 0 && <Layover from={flight.segments[index - 1]} to={segment} />}
            <SegmentItem segment={segment} />
          </Fragment>
        ))}
      </ol>
    </section>
  )
}

function SegmentItem({ segment }: { segment: Segment }) {
  const minutes = minutesBetween(segment.departAt, segment.arriveAt)
  const nextDay = daysLater(segment.departAt, segment.arriveAt)
  return (
    <li className="flex flex-col gap-2 border-b py-3 text-sm last:border-b-0">
      <div className="grid grid-cols-[1rem_1fr] gap-x-3">
        <Dot />
        <Stop
          airport={formatAirport(segment.from)}
          time={formatTime(segment.departAt)}
          day={formatDay(segment.departAt)}
        />
        <div aria-hidden="true" className="flex justify-center py-1">
          <Plane className="my-auto size-3.5 rotate-135 text-muted-foreground" />
        </div>
        <p className="flex flex-wrap items-center gap-2 py-2 text-muted-foreground">
          <span>
            <span className="sr-only">Flight time </span>
            {formatDuration(minutes)}
          </span>
          {nextDay > 0 && <Badge size="sm">Overnight flight</Badge>}
        </p>
        <Dot />
        <Stop
          airport={formatAirport(segment.to)}
          time={formatTime(segment.arriveAt)}
          day={formatDay(segment.arriveAt)}
          nextDay={nextDay}
        />
      </div>
      <p className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        <span>
          {segment.airline.name} {segment.flightNumber}
        </span>
        <Badge size="sm">{segment.aircraft}</Badge>
        <Badge size="sm">{cabinLabels[segment.cabin]}</Badge>
      </p>
      <ul aria-label="Amenities" className="flex flex-wrap gap-1.5">
        {segment.amenities.map((amenity) => {
          const { label, icon: Icon } = amenityLabels[amenity]
          return (
            <li key={amenity}>
              <Badge size="sm" className="inline-flex items-center gap-1">
                <Icon aria-hidden="true" className="size-3" />
                {label}
              </Badge>
            </li>
          )
        })}
      </ul>
    </li>
  )
}

function Dot() {
  return (
    <span
      aria-hidden="true"
      className="mt-1.5 size-1.5 justify-self-center rounded-full bg-gray-400"
    />
  )
}

function Stop({
  airport,
  time,
  day,
  nextDay = 0,
}: {
  airport: string
  time: string
  day: string
  nextDay?: number
}) {
  return (
    <div>
      <p>{airport}</p>
      <p className="text-muted-foreground">
        <span
          className={
            nextDay > 0
              ? "font-medium text-primary-700 dark:text-primary-300"
              : "font-medium text-foreground"
          }
        >
          {time}
        </span>
        {nextDay > 0 && <sup className="text-xs">+{nextDay}</sup>} {day}
      </p>
    </div>
  )
}

function Layover({ from, to }: { from: Segment; to: Segment }) {
  const minutes = minutesBetween(from.arriveAt, to.departAt)
  return (
    <li className="flex flex-wrap items-center gap-2 border-b py-3 text-muted-foreground text-sm">
      {formatDuration(minutes)} • Change planes in {to.from.city} ({to.from.code})
      {isLongLayover(minutes) && (
        <Badge size="sm" variant="info">
          Long layover
        </Badge>
      )}
    </li>
  )
}

/** The "See flight details" link-style button and its dialog, on every flight card. */
export function FlightDetailsButton({ flight }: { flight: Flight }) {
  const { departAt } = summarizeFlight(flight)
  return (
    <Dialog>
      <DialogTrigger className="rounded-sm text-primary-700 text-sm underline underline-offset-2 hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-ring dark:text-primary-300">
        See flight details
        <span className="sr-only">
          {" "}
          for the {flight.airline.name} flight at {formatTime(departAt)}
        </span>
      </DialogTrigger>
      <DialogContent title="Flight details" className="pt-1">
        <FlightJourney flight={flight} />
      </DialogContent>
    </Dialog>
  )
}

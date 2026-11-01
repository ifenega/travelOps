import type { Booking, Place } from "../types"
import { localDate, minutesBetween } from "./format"

// Turns a trip's legs into the timeline on the trip page: days, each with stops (the dots)
// and bookings (the cards) in order.
//
//   Sat, May 1   • Lagos, LOS
//                [LOS - DOH]
//   Sun, May 2   • Doha, DOH · Layover in Doha: ~2h 35m
//                [DOH - JFK]
//                • New York, JFK

export type Stop = {
  kind: "stop"
  place: Place
  /** When you're at this stop, used to put it under the right day. */
  time: string
  /** Set when you arrive and leave from the same place within a day. */
  layoverMinutes?: number
}

export type Leg = { kind: "booking"; booking: Booking }

export type ItineraryDay = {
  /** "YYYY-MM-DD", local to the place. */
  date: string
  items: (Stop | Leg)[]
}

/** A wait longer than this is a stay, not a layover. */
const maxLayoverMinutes = 24 * 60

export function buildItinerary(bookings: Booking[]): ItineraryDay[] {
  const items: (Stop | Leg)[] = []

  bookings.forEach((booking, index) => {
    const previous = bookings[index - 1]
    const { departure } = booking

    if (previous && previous.arrival.place.code === departure.place.code) {
      // A connection: one stop for arriving and leaving again.
      const wait = minutesBetween(previous.arrival.time, departure.time)
      items.push({
        kind: "stop",
        place: departure.place,
        time: departure.time,
        layoverMinutes: wait <= maxLayoverMinutes ? wait : undefined,
      })
    } else {
      // The first leg, or the next leg leaves from somewhere else: show where the last one ended.
      if (previous) items.push(arrivalStop(previous))
      items.push({ kind: "stop", place: departure.place, time: departure.time })
    }

    items.push({ kind: "booking", booking })
  })

  const last = bookings.at(-1)
  if (last) items.push(arrivalStop(last))

  return groupByDay(items)
}

function arrivalStop(booking: Booking): Stop {
  return { kind: "stop", place: booking.arrival.place, time: booking.arrival.time }
}

function itemDate(item: Stop | Leg) {
  return item.kind === "stop"
    ? localDate(item.time, item.place.timeZone)
    : localDate(item.booking.departure.time, item.booking.departure.place.timeZone)
}

/** Starts a new day whenever the local date changes. */
function groupByDay(items: (Stop | Leg)[]): ItineraryDay[] {
  const days: ItineraryDay[] = []
  for (const item of items) {
    const date = itemDate(item)
    const current = days.at(-1)
    if (current?.date === date) current.items.push(item)
    else days.push({ date, items: [item] })
  }
  return days
}

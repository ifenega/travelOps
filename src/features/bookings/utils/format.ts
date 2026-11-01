import type { Trip } from "../types"

// Dates, times and money for the bookings screens. Each formatter takes an optional locale;
// screens leave it out so the user's own locale is used, and tests pass "en-US".

/** Trip dates are plain days ("2027-07-08"), so they're formatted in UTC to stop them shifting a day. */
function day(date: string) {
  return new Date(`${date}T00:00:00Z`)
}

/** "Jul 8 – Aug 18", or with weekdays "Sat, May 1 – Sat, May 8". */
export function formatDateRange(
  start: string,
  end: string,
  { weekday = false, locale }: { weekday?: boolean; locale?: string } = {},
) {
  return new Intl.DateTimeFormat(locale, {
    weekday: weekday ? "short" : undefined,
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).formatRange(day(start), day(end))
}

/** A day heading: "Sat, May 1". */
export function formatDay(date: string, locale?: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(day(date))
}

/** "£1,466.58" */
export function formatPrice({ amount, currency }: Trip["price"], locale?: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount)
}

/** The local time at the place: "6:45 PM". */
export function formatTime(isoTime: string, timeZone: string, locale?: string) {
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone }).format(
    new Date(isoTime),
  )
}

/** The local calendar day at the place, as "YYYY-MM-DD". */
export function localDate(isoTime: string, timeZone: string) {
  return new Date(isoTime).toLocaleDateString("en-CA", { timeZone })
}

export function minutesBetween(fromIso: string, toIso: string) {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 60_000)
}

/** "6h 10m", "2h", "45m". */
export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}m`
  if (rest === 0) return `${hours}h`
  return `${hours}h ${rest}m`
}

/** "Roundtrip LHR - ATH" or "One way LOS - PHL", from the trip's first and last legs. */
export function formatRoute(trip: Trip) {
  const first = trip.bookings[0]
  const last = trip.bookings.at(-1)
  if (!first || !last) return ""
  const from = first.departure.place.code
  const roundTrip = last.arrival.place.code === from
  return roundTrip
    ? `Roundtrip ${from} - ${first.arrival.place.code}`
    : `One way ${from} - ${last.arrival.place.code}`
}

/** "3 bookings", "1 traveller": counts with the right plural. */
export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

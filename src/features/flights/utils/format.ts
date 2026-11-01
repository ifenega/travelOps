import type { Airport, Flight } from "../types"

// Small formatters for flights. Times show in the user's locale; prices are in GBP for now.

const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" })
const dayFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
})
const priceFormat = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
})

/** "11:50 PM" */
export const formatTime = (date: Date) => timeFormat.format(date)

/** "Fri, Jun 26" */
export const formatDay = (date: Date) => dayFormat.format(date)

/** "£13,400" */
export const formatPrice = (amount: number) => priceFormat.format(amount)

/** "11h 50m" */
export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}m`
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`
}

/** "Lagos Murtala Muhammed (LOS)" */
export const formatAirport = (airport: Airport) => `${airport.name} (${airport.code})`

export const minutesBetween = (from: Date, to: Date) =>
  Math.round((to.getTime() - from.getTime()) / 60_000)

/** How many calendar days later it lands: 1 for "+1". */
export function daysLater(from: Date, to: Date) {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((end.getTime() - start.getTime()) / 86_400_000)
}

/** The facts every flight card shows, worked out from its segments. */
export function summarizeFlight(flight: Flight) {
  const first = flight.segments[0]
  const last = flight.segments[flight.segments.length - 1]
  const layovers = flight.segments.slice(1).map((segment, index) => ({
    at: segment.from,
    minutes: minutesBetween(flight.segments[index].arriveAt, segment.departAt),
  }))
  return {
    from: first.from,
    to: last.to,
    departAt: first.departAt,
    arriveAt: last.arriveAt,
    minutes: minutesBetween(first.departAt, last.arriveAt),
    stops: layovers.length,
    layovers,
    flightNumbers: flight.segments.map((segment) => segment.flightNumber),
  }
}

/** "Nonstop", "1 stop · 2h 15m stop in DOH", "2 stops" */
export function describeStops(flight: Flight, { detailed = true } = {}) {
  const { stops, layovers } = summarizeFlight(flight)
  if (stops === 0) return "Nonstop"
  if (stops > 1) return `${stops} stops`
  const [layover] = layovers
  return detailed
    ? `1 stop · ${formatDuration(layover.minutes)} stop in ${layover.at.code}`
    : `1 stop · ${formatDuration(layover.minutes)}`
}

/** Four hours or more between flights. */
export const isLongLayover = (minutes: number) => minutes >= 240

import type { Trip } from "../types"

// "Add to calendar": an .ics file with one event per leg. Apple, Google and Outlook calendars all
// open it, and it needs no account. Format: RFC 5545.

/** "2027-05-01T18:45:00+01:00" → "20270501T174500Z" (UTC). */
function icsTime(iso: string) {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")
}

/** Commas, semicolons, backslashes and newlines have to be escaped in text values. */
function escapeText(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/([,;])/g, "\\$1")
    .replace(/\n/g, "\\n")
}

/**
 * Long lines are folded onto continuation lines that start with a space. The spec counts bytes;
 * counting characters is the same for the plain ASCII text we write.
 */
function fold(line: string) {
  const parts: string[] = []
  for (let i = 0; i < line.length; i += 74) parts.push(line.slice(i, i + 74))
  return parts.join("\r\n ")
}

export function tripToIcs(trip: Trip, now = new Date()) {
  const events = trip.bookings.flatMap((booking) => {
    const from = booking.departure.place
    const to = booking.arrival.place
    const kind = booking.transport === "flight" ? "Flight" : "Train"
    return [
      "BEGIN:VEVENT",
      `UID:${booking.id}@travelops`,
      `DTSTAMP:${icsTime(now.toISOString())}`,
      `DTSTART:${icsTime(booking.departure.time)}`,
      `DTEND:${icsTime(booking.arrival.time)}`,
      `SUMMARY:${escapeText(`${kind} ${from.code} to ${to.code}`)}`,
      `LOCATION:${escapeText(`${from.city} (${from.code})`)}`,
      `DESCRIPTION:${escapeText(`${trip.title}\n${booking.provider}, ${booking.vehicle}\nConfirmation ${booking.confirmation}`)}`,
      "END:VEVENT",
    ]
  })

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TravelOps//Bookings//EN",
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n")
}

/** Downloads the trip as "united-states-trip.ics". */
export function downloadIcs(trip: Trip) {
  const blob = new Blob([tripToIcs(trip)], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${trip.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`
  link.click()
  URL.revokeObjectURL(url)
}

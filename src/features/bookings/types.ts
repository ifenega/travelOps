import { z } from "zod"

// The shapes the bookings service returns. The Zod schemas are the source of truth: the mock data
// is checked against them, and the real API will be too.
//
// Words: a **trip** is one card on the list ("United States trip"). A **booking** is one leg of
// a trip (the LOS → DOH flight). The designs say "booking" for both; screen text follows them.

export const placeSchema = z.object({
  city: z.string(),
  /** Two-letter country code, e.g. "NG". */
  country: z.string().length(2),
  /** Airport or station code, e.g. "LOS". */
  code: z.string(),
  /** IANA time zone, so times show in local time, e.g. "Africa/Lagos". */
  timeZone: z.string(),
  lat: z.number(),
  lng: z.number(),
})

const stopTimeSchema = z.object({
  place: placeSchema,
  /** ISO date-time with the local offset, e.g. "2027-05-01T18:45:00+01:00". */
  time: z.iso.datetime({ offset: true }),
})

export const bookingSchema = z.object({
  id: z.string(),
  transport: z.enum(["flight", "train"]),
  status: z.enum(["pending", "booked"]),
  /** Who it's booked with, e.g. "Qatar Airways". */
  provider: z.string(),
  /** The aircraft or train, e.g. "Boeing 777". */
  vehicle: z.string(),
  confirmation: z.string(),
  departure: stopTimeSchema,
  arrival: stopTimeSchema,
})

export const tripStatusSchema = z.enum(["draft", "pending", "booked", "paid"])

export const tripSchema = z.object({
  id: z.string(),
  title: z.string(),
  /** "mine" shows under My bookings, "team" under Team bookings. */
  owner: z.enum(["mine", "team"]),
  status: tripStatusSchema,
  imageUrl: z.string().optional(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  /** Where the trip is to, e.g. "New York, NY". */
  destination: z.string(),
  price: z.object({ amount: z.number(), currency: z.string().length(3) }),
  travellerCount: z.number().int().positive(),
  /** In time order. */
  bookings: z.array(bookingSchema),
})

export const teamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  avatarUrl: z.string().optional(),
})

export type Place = z.infer<typeof placeSchema>
export type Booking = z.infer<typeof bookingSchema>
export type Transport = Booking["transport"]
export type TripStatus = z.infer<typeof tripStatusSchema>
export type Trip = z.infer<typeof tripSchema>
export type TripOwner = Trip["owner"]
export type TeamMember = z.infer<typeof teamMemberSchema>
export type TripsWhen = "upcoming" | "past"

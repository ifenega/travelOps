import type { Place, TravelMode } from "../search"

// Mock place search until the backend exists. Same shape the real endpoint should return.
// Swap `searchPlaces` for an API call later; the search bar won't need to change.

const places: Place[] = [
  // Airports
  {
    id: "LOS",
    name: "Murtala Muhammed International Airport (LOS)",
    region: "Lagos, Nigeria",
    kind: "airport",
    lng: 3.3211,
    lat: 6.5774,
  },
  {
    id: "ABV",
    name: "Nnamdi Azikiwe International Airport (ABV)",
    region: "Abuja, Nigeria",
    kind: "airport",
    lng: 7.2632,
    lat: 9.0068,
  },
  {
    id: "PHC",
    name: "Port Harcourt International Airport (PHC)",
    region: "Port Harcourt, Nigeria",
    kind: "airport",
    lng: 6.9497,
    lat: 5.0155,
  },
  {
    id: "KAN",
    name: "Mallam Aminu Kano International Airport (KAN)",
    region: "Kano, Nigeria",
    kind: "airport",
    lng: 8.5246,
    lat: 12.0476,
  },
  {
    id: "ENU",
    name: "Akanu Ibiam International Airport (ENU)",
    region: "Enugu, Nigeria",
    kind: "airport",
    lng: 7.5617,
    lat: 6.4743,
  },
  {
    id: "ATH",
    name: "Athens Eleftherios Venizelos (ATH)",
    region: "Athens, Greece",
    kind: "airport",
    lng: 23.9445,
    lat: 37.9364,
  },
  {
    id: "HER",
    name: "Heraklion N. Kazantzakis Airport (HER)",
    region: "Crete, Greece",
    kind: "airport",
    lng: 25.1803,
    lat: 35.3397,
  },
  {
    id: "CDG",
    name: "Paris Charles de Gaulle (CDG)",
    region: "Paris, France",
    kind: "airport",
    lng: 2.5479,
    lat: 49.0097,
  },
  {
    id: "LHR",
    name: "London Heathrow (LHR)",
    region: "London, United Kingdom",
    kind: "airport",
    lng: -0.4543,
    lat: 51.47,
  },
  {
    id: "HAU",
    name: "Haugesund Airport, Karmøy (HAU)",
    region: "Rogaland, Norway",
    kind: "airport",
    lng: 5.2084,
    lat: 59.3453,
  },
  {
    id: "HAM",
    name: "Hamburg Airport (HAM)",
    region: "Hamburg, Germany",
    kind: "airport",
    lng: 9.9882,
    lat: 53.6304,
  },
  {
    id: "DOH",
    name: "Hamad International Airport (DOH)",
    region: "Doha, Qatar",
    kind: "airport",
    lng: 51.6081,
    lat: 25.2731,
  },
  // Cities
  { id: "city-lagos", name: "Lagos", region: "Nigeria", kind: "city", lng: 3.3792, lat: 6.5244 },
  { id: "city-abuja", name: "Abuja", region: "Nigeria", kind: "city", lng: 7.4951, lat: 9.0765 },
  { id: "city-athens", name: "Athens", region: "Greece", kind: "city", lng: 23.7275, lat: 37.9838 },
  {
    id: "city-london",
    name: "London",
    region: "United Kingdom",
    kind: "city",
    lng: -0.1276,
    lat: 51.5072,
  },
  { id: "city-paris", name: "Paris", region: "France", kind: "city", lng: 2.3522, lat: 48.8566 },
  {
    id: "city-haridwar",
    name: "Haridwar",
    region: "Uttarakhand, India",
    kind: "city",
    lng: 78.1642,
    lat: 29.9457,
  },
  {
    id: "city-hamburg",
    name: "Hamburg",
    region: "Germany",
    kind: "city",
    lng: 9.9937,
    lat: 53.5511,
  },
  {
    id: "city-hannover",
    name: "Hannover",
    region: "Germany",
    kind: "city",
    lng: 9.732,
    lat: 52.3759,
  },
  {
    id: "city-hammond",
    name: "Hammond",
    region: "Indiana, USA",
    kind: "city",
    lng: -87.5,
    lat: 41.5834,
  },
  {
    id: "city-birmingham",
    name: "Birmingham",
    region: "United Kingdom",
    kind: "city",
    lng: -1.8904,
    lat: 52.4862,
  },
  // Stations
  {
    id: "BHM",
    name: "Birmingham New Street",
    region: "Birmingham, United Kingdom",
    kind: "station",
    lng: -1.8984,
    lat: 52.4778,
  },
  {
    id: "EUS",
    name: "London Euston",
    region: "London, United Kingdom",
    kind: "station",
    lng: -0.1335,
    lat: 51.5282,
  },
  {
    id: "KGX",
    name: "London King's Cross",
    region: "London, United Kingdom",
    kind: "station",
    lng: -0.1238,
    lat: 51.5308,
  },
  {
    id: "MAN",
    name: "Manchester Piccadilly",
    region: "Manchester, United Kingdom",
    kind: "station",
    lng: -2.2309,
    lat: 53.4774,
  },
  {
    id: "PNO",
    name: "Paris Gare du Nord",
    region: "Paris, France",
    kind: "station",
    lng: 2.3553,
    lat: 48.8809,
  },
  {
    id: "HBF",
    name: "Hamburg Hauptbahnhof",
    region: "Hamburg, Germany",
    kind: "station",
    lng: 10.0069,
    lat: 53.5528,
  },
]

/** Which kinds of place each mode searches. */
const kindsFor: Record<TravelMode, Place["kind"][]> = {
  flights: ["airport", "city"],
  trains: ["station", "city"],
  stays: ["city"],
}

export async function searchPlaces(query: string, mode: TravelMode): Promise<Place[]> {
  await new Promise((resolve) => setTimeout(resolve, 150)) // feels like a network call
  const text = query.trim().toLowerCase()
  // Names or codes that start with what was typed come first ("Ha" → Hamburg before Port Harcourt).
  const startsWithText = (place: Place) =>
    place.name.toLowerCase().startsWith(text) || place.id.toLowerCase() === text
  return places
    .filter((place) => kindsFor[mode].includes(place.kind))
    .filter((place) => `${place.name} ${place.region} ${place.id}`.toLowerCase().includes(text))
    .sort((a, b) => Number(startsWithText(b)) - Number(startsWithText(a)))
    .slice(0, 6)
}

/** Airports in the same country as a place ("Lagos, Nigeria" → every Nigerian airport). */
export function airportsInCountryOf(place: Place) {
  const country = place.region.split(",").at(-1)?.trim() ?? ""
  return places.filter((p) => p.kind === "airport" && p.region.endsWith(country))
}

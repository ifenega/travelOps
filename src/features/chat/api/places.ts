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
  },
  {
    id: "ABV",
    name: "Nnamdi Azikiwe International Airport (ABV)",
    region: "Abuja, Nigeria",
    kind: "airport",
  },
  {
    id: "PHC",
    name: "Port Harcourt International Airport (PHC)",
    region: "Port Harcourt, Nigeria",
    kind: "airport",
  },
  {
    id: "KAN",
    name: "Mallam Aminu Kano International Airport (KAN)",
    region: "Kano, Nigeria",
    kind: "airport",
  },
  {
    id: "ENU",
    name: "Akanu Ibiam International Airport (ENU)",
    region: "Enugu, Nigeria",
    kind: "airport",
  },
  {
    id: "ATH",
    name: "Athens Eleftherios Venizelos (ATH)",
    region: "Athens, Greece",
    kind: "airport",
  },
  {
    id: "HER",
    name: "Heraklion N. Kazantzakis Airport (HER)",
    region: "Crete, Greece",
    kind: "airport",
  },
  { id: "CDG", name: "Paris Charles de Gaulle (CDG)", region: "Paris, France", kind: "airport" },
  { id: "LHR", name: "London Heathrow (LHR)", region: "London, United Kingdom", kind: "airport" },
  {
    id: "HAU",
    name: "Haugesund Airport, Karmøy (HAU)",
    region: "Rogaland, Norway",
    kind: "airport",
  },
  { id: "HAM", name: "Hamburg Airport (HAM)", region: "Hamburg, Germany", kind: "airport" },
  { id: "DOH", name: "Hamad International Airport (DOH)", region: "Doha, Qatar", kind: "airport" },
  // Cities
  { id: "city-lagos", name: "Lagos", region: "Nigeria", kind: "city" },
  { id: "city-abuja", name: "Abuja", region: "Nigeria", kind: "city" },
  { id: "city-athens", name: "Athens", region: "Greece", kind: "city" },
  { id: "city-london", name: "London", region: "United Kingdom", kind: "city" },
  { id: "city-paris", name: "Paris", region: "France", kind: "city" },
  { id: "city-haridwar", name: "Haridwar", region: "Uttarakhand, India", kind: "city" },
  { id: "city-hamburg", name: "Hamburg", region: "Germany", kind: "city" },
  { id: "city-hannover", name: "Hannover", region: "Germany", kind: "city" },
  { id: "city-hammond", name: "Hammond", region: "Indiana, USA", kind: "city" },
  { id: "city-birmingham", name: "Birmingham", region: "United Kingdom", kind: "city" },
  // Stations
  {
    id: "BHM",
    name: "Birmingham New Street",
    region: "Birmingham, United Kingdom",
    kind: "station",
  },
  { id: "EUS", name: "London Euston", region: "London, United Kingdom", kind: "station" },
  { id: "KGX", name: "London King's Cross", region: "London, United Kingdom", kind: "station" },
  {
    id: "MAN",
    name: "Manchester Piccadilly",
    region: "Manchester, United Kingdom",
    kind: "station",
  },
  { id: "PNO", name: "Paris Gare du Nord", region: "Paris, France", kind: "station" },
  { id: "HBF", name: "Hamburg Hauptbahnhof", region: "Hamburg, Germany", kind: "station" },
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

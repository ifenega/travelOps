// The flights feature's public API. Other features and the app import from here only.

export { flightsService, mockFlightControls } from "./api/flights-service"
export { AirlineLogo } from "./components/airline-logo"
export { ChosenFlightCard } from "./components/chosen-flight-card"
export { FlightDetailsButton, FlightJourney } from "./components/flight-details"
export { FlightResults } from "./components/flight-results"
export { FlightTimes } from "./components/flight-times"
export { PolicyIcon } from "./components/policy-icon"
export { RoundTripResults } from "./components/round-trip-results"
export {
  type ResultsFilters,
  resultsFiltersDefaults,
  resultsFiltersSchema,
} from "./search-params"
export type { Airline, Airport, Fare, Flight, FlightSearch, Leg } from "./types"
export {
  formatDay,
  formatDuration,
  formatPrice,
  isLongLayover,
  summarizeFlight,
} from "./utils/format"

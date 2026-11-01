import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { expect, fn, waitFor, within } from "storybook/test"
import { flightsService, mockFlightControls } from "./api/flights-service"
import { ChosenFlightCard } from "./components/chosen-flight-card"
import { FlightCard } from "./components/flight-card"
import { FlightResults } from "./components/flight-results"
import { Pagination } from "./components/pagination"
import { RoundTripResults } from "./components/round-trip-results"
import { type ResultsFilters, resultsFiltersSchema } from "./search-params"
import type { Fare, Flight, FlightSearch } from "./types"

// The flight results pieces, on the mock flights service.

const search: FlightSearch = {
  from: { code: "LOS", name: "Lagos Murtala Muhammed", city: "Lagos" },
  to: { code: "ATH", name: "Athens Eleftherios Venizelos", city: "Athens" },
  departDate: new Date(2026, 5, 26),
  returnDate: new Date(2026, 6, 8),
  passengers: 2,
}

/** Real mock results to pass to the components. */
async function loadFlights() {
  const departing = await flightsService.search(search, "departing", resultsFiltersSchema.parse({}))
  const outOfPolicy = (
    await flightsService.search(
      search,
      "departing",
      resultsFiltersSchema.parse({ cabin: "business" }),
    )
  ).flights[0]
  const fares = await flightsService.fares(departing.flights[0].id)
  return { flight: departing.flights[0], outOfPolicy, fare: fares[0] }
}

type Loaded = { flight: Flight; outOfPolicy: Flight; fare: Fare }

const meta = {
  title: "Flights/Results",
  parameters: { layout: "padded" },
  globals: { viewport: { value: "desktop" } },
  beforeEach: () => {
    mockFlightControls.delay = 0
  },
  loaders: [loadFlights],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const onSelectFare = fn()

/** A flight in the full-width results (design screen 16). */
export const Card: Story = {
  render: (_, { loaded }) => (
    <FlightCard flight={(loaded as Loaded).flight} onSelectFare={onSelectFare} />
  ),
}

/** Behaviour: Select opens the fares under the card, and a fare's Select picks it (screen 17). */
export const ChoosingAFare: Story = {
  render: (_, { loaded }) => (
    <FlightCard flight={(loaded as Loaded).flight} onSelectFare={onSelectFare} />
  ),
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole("button", { name: /^Select .* flight$/ })
    await userEvent.click(select)
    await expect(select).toHaveAttribute("aria-expanded", "true")
    const fares = await canvas.findByRole("list", { name: "Fare options" })
    await userEvent.click(within(fares).getAllByRole("button", { name: /^Select/ })[0])
    await expect(onSelectFare).toHaveBeenCalled()
  },
}

/** Behaviour: the orange policy icon explains why (screen 18). */
export const OutOfPolicy: Story = {
  render: (_, { loaded }) => (
    <FlightCard flight={(loaded as Loaded).outOfPolicy} onSelectFare={onSelectFare} />
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole("button", { name: "Out of travel policy: see why" }))
    const dialog = await page.findByRole("dialog", { name: "Issue a conditional offer" })
    await expect(dialog).toHaveTextContent(/above your travel policy/)
  },
}

/** Behaviour: "See flight details" opens the timeline (screen 18). */
export const FlightDetails: Story = {
  render: (_, { loaded }) => (
    <FlightCard flight={(loaded as Loaded).flight} onSelectFare={onSelectFare} />
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole("button", { name: /^See flight details/ }))
    const dialog = await page.findByRole("dialog", { name: "Flight details" })
    await expect(
      within(dialog).getByRole("region", { name: "Departing flight" }),
    ).toBeInTheDocument()
  },
}

/** The chosen departing flight, pinned above the return flights (screen 19). */
export const ChosenFlight: Story = {
  render: (_, { loaded }) => (
    <ChosenFlightCard
      flight={(loaded as Loaded).flight}
      fare={(loaded as Loaded).fare}
      onEdit={fn()}
    />
  ),
}

/** The best round trips, inside the chat (screen 15). */
export const InTheChat: Story = {
  render: () => (
    <div className="max-w-lg">
      <RoundTripResults search={search} onSeeMore={fn()} />
    </div>
  ),
}

function ResultsWithState() {
  const [filters, setFilters] = useState<ResultsFilters>(resultsFiltersSchema.parse({}))
  return (
    <FlightResults
      search={search}
      leg="departing"
      filters={filters}
      onFiltersChange={(changes) => setFilters((current) => ({ ...current, ...changes }))}
      onSelectFare={onSelectFare}
    />
  )
}

/** Behaviour: filters, the result count and pages (screen 16). Nonstop narrows the list. */
export const FullResults: Story = {
  render: () => <ResultsWithState />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body)
    const count = await canvas.findByText(/of 48 results/)
    await userEvent.click(canvas.getByRole("combobox", { name: "Stops" }))
    await userEvent.click(await page.findByRole("option", { name: "Nonstop" }))
    await waitFor(() => expect(page.queryByRole("listbox")).toBeNull())
    await waitFor(() => expect(count).not.toHaveTextContent(/of 48 results/))
    await expect(canvas.queryByText(/1 stop/)).toBeNull()
  },
}

export const Pages: Story = {
  render: () => <Pagination page={5} pageCount={11} onPageChange={fn()} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Page 5" })).toHaveAttribute(
      "aria-current",
      "page",
    )
  },
}

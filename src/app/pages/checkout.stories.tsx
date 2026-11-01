import type { Meta, StoryObj } from "@storybook/react-vite"
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router"
import { useState } from "react"
import { expect, waitFor, within } from "storybook/test"
import { checkoutService, mockCheckoutControls } from "@/features/checkout"
import type { FlightSearch } from "@/features/flights"
import { flightsService, mockFlightControls, resultsFiltersSchema } from "@/features/flights"
import { createAppRouter } from "../routes"

// Checkout inside the real app (routes, full-page layout), on the mock services.

const search: FlightSearch = {
  from: { code: "LOS", name: "Lagos Murtala Muhammed", city: "Lagos" },
  to: { code: "ATH", name: "Athens Eleftherios Venizelos", city: "Athens" },
  departDate: new Date(2026, 5, 26),
  returnDate: new Date(2026, 6, 8),
  passengers: 3,
}

/** A booking for 1 adult, 1 child and 1 infant on the first flights the mock finds. */
async function createBooking() {
  const filters = resultsFiltersSchema.parse({})
  const [departing] = (await flightsService.search(search, "departing", filters)).flights
  const [returning] = (await flightsService.search(search, "return", filters)).flights
  const [departingFare] = await flightsService.fares(departing.id)
  const [returningFare] = await flightsService.fares(returning.id)
  return checkoutService.createBooking({
    chatId: "story-chat",
    search,
    travellers: { adult: 1, child: 1, infant: 1 },
    departing: { flight: departing, fare: departingFare },
    returning: { flight: returning, fare: returningFare },
  })
}

function AppAt({ path }: { path: string }) {
  const [router] = useState(() => createAppRouter(createMemoryHistory({ initialEntries: [path] })))
  return <RouterProvider router={router} />
}

type Loaded = { bookingId: string }

const meta = {
  title: "App/Checkout",
  parameters: { layout: "fullscreen" },
  globals: { viewport: { value: "desktop" } },
  beforeEach: () => {
    mockFlightControls.delay = 0
    mockCheckoutControls.delay = 0
  },
  loaders: [async () => ({ bookingId: await createBooking() })],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const at =
  (step: string) =>
  (_: unknown, { loaded }: { loaded: unknown }) => (
    <AppAt path={`/checkout/${(loaded as Loaded).bookingId}/${step}`} />
  )

export const Passengers: Story = { render: at("passengers") }

export const PassengersPhone: Story = {
  render: at("passengers"),
  globals: { viewport: { value: "mobile2" } },
}

/** Behaviour: Proceed lists what's missing; a child's date of birth must fit their age. */
export const PassengerChecks: Story = {
  render: at("passengers"),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(await canvas.findByRole("button", { name: "Proceed" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Confirm each passenger")

    // Passenger 1 (adult).
    await userEvent.click(canvas.getByRole("combobox", { name: "Title" }))
    await userEvent.click(await page.findByRole("option", { name: "Mr" }))
    await waitFor(() => expect(page.queryByRole("listbox")).toBeNull())
    await userEvent.type(canvas.getByLabelText("First name"), "Timilehin")
    await userEvent.type(canvas.getByLabelText("Last name"), "Folagbade")
    await userEvent.click(canvas.getByRole("button", { name: "Confirm" }))

    // Passenger 2 (child) opens next (once passenger 1 has closed); a baby's date of birth is refused.
    await waitFor(() => expect(canvas.getAllByRole("combobox", { name: "Title" })).toHaveLength(1))
    await userEvent.click(canvas.getByRole("combobox", { name: "Title" }))
    await userEvent.click(await page.findByRole("option", { name: "Miss" }))
    await waitFor(() => expect(page.queryByRole("listbox")).toBeNull())
    await userEvent.type(canvas.getByLabelText("First name"), "Ife")
    await userEvent.type(canvas.getByLabelText("Last name"), "Folagbade")
    await userEvent.type(canvas.getByLabelText("Date of birth"), "2025-06-01")
    await userEvent.click(canvas.getByRole("button", { name: "Confirm" }))
    await expect(await canvas.findByText(/A child is 2 to 17/)).toBeVisible()
  },
}

export const Extras: Story = { render: at("extras") }

/** Behaviour: add a loyalty program; focus returns to its button. */
export const AddingLoyalty: Story = {
  render: at("extras"),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(await canvas.findByRole("button", { name: "Add loyalty" }))
    const dialog = within(await page.findByRole("dialog", { name: "Add loyalty" }))
    await userEvent.click(dialog.getByRole("combobox", { name: "Loyalty program" }))
    await userEvent.click(await page.findByRole("option", { name: /^ANA/ }))
    await waitFor(() => expect(page.queryByRole("listbox")).toBeNull())
    await userEvent.type(dialog.getByLabelText("Membership number"), "98987766612")
    await userEvent.click(dialog.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull())
    await expect(canvas.getByText(/ANA - Mileage Club · 98987766612/)).toBeVisible()
    await expect(canvas.getByRole("button", { name: "Edit" })).toHaveFocus()
  },
}

export const Itinerary: Story = { render: at("itinerary") }

export const PaymentSuccessful: Story = {
  render: at("payment"),
  play: async ({ canvas }) => {
    await canvas.findByRole("heading", { level: 1, name: "Purchase successful" })
  },
}

/** The mock's first payment fails when the contact email contains "fail". */
export const PaymentFailed: Story = {
  render: at("payment"),
  loaders: [
    async () => {
      const bookingId = await createBooking()
      checkoutService.saveContact(bookingId, {
        email: "fail@example.com",
        phone: "+234 803 000 0000",
        address: "12 Gregory Street, London",
      })
      return { bookingId }
    },
  ],
  play: async ({ canvas, userEvent }) => {
    await canvas.findByRole("heading", { level: 1, name: "Purchase failed" })
    await userEvent.click(canvas.getByRole("button", { name: "Retry payment" }))
    await canvas.findByRole("heading", { level: 1, name: "Purchase successful" })
  },
}

/** Unknown bookings show the 404 page. */
export const UnknownBooking: Story = {
  render: () => <AppAt path="/checkout/nope/passengers" />,
  play: async ({ canvas }) => {
    await canvas.findByRole("heading", { level: 1, name: "Page not found" })
  },
}

import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { withRouter } from "@/shared/lib/with-router"
import { seedTrips } from "../api/mock-data"
import { Itinerary } from "./itinerary"

const usTrip = seedTrips.find((t) => t.id === "us-trip")
if (!usTrip) throw new Error("No mock US trip")

const meta = {
  title: "Bookings/Itinerary",
  component: Itinerary,
  decorators: [
    withRouter,
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "padded" },
  args: { tripId: usTrip.id, bookings: usTrip.bookings },
} satisfies Meta<typeof Itinerary>

export default meta
type Story = StoryObj<typeof meta>

/** The whole trip: a connection in Doha (one stop with the layover), then a train two days later. */
export const WholeTrip: Story = {
  play: async ({ canvas }) => {
    // Day headings are real text ("Sat, May 1"), shown in capitals by CSS.
    await expect(canvas.getByRole("heading", { level: 2, name: "Sat, May 1" })).toBeVisible()
    await expect(canvas.getByText("Layover in Doha: ~2h 35m")).toBeVisible()
    // Cards are named in words, not airport codes alone.
    await expect(
      canvas.getByRole("heading", { level: 3, name: "Flight from Lagos (LOS) to Doha (DOH)" }),
    ).toBeVisible()
  },
}

/** The Flights tab: only the flights. */
export const FlightsOnly: Story = {
  args: { bookings: usTrip.bookings.filter((b) => b.transport === "flight") },
}

export const NothingBooked: Story = { args: { bookings: [] } }

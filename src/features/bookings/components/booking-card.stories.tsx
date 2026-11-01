import type { Meta, StoryObj } from "@storybook/react-vite"
import { withRouter } from "@/shared/lib/with-router"
import { seedTrips } from "../api/mock-data"
import { BookingCard } from "./booking-card"

const usTrip = seedTrips.find((t) => t.id === "us-trip")
const [flight, , train] = usTrip?.bookings ?? []
if (!usTrip || !flight || !train) throw new Error("No mock US trip")

const meta = {
  title: "Bookings/BookingCard",
  component: BookingCard,
  decorators: [
    withRouter,
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "padded" },
  args: { tripId: usTrip.id, booking: flight },
} satisfies Meta<typeof BookingCard>

export default meta
type Story = StoryObj<typeof meta>

export const BookedFlight: Story = {}

export const PendingTrain: Story = { args: { booking: train } }

/** Long place and train names wrap instead of pushing the logo off the card. */
export const LongNames: Story = {
  args: {
    booking: {
      ...train,
      vehicle: "Northeast Regional with business class and quiet car",
      departure: {
        ...train.departure,
        place: { ...train.departure.place, city: "New York Moynihan Train Hall" },
      },
    },
  },
}

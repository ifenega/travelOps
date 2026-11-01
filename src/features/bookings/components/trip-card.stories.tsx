import type { Meta, StoryObj } from "@storybook/react-vite"
import { withRouter } from "@/shared/lib/with-router"
import { seedTrips } from "../api/mock-data"
import type { Trip } from "../types"
import { TripCard } from "./trip-card"

function trip(id: string): Trip {
  const found = seedTrips.find((t) => t.id === id)
  if (!found) throw new Error(`No mock trip ${id}`)
  return found
}

const meta = {
  title: "Bookings/TripCard",
  component: TripCard,
  decorators: [
    withRouter,
    (Story) => (
      <ul className="w-64">
        <li>
          <Story />
        </li>
      </ul>
    ),
  ],
  parameters: { layout: "padded" },
  args: { trip: trip("us-trip"), onShare: () => {}, onDelete: () => {} },
} satisfies Meta<typeof TripCard>

export default meta
type Story = StoryObj<typeof meta>

export const Draft: Story = {}

export const Pending: Story = { args: { trip: trip("london-train") } }

export const Booked: Story = { args: { trip: trip("athens-flight") } }

export const Paid: Story = { args: { trip: trip("rome-trip") } }

/** A long title truncates; the full title is still the link's name. */
export const LongTitle: Story = {
  args: {
    trip: {
      ...trip("us-trip"),
      title: "Quarterly sales conference and partner visits in New York",
    },
  },
}

/** No photo (or a broken one): a plain grey box keeps the card's shape. */
export const NoPhoto: Story = { args: { trip: { ...trip("us-trip"), imageUrl: undefined } } }

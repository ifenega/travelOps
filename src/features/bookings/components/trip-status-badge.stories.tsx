import type { Meta, StoryObj } from "@storybook/react-vite"
import { TripStatusBadge } from "./trip-status-badge"

const meta = {
  title: "Bookings/TripStatusBadge",
  component: TripStatusBadge,
  parameters: { layout: "padded" },
  args: { status: "draft" },
} satisfies Meta<typeof TripStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const AllStatuses: Story = {
  render: () => (
    <div className="flex gap-2">
      <TripStatusBadge status="draft" />
      <TripStatusBadge status="pending" />
      <TripStatusBadge status="booked" />
      <TripStatusBadge status="paid" />
    </div>
  ),
}

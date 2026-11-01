import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { expect, waitFor, within } from "storybook/test"
import { Button } from "./button"
import { type DateRange, DateRangePicker, formatDateRange } from "./date-range-picker"

function TripDates() {
  const [range, setRange] = useState<DateRange>()
  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
      trigger={<Button variant="outline">{formatDateRange(range) ?? "Add dates"}</Button>}
    />
  )
}

const meta = {
  title: "Components/DateRangePicker",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Popover with two months on wide screens; a bottom sheet with one month on phones. */
export const Default: Story = { render: () => <TripDates /> }

/** Behaviour: pick a start and an end, press Done, and the trigger shows the range. */
export const PickingARange: Story = {
  render: () => <TripDates />,
  globals: { viewport: { value: "desktop" } },
  play: async ({ canvas, userEvent, canvasElement }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add dates" }))
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", {
      name: "Select dates",
    })
    const picker = within(dialog)

    // Next month, so every day is selectable whatever today's date is.
    await userEvent.click(picker.getByRole("button", { name: /next month/i }))
    await userEvent.click(picker.getAllByRole("button", { name: /\b10th\b/ })[0])
    await userEvent.click(picker.getAllByRole("button", { name: /\b15th\b/ })[0])
    await userEvent.click(picker.getByRole("button", { name: "Done" }))

    // e.g. "Dec 10 – Dec 15"
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: /10 – .*15/ })).toBeInTheDocument(),
    )
  },
}

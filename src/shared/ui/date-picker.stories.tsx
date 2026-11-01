import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { expect, waitFor, within } from "storybook/test"
import { DatePicker } from "./date-picker"
import { Field } from "./field"

function DateFrom({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <Field label="Date from" className="max-w-56">
      {(control) => <DatePicker {...control} label="Date from" value={value} onChange={setValue} />}
    </Field>
  )
}

const meta = {
  title: "Components/DatePicker",
  parameters: { layout: "padded" },
  globals: { viewport: { value: "desktop" } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = { render: () => <DateFrom /> }

export const Filled: Story = { render: () => <DateFrom initial="01/01/2026" /> }

/** Behaviour: the field can be typed in, or filled from the calendar. */
export const PickFromCalendar: Story = {
  render: () => <DateFrom initial="01/01/2026" />,
  play: async ({ canvas, userEvent, canvasElement }) => {
    const input = canvas.getByRole("textbox", { name: "Date from" })
    await userEvent.click(canvas.getByRole("button", { name: "Date from: pick from calendar" }))
    const calendar = within(canvasElement.ownerDocument.body).getByRole("dialog", {
      name: "Date from",
    })
    await userEvent.click(within(calendar).getAllByRole("button", { name: /\b15th\b/ })[0])
    await expect(input).toHaveValue("15/01/2026")
    // Picking a date closes the calendar.
    await waitFor(() =>
      expect(within(canvasElement.ownerDocument.body).queryByRole("dialog")).toBeNull(),
    )
  },
}

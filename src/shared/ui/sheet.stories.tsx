import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor, within } from "storybook/test"
import { Button } from "./button"
import { Sheet, SheetContent, SheetTrigger } from "./sheet"

const meta = {
  title: "Components/Sheet",
  parameters: { layout: "padded" },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">See flight details</Button>
      </SheetTrigger>
      <SheetContent title="Flight details">
        <p className="text-sm">Both journeys go here.</p>
      </SheetContent>
    </Sheet>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Behaviour: Esc closes it and focus goes back to the button that opened it. */
export const ClosesOnEscape: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole("button", { name: "See flight details" })
    await userEvent.click(trigger)
    await page.findByRole("dialog", { name: "Flight details" })
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull())
    await expect(trigger).toHaveFocus()
  },
}

import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor, within } from "storybook/test"
import { Button } from "./button"
import { Dialog, DialogContent, DialogTrigger } from "./dialog"

function ShareDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Share trip</Button>
      </DialogTrigger>
      <DialogContent
        title="Share trip"
        description="Share this trip with people, team members etc."
      >
        <p className="text-sm">Dialog content goes here.</p>
      </DialogContent>
    </Dialog>
  )
}

const meta = {
  title: "Components/Dialog",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: () => <ShareDialog /> }

/** Behaviour: the dialog is named by its title, Esc closes it, and focus goes back to the button. */
export const EscCloses: Story = {
  render: () => <ShareDialog />,
  play: async ({ canvas, userEvent, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole("button", { name: "Share trip" })
    await userEvent.click(trigger)

    const dialog = await body.findByRole("dialog", { name: "Share trip" })
    await expect(dialog).toHaveAccessibleDescription(
      "Share this trip with people, team members etc.",
    )

    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull())
    await expect(trigger).toHaveFocus()
  },
}

/** Behaviour: the ✕ button closes it. */
export const CloseButton: Story = {
  render: () => <ShareDialog />,
  play: async ({ canvas, userEvent, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole("button", { name: "Share trip" }))
    const dialog = await body.findByRole("dialog")
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }))
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull())
  },
}

import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor } from "storybook/test"
import { Button } from "./button"
import { toast } from "./toast"

const meta = {
  title: "Components/Toast",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Click to show each kind. Toasts stack bottom-right (bottom of the screen on phones). */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={() => toast("Fare updated to $4,566.00")}>
        Neutral
      </Button>
      <Button variant="outline" onClick={() => toast.success("Booking saved")}>
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.warning("Fares change often", {
            description: "Prices are held for 20 minutes once you start checkout.",
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error("Couldn't save the booking", {
            description: "Check your connection and try again.",
            action: { label: "Retry", onClick: () => toast.success("Booking saved") },
          })
        }
      >
        Error with action
      </Button>
    </div>
  ),
}

/** Behaviour: a toast appears with its type read out to screen readers, and the ✕ removes it. */
export const ShowAndDismiss: Story = {
  render: () => (
    <Button onClick={() => toast.error("Couldn't save the booking")}>Save booking</Button>
  ),
  play: async ({ canvas, userEvent, canvasElement }) => {
    const body = canvasElement.ownerDocument.body
    await userEvent.click(canvas.getByRole("button", { name: "Save booking" }))

    await waitFor(() => expect(body).toHaveTextContent("Error: Couldn't save the booking"))
    const dismiss = await waitFor(() => {
      const button = body.querySelector<HTMLElement>('[aria-label="Dismiss notification"]')
      if (!button) throw new Error("Toast did not appear")
      return button
    })
    await userEvent.click(dismiss)
    await waitFor(() => expect(body).not.toHaveTextContent("Couldn't save the booking"))
  },
}

import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor } from "storybook/test"
import { HelpTip } from "./help-tip"

const meta = {
  title: "Components/HelpTip",
  component: HelpTip,
  args: {
    label: "About layovers",
    children: "A layover is a stop between flights. You stay in the airport and change planes.",
  },
  decorators: [
    (Story) => (
      <div className="flex items-center gap-1 p-24">
        <span>1 stop · 1h</span>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HelpTip>

export default meta
type Story = StoryObj<typeof meta>

/** Tap, click, or focus and press Enter. */
export const Default: Story = {}

export const WithTitle: Story = {
  args: {
    title: "Layover in Istanbul",
    children: "You stay airside. No visa is needed for connections under 24 hours.",
  },
}

/** Behaviour: opens on click with its text announced, closes on Escape, focus returns to the (?). */
export const OpenAndClose: Story = {
  play: async ({ canvas, userEvent, canvasElement }) => {
    const trigger = canvas.getByRole("button", { name: "About layovers" })
    await userEvent.click(trigger)

    // The popover renders in a portal on <body>, outside the story's canvas.
    const body = canvasElement.ownerDocument.body
    const dialog = await waitFor(() => {
      const element = body.querySelector('[role="dialog"]')
      if (!element) throw new Error("Help tip did not open")
      return element
    })
    await expect(dialog).toHaveAccessibleName("About layovers")
    await expect(dialog).toHaveTextContent("A layover is a stop between flights.")

    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(body.querySelector('[role="dialog"]')).toBeNull())
    await expect(trigger).toHaveFocus()
  },
}

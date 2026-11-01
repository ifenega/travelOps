import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { expect } from "storybook/test"
import { Switch } from "./switch"

function GetALink() {
  const [on, setOn] = useState(false)
  return (
    <div className="flex max-w-sm items-start justify-between gap-6">
      <div>
        <p id="link-label" className="text-sm">
          Get a link
        </p>
        <p id="link-help" className="text-muted-foreground text-sm">
          Share trip dates and services, but hide traveller names and prices.
        </p>
      </div>
      <Switch
        checked={on}
        onCheckedChange={setOn}
        aria-labelledby="link-label"
        aria-describedby="link-help"
        className="mt-0.5"
      />
    </div>
  )
}

const meta = {
  title: "Components/Switch",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** "Get a link" from the Share trip dialog. */
export const GetALinkExample: Story = { render: () => <GetALink /> }

export const Disabled: Story = {
  render: () => <Switch aria-label="Send via email" disabled />,
}

/** Behaviour: Space toggles it, and it's named by its label. */
export const Keyboard: Story = {
  render: () => <GetALink />,
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole("switch", { name: "Get a link" })
    await expect(toggle).not.toBeChecked()
    toggle.focus()
    await userEvent.keyboard(" ")
    await expect(toggle).toBeChecked()
  },
}

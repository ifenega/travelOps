import type { Meta, StoryObj } from "@storybook/react-vite"
import { User01, Users01 } from "@untitledui/icons"
import { useState } from "react"
import { Button } from "./button"
import { ResponsivePopover } from "./responsive-popover"
import { Stepper } from "./stepper"

function PassengersField() {
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const summary = [
    `${adults} ${adults === 1 ? "adult" : "adults"}`,
    children > 0 && `${children} ${children === 1 ? "child" : "children"}`,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <ResponsivePopover
      title="Passengers"
      align="end"
      contentClassName="flex w-72 flex-col gap-4"
      trigger={<Button variant="outline">{summary}</Button>}
    >
      <Stepper
        label="Adults"
        description="Ages 18+"
        icon={Users01}
        unit="adult"
        value={adults}
        onChange={setAdults}
        min={1}
      />
      <Stepper
        label="Children"
        description="Ages 2–17"
        icon={User01}
        unit="child"
        value={children}
        onChange={setChildren}
      />
    </ResponsivePopover>
  )
}

const meta = {
  title: "Components/ResponsivePopover",
  parameters: { layout: "padded" },
  render: () => <PassengersField />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** A popover next to its button. */
export const Desktop: Story = { globals: { viewport: { value: "desktop" } } }

/** The same content as a bottom sheet you can drag down to close. */
export const Phone: Story = { globals: { viewport: { value: "mobile2" } } }

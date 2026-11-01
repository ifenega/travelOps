import type { Meta, StoryObj } from "@storybook/react-vite"
import { FaceSmile, HeartHand, User01, Users01 } from "@untitledui/icons"
import { useState } from "react"
import { expect } from "storybook/test"
import { Stepper } from "./stepper"

function Passengers() {
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [pets, setPets] = useState(0)

  return (
    <div className="flex w-72 flex-col gap-4 rounded-lg border p-3">
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
      {/* Each infant sits on an adult's lap, so there can't be more infants than adults. */}
      <Stepper
        label="Infants"
        description="Under 2"
        icon={FaceSmile}
        unit="infant"
        value={infants}
        onChange={setInfants}
        max={adults}
      />
      <Stepper
        label="Pets"
        description="Bringing a service animal?"
        icon={HeartHand}
        unit="pet"
        value={pets}
        onChange={setPets}
        max={2}
      />
    </div>
  )
}

const meta = {
  title: "Components/Stepper",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** The Figma's passenger counters. */
export const PassengersExample: Story = { render: () => <Passengers /> }

/** Behaviour: counts change, limits hold, and focus stays on the button at a limit. */
export const Limits: Story = {
  render: () => <Passengers />,
  play: async ({ canvas, userEvent }) => {
    const removeAdult = canvas.getByRole("button", { name: "Remove adult" })
    await expect(removeAdult).toHaveAttribute("aria-disabled", "true")
    await userEvent.click(removeAdult)
    await expect(canvas.getByRole("group", { name: "Adults" })).toHaveTextContent("1")

    const addInfant = canvas.getByRole("button", { name: "Add infant" })
    await userEvent.click(addInfant)
    await expect(addInfant).toHaveAttribute("aria-disabled", "true") // 1 infant per adult
    await userEvent.click(addInfant)
    await expect(canvas.getByRole("group", { name: "Infants" })).toHaveTextContent("1")
    await expect(addInfant).toHaveFocus()
  },
}

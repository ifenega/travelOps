import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import { Avatar } from "./avatar"
import { Chip } from "./chip"

const meta = {
  title: "Components/Chip",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** A traveller, and a seat that can be removed. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Chip className="pl-1">
        <Avatar name="Timilehin Folagbade" className="size-5" />
        Timilehin Folagbade
      </Chip>
      <Chip onRemove={() => {}} removeLabel="Remove seat 9B on flight 1">
        Flight 1 · 9B · £56
      </Chip>
    </div>
  ),
}

const onRemove = fn()

/** Behaviour: the × button has its own name and calls onRemove. */
export const Removing: Story = {
  render: () => (
    <Chip onRemove={onRemove} removeLabel="Remove seat 9B on flight 1">
      Flight 1 · 9B · £56
    </Chip>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Remove seat 9B on flight 1" }))
    await expect(onRemove).toHaveBeenCalled()
  },
}

import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import { Suggestions, startingSuggestions } from "./suggestions"

const meta = {
  title: "Chat/Suggestions",
  component: Suggestions,
  args: { items: startingSuggestions, onSelect: fn(), onDismiss: fn() },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-180">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Suggestions>

export default meta
type Story = StoryObj<typeof meta>

/** Mirrors the Figma. Two columns on phones, four from 640px. */
export const Default: Story = {}

/** Behaviour: picking a card reports which one; the ✕ hides the block. */
export const Selecting: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Book a flight" }))
    await expect(args.onSelect).toHaveBeenCalledWith(startingSuggestions[0])

    await userEvent.click(canvas.getByRole("button", { name: "Hide suggestions" }))
    await expect(args.onDismiss).toHaveBeenCalled()
  },
}

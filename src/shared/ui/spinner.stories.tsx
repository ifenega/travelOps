import type { Meta, StoryObj } from "@storybook/react-vite"
import { Spinner } from "./spinner"

const meta = {
  title: "Components/Spinner",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Decorative: the words for screen readers sit beside it, in a role="status" element. */
export const Default: Story = {
  render: () => (
    <p role="status" className="flex items-center gap-2 text-sm">
      <Spinner />
      Loading…
    </p>
  ),
}

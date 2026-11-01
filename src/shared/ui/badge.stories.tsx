import type { Meta, StoryObj } from "@storybook/react-vite"
import { Badge } from "./badge"

const meta = {
  title: "Components/Badge",
  component: Badge,
  args: { children: "Badge" },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const variants = ["neutral", "info", "success", "warning", "error", "error-solid"] as const

/** Mirrors the Figma frame. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {variants.map((variant) => (
        <Badge key={variant} variant={variant}>
          Badge
        </Badge>
      ))}
    </div>
  ),
}

/** Long text truncates inside a narrow container instead of breaking the layout. */
export const WorstCase: Story = {
  render: () => (
    <div className="w-40 border border-dashed p-2">
      <Badge variant="warning">Schedule changed by the airline</Badge>
    </div>
  ),
}

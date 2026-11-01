import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowRight, Plus, XClose } from "@untitledui/icons"
import { Button } from "./button"

const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "Get started" },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const variants = [
  "primary",
  "outline",
  "soft",
  "destructive",
  "destructive-outline",
  "destructive-soft",
] as const
const sizes = ["lg", "md", "sm"] as const

/** Mirrors the Figma frame: every variant, size and state. Hover and press on the real thing. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {sizes.flatMap((size) =>
        [false, true].map((disabled) => (
          <div key={`${size}-${disabled}`} className="flex flex-wrap items-center gap-4">
            {variants.map((variant) => (
              <Button key={variant} variant={variant} size={size} disabled={disabled}>
                Get started
              </Button>
            ))}
          </div>
        )),
      )}
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button>
        <Plus aria-hidden="true" />
        Add passenger
      </Button>
      <Button variant="outline">
        View flight
        <ArrowRight aria-hidden="true" />
      </Button>
    </div>
  ),
}

/** Quiet buttons for dense places like table cells, and ghost for icon-only controls. */
export const Utility: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="secondary" size="xs">
        Review
      </Button>
      <Button variant="secondary" size="icon-xs" aria-label="Add note">
        <Plus />
      </Button>
      <Button variant="secondary" size="sm">
        Secondary
      </Button>
      <Button variant="ghost" size="icon" aria-label="Dismiss">
        <XClose />
      </Button>
    </div>
  ),
}

/** Icon-only buttons must have an aria-label. */
export const IconOnly: Story = {
  render: () => (
    <Button variant="ghost" size="icon" aria-label="Dismiss">
      <XClose />
    </Button>
  ),
}

export const AsLink: Story = {
  render: () => (
    <Button asChild variant="outline">
      <a href="#flights">Browse flights</a>
    </Button>
  ),
}

/** Long labels wrap instead of overflowing on a 320px phone. */
export const WorstCase: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-3 border border-dashed p-3">
      <Button>Continue to payment for all four passengers on this itinerary</Button>
      <Button variant="destructive-soft" size="sm">
        Cancel booking and request a refund to the original payment method
      </Button>
    </div>
  ),
}

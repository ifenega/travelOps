import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { expect, fn } from "storybook/test"
import { Banner } from "./banner"

const meta = {
  title: "Components/Banner",
  component: Banner,
  args: {
    title: "Notice title",
    children: "Along with a description that follows the title.",
  },
} satisfies Meta<typeof Banner>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { args: { onDismiss: fn() } }

/** Mirrors the Figma frame. */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {(["neutral", "warning", "error", "success"] as const).map((variant) => (
        <Banner key={variant} {...args} variant={variant} onDismiss={() => {}} />
      ))}
    </div>
  ),
}

export const TitleOnly: Story = {
  args: { variant: "success", title: "Your booking is confirmed", children: undefined },
}

function DismissibleBanner() {
  const [visible, setVisible] = useState(true)
  if (!visible) return <p>Banner dismissed.</p>
  return (
    <Banner variant="warning" title="Fares change often" onDismiss={() => setVisible(false)}>
      Prices are held for 20 minutes once you start checkout.
    </Banner>
  )
}

/** Behaviour: the close button has an accessible name and removes the banner. */
export const Dismissing: Story = {
  render: () => <DismissibleBanner />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }))
    await expect(canvas.getByText("Banner dismissed.")).toBeInTheDocument()
  },
}

/** Long text wraps on a 320px phone; the close button stays put. */
export const WorstCase: Story = {
  render: () => (
    <div className="w-[320px] border border-dashed p-2">
      <Banner
        variant="error"
        title="We couldn't confirm your seat selection with Turkish Airlines"
        onDismiss={() => {}}
      >
        Your booking is safe. Seats will be assigned at check-in, or you can try again from Manage
        booking in a few minutes.
      </Banner>
    </div>
  ),
}

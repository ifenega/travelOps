import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion"

const meta = {
  title: "Components/Accordion",
  parameters: { layout: "padded" },
  render: () => (
    <Accordion type="single" collapsible defaultValue="p1" className="max-w-md border-t">
      {["Passenger 1", "Passenger 2", "Passenger 3"].map((name, index) => (
        <AccordionItem key={name} value={`p${index + 1}`}>
          <AccordionTrigger>{name}</AccordionTrigger>
          <AccordionContent>Details for {name}.</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** One passenger per section, as in checkout. */
export const Default: Story = {}

/** Behaviour: opening another section closes the first. */
export const OneAtATime: Story = {
  play: async ({ canvas, userEvent }) => {
    const first = canvas.getByRole("button", { name: "Passenger 1" })
    const second = canvas.getByRole("button", { name: "Passenger 2" })
    await expect(first).toHaveAttribute("aria-expanded", "true")
    await userEvent.click(second)
    await expect(second).toHaveAttribute("aria-expanded", "true")
    await expect(first).toHaveAttribute("aria-expanded", "false")
  },
}

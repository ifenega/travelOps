import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"

function BookingTabs() {
  return (
    <Tabs defaultValue="mine">
      <TabsList aria-label="Whose bookings">
        <TabsTrigger value="mine">
          My bookings <span className="text-muted-foreground">3</span>
        </TabsTrigger>
        <TabsTrigger value="team">
          Team bookings <span className="text-muted-foreground">3</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="mine" className="mt-4 text-sm">
        Your trips
      </TabsContent>
      <TabsContent value="team" className="mt-4 text-sm">
        Your team's trips
      </TabsContent>
    </Tabs>
  )
}

const meta = {
  title: "Components/Tabs",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** The Figma's "My bookings · Team bookings". */
export const BookingTabsExample: Story = { render: () => <BookingTabs /> }

/** Behaviour: arrow keys move between tabs and show the matching panel. */
export const Keyboard: Story = {
  render: () => <BookingTabs />,
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole("tab", { name: /My bookings/ }).focus()
    await userEvent.keyboard("{ArrowRight}")
    const team = canvas.getByRole("tab", { name: /Team bookings/ })
    await expect(team).toHaveFocus()
    await expect(team).toHaveAttribute("aria-selected", "true")
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Your team's trips")
  },
}

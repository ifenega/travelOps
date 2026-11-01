import type { Meta, StoryObj } from "@storybook/react-vite"
import { DotsHorizontal, Edit05, Share06, Trash01 } from "@untitledui/icons"
import { useState } from "react"
import { expect, waitFor, within } from "storybook/test"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./dropdown-menu"

function ManageBooking() {
  const [picked, setPicked] = useState("")
  return (
    <div className="flex flex-col items-start gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" aria-label="Manage Flight to United States">
            <DotsHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Manage booking</DropdownMenuLabel>
          <DropdownMenuItem
            icon={Edit05}
            description="Makes changes to your booking"
            onSelect={() => setPicked("edit")}
          >
            Edit booking
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={Share06}
            description="Share this trip with people"
            onSelect={() => setPicked("share")}
          >
            Share trip
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={Trash01}
            variant="destructive"
            description="Remove booking from your list"
            onSelect={() => setPicked("delete")}
          >
            Delete booking
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="text-muted-foreground text-sm">Picked: {picked || "nothing"}</p>
    </div>
  )
}

const meta = {
  title: "Components/DropdownMenu",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** The Figma's card menu. */
export const ManageBookingExample: Story = { render: () => <ManageBooking /> }

/** Behaviour: opens from the keyboard, arrow keys pick an item, and focus goes back to the button. */
export const Keyboard: Story = {
  render: () => <ManageBooking />,
  play: async ({ canvas, userEvent, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole("button", { name: "Manage Flight to United States" })
    trigger.focus()
    await userEvent.keyboard("{Enter}")

    const menu = await body.findByRole("menu")
    // The title is the item's name; the description line is its description.
    const share = within(menu).getByRole("menuitem", { name: "Share trip" })
    await expect(share).toHaveAccessibleDescription("Share this trip with people")

    await userEvent.keyboard("{ArrowDown}{Enter}")
    await waitFor(() => expect(canvas.getByText("Picked: share")).toBeInTheDocument())
    await waitFor(() => expect(body.queryByRole("menu")).toBeNull())
    await expect(trigger).toHaveFocus()
  },
}

/** Behaviour: Esc closes it without picking anything. */
export const EscCloses: Story = {
  render: () => <ManageBooking />,
  play: async ({ canvas, userEvent, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole("button", { name: "Manage Flight to United States" })
    await userEvent.click(trigger)
    await body.findByRole("menu")
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(body.queryByRole("menu")).toBeNull())
    await expect(trigger).toHaveFocus()
    await expect(canvas.getByText("Picked: nothing")).toBeInTheDocument()
  },
}

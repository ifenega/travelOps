import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { expect, waitFor, within } from "storybook/test"
import { Button } from "@/shared/ui/button"
import { mockControls } from "../api/mock-bookings-service"
import { seedTrips } from "../api/mock-data"
import { ShareTripDialog } from "./share-trip-dialog"

const myTrips = seedTrips.filter((t) => t.owner === "mine")
const usTrip = myTrips[0]
if (!usTrip) throw new Error("No mock trips")

function OpenShare() {
  const [open, setOpen] = useState(true)
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Share trip
      </Button>
      <ShareTripDialog
        open={open}
        onOpenChange={setOpen}
        trip={usTrip ?? null}
        trips={myTrips}
        returnFocusTo={null}
      />
    </>
  )
}

const meta = {
  title: "Bookings/ShareTripDialog",
  parameters: { layout: "fullscreen" },
  beforeEach: () => {
    mockControls.reset()
    mockControls.delay = 0
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Both switches off, as it opens. */
export const Default: Story = { render: () => <OpenShare /> }

/** Behaviour: turning on "Get a link" shows the trip picker and the link to copy. */
export const GetALink: Story = {
  render: () => <OpenShare />,
  play: async ({ canvasElement, userEvent }) => {
    const dialog = within(canvasElement.ownerDocument.body).getByRole("dialog", {
      name: "Share trip",
    })
    const linkSwitch = within(dialog).getByRole("switch", { name: "Get a link" })
    await waitFor(() => expect(linkSwitch).toBeEnabled())
    await userEvent.click(linkSwitch)
    const link = await within(dialog).findByRole("textbox", { name: "Share link" })
    await expect((link as HTMLInputElement).value).toMatch(
      /^https:\/\/travelops\.com\/share\/trip\//,
    )
    await expect(within(dialog).getByRole("combobox", { name: "Trip to share" })).toHaveTextContent(
      "United States trip",
    )
  },
}

/** Behaviour: pick people, Send, and a toast confirms. */
export const SendViaEmail: Story = {
  render: () => <OpenShare />,
  play: async ({ canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body)
    const dialog = body.getByRole("dialog", { name: "Share trip" })
    await userEvent.click(within(dialog).getByRole("switch", { name: "Send via email" }))

    const send = within(dialog).getByRole("button", { name: "Send" })
    await expect(send).toBeDisabled()

    const input = within(dialog).getByRole("combobox", { name: "Send to" })
    await userEvent.click(input)
    await waitFor(() => expect(within(dialog).getAllByRole("option").length).toBeGreaterThan(0))
    await userEvent.keyboard("{Enter}{Enter}{Escape}")
    await userEvent.click(send)
    await body.findByText("Trip shared with 2 people")
  },
}

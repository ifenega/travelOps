import type { Meta, StoryObj } from "@storybook/react-vite"
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router"
import { useState } from "react"
import { expect, waitFor, within } from "storybook/test"
import { mockBookings } from "@/features/bookings"
import { createAppRouter } from "../routes"

// The bookings pages inside the real app (routes, layout, sidebar), on the mock service.

function AppAt({ path }: { path: string }) {
  const [router] = useState(() => createAppRouter(createMemoryHistory({ initialEntries: [path] })))
  return <RouterProvider router={router} />
}

const meta = {
  title: "App/Bookings",
  parameters: { layout: "fullscreen" },
  globals: { viewport: { value: "desktop" } },
  // Fresh mock data for every story, and no waiting except where a story asks for it.
  beforeEach: () => {
    mockBookings.reset()
    mockBookings.delay = 0
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const List: Story = {
  render: () => <AppAt path="/bookings" />,
  play: async ({ canvas }) => {
    await canvas.findByRole("link", { name: "United States trip" })
    await expect(canvas.getByRole("tab", { name: "My bookings 4 trips" })).toHaveAttribute(
      "aria-selected",
      "true",
    )
  },
}

export const TeamBookings: Story = { render: () => <AppAt path="/bookings?owner=team" /> }

/** Past trips: all paid, so there's no status filter. */
export const Past: Story = {
  render: () => <AppAt path="/bookings?when=past" />,
  play: async ({ canvas }) => {
    await canvas.findByRole("link", { name: "Rome trip" })
    await expect(canvas.queryByRole("combobox", { name: "Status" })).toBeNull()
  },
}

export const Phone: Story = {
  render: () => <AppAt path="/bookings" />,
  globals: { viewport: { value: "mobile2" } },
}

export const Loading: Story = {
  render: () => <AppAt path="/bookings" />,
  beforeEach: () => {
    mockBookings.delay = 60_000
  },
}

export const LoadError: Story = {
  render: () => <AppAt path="/bookings" />,
  beforeEach: () => {
    mockBookings.fail = true
  },
  play: async ({ canvas }) => {
    await canvas.findByText("Couldn't load your trips")
    await expect(canvas.getByRole("button", { name: "Try again" })).toBeVisible()
  },
}

/** Behaviour: filtering announces the result; nothing matching offers "Clear filters". */
export const Filtering: Story = {
  render: () => <AppAt path="/bookings" />,
  play: async ({ canvas, userEvent }) => {
    await canvas.findByRole("link", { name: "United States trip" })
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search trips" }), "paris")
    await canvas.findByText("1 trip")
    await expect(canvas.getByRole("link", { name: "Weekend in Paris" })).toBeVisible()

    await userEvent.type(canvas.getByRole("searchbox", { name: "Search trips" }), "xyz")
    await canvas.findByRole("heading", { name: "No trips match" })
    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }))
    await canvas.findByRole("link", { name: "United States trip" })
    await expect(canvas.getByRole("searchbox", { name: "Search trips" })).toHaveValue("")
  },
}

/** Behaviour: deleting asks first, removes the card, and moves focus to the next card. */
export const DeleteTrip: Story = {
  render: () => <AppAt path="/bookings" />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(await canvas.findByRole("button", { name: "Manage United States trip" }))
    await userEvent.click(await body.findByRole("menuitem", { name: "Delete booking" }))
    const confirm = await body.findByRole("alertdialog", { name: "Delete United States trip?" })
    await userEvent.click(within(confirm).getByRole("button", { name: "Delete" }))

    // While the dialog is open the page behind it is hidden from screen readers, so wait for it.
    await waitFor(() => expect(body.queryByRole("alertdialog")).toBeNull(), { timeout: 3000 })
    await waitFor(() => expect(canvas.queryByText("United States trip")).toBeNull())
    await waitFor(() => expect(canvas.getByRole("link", { name: "Train to London" })).toHaveFocus())
    await body.findByText("United States trip deleted")
  },
}

/** Behaviour: Edit opens a chat about the trip. */
export const EditOpensChat: Story = {
  render: () => <AppAt path="/bookings" />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(await canvas.findByRole("button", { name: "Manage United States trip" }))
    await userEvent.click(await body.findByRole("menuitem", { name: "Edit booking" }))
    await canvas.findByRole("heading", { level: 1, name: "How can I help you travel today?" })
  },
}

/** The trip page: timeline on the left, map on the right. */
export const Trip: Story = {
  render: () => <AppAt path="/bookings/us-trip" />,
  play: async ({ canvas }) => {
    await canvas.findByRole("heading", { level: 1, name: "United States trip" })
    await expect(canvas.getByRole("tab", { name: "Trains" })).toBeVisible()
  },
}

/** Athens has no trains, so there's no Trains tab. */
export const TripWithoutTrains: Story = {
  render: () => <AppAt path="/bookings/athens-flight?tab=trains" />,
  play: async ({ canvas }) => {
    await canvas.findByRole("heading", { level: 1, name: "Flight to Athens" })
    await expect(canvas.queryByRole("tab", { name: "Trains" })).toBeNull()
    await expect(canvas.getByRole("tab", { name: "Itinerary" })).toHaveAttribute(
      "aria-selected",
      "true",
    )
  },
}

/** On phones the map opens full screen from a button. */
export const TripPhone: Story = {
  render: () => <AppAt path="/bookings/us-trip" />,
  globals: { viewport: { value: "mobile2" } },
  play: async ({ canvas }) => {
    await canvas.findByRole("heading", { level: 1, name: "United States trip" })
    await expect(canvas.getByRole("button", { name: "Map" })).toBeVisible()
  },
}

export const TripNotFound: Story = {
  render: () => <AppAt path="/bookings/no-such-trip" />,
  play: async ({ canvas }) => {
    await canvas.findByRole("heading", { level: 1, name: "Trip not found" })
  },
}

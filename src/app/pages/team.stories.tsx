import type { Meta, StoryObj } from "@storybook/react-vite"
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router"
import { useState } from "react"
import { expect, waitFor, within } from "storybook/test"
import { mockTeam } from "@/features/team"
import { createAppRouter } from "../routes"

// The team page inside the real app (routes, layout, sidebar), on the mock service.

function AppAt({ path }: { path: string }) {
  const [router] = useState(() => createAppRouter(createMemoryHistory({ initialEntries: [path] })))
  return <RouterProvider router={router} />
}

const meta = {
  title: "App/Team",
  parameters: { layout: "fullscreen" },
  globals: { viewport: { value: "desktop" } },
  beforeEach: () => {
    mockTeam.reset()
    mockTeam.delay = 0
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Members: Story = {
  render: () => <AppAt path="/members" />,
  play: async ({ canvas }) => {
    await canvas.findByRole("tab", { name: "All members 14" })
    await expect(canvas.getByRole("columnheader", { name: "Users" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    )
    await expect(canvas.getByText("14 results")).toBeVisible()
  },
}

export const Roles: Story = { render: () => <AppAt path="/members?tab=roles" /> }

export const Phone: Story = {
  render: () => <AppAt path="/members" />,
  globals: { viewport: { value: "mobile2" } },
}

export const Loading: Story = {
  render: () => <AppAt path="/members" />,
  beforeEach: () => {
    mockTeam.delay = 60_000
  },
}

export const LoadError: Story = {
  render: () => <AppAt path="/members" />,
  beforeEach: () => {
    mockTeam.fail = true
  },
  play: async ({ canvas }) => {
    await canvas.findByText("Couldn't load your team")
  },
}

/** Behaviour: searching narrows the table; nothing matching offers "Clear search". */
export const Searching: Story = {
  render: () => <AppAt path="/members" />,
  play: async ({ canvas, userEvent }) => {
    const box = await canvas.findByRole("searchbox", { name: "Search members" })
    await userEvent.type(box, "ifeoluwa")
    await canvas.findByText("1 result")
    await userEvent.type(box, "zzz")
    await userEvent.click(await canvas.findByRole("button", { name: "Clear search" }))
    await canvas.findByText("14 results")
  },
}

/** Behaviour: picking a new role asks first, then saves. */
export const ChangeRole: Story = {
  render: () => <AppAt path="/members" />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(
      await canvas.findByRole("button", { name: "Role for Ifeoluwa Olorunnegan: Finance analyst" }),
    )
    await userEvent.click(await body.findByRole("menuitem", { name: "Developer" }))
    const confirm = await body.findByRole("alertdialog", { name: "Change role?" })
    await userEvent.click(within(confirm).getByRole("button", { name: "Change role" }))

    await canvas.findByRole("button", { name: "Role for Ifeoluwa Olorunnegan: Developer" })
    await body.findByText("Ifeoluwa Olorunnegan is now Developer")
  },
}

/** Behaviour: deleting asks first, removes the row, and focus goes to the page heading. */
export const DeleteMember: Story = {
  render: () => <AppAt path="/members" />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(
      await canvas.findByRole("button", { name: "Role for Ada Nwosu: Developer" }),
    )
    await userEvent.click(await body.findByRole("menuitem", { name: "Delete user" }))
    const confirm = await body.findByRole("alertdialog", { name: "Delete member" })
    await userEvent.click(within(confirm).getByRole("button", { name: "Delete member" }))

    await waitFor(() => expect(body.queryByRole("alertdialog")).toBeNull(), { timeout: 3000 })
    await waitFor(() => expect(canvas.queryByText("Ada Nwosu")).toBeNull())
    await waitFor(() =>
      expect(canvas.getByRole("heading", { level: 1, name: "Team members" })).toHaveFocus(),
    )
  },
}

/** Behaviour: a role that members have can't be deleted, and the menu says why. */
export const RoleInUse: Story = {
  render: () => <AppAt path="/members?tab=roles" />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(
      await canvas.findByRole("button", { name: "Status of Traveller: Active" }),
    )
    const remove = await body.findByRole("menuitem", { name: "Delete role" })
    await expect(remove).toHaveAttribute("aria-disabled", "true")
    await expect(remove).toHaveAccessibleDescription(
      "Roles with members can't be deleted. 5 members have this role.",
    )
    // Close the menu so the accessibility check sees the page, not the menu's backdrop.
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(body.queryByRole("menu")).toBeNull())
  },
}

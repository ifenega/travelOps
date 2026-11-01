import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { useState } from "react"
import { expect, waitFor, within } from "storybook/test"
import { createAppRouter } from "@/app/routes"
import { ErrorPage } from "../pages/error-page"
import { DashboardLayout } from "./dashboard-layout"

// The real app routes, in memory, starting at a given URL.
function AppAt({ path }: { path: string }) {
  const [router] = useState(() => createAppRouter(createMemoryHistory({ initialEntries: [path] })))
  return <RouterProvider router={router} />
}

const meta = {
  title: "App/Dashboard layout",
  parameters: { layout: "fullscreen" },
  // A real desktop window (1280×1024), so the layout and its a11y checks don't depend on how
  // much room the Storybook panel leaves.
  globals: { viewport: { value: "desktop" } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Desktop: Story = {
  render: () => <AppAt path="/chat" />,
}

/** Behaviour: the menu opens as a sheet, a tap navigates, and focus lands on the new page's heading. */
export const MobileNavigation: Story = {
  render: () => <AppAt path="/chat" />,
  globals: { viewport: { value: "mobile2" } },
  play: async ({ canvas, userEvent, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(await canvas.findByRole("button", { name: "Open sidebar" }))

    const sheet = await body.findByRole("dialog", { name: "Navigation" })
    await userEvent.click(within(sheet).getByRole("link", { name: "Bookings" }))

    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull())
    const heading = await canvas.findByRole("heading", { level: 1, name: "Bookings" })
    await waitFor(() => expect(heading).toHaveFocus())
  },
}

/** Unknown URLs show the 404 page inside the layout, so the sidebar still works. */
export const NotFound: Story = {
  render: () => <AppAt path="/does-not-exist" />,
  play: async ({ canvas }) => {
    await canvas.findByRole("heading", { level: 1, name: "Page not found" })
    await expect(canvas.getByRole("link", { name: "Go to chat" })).toBeVisible()
  },
}

function CrashingApp() {
  const [router] = useState(() => {
    const rootRoute = createRootRoute({ component: DashboardLayout })
    const crashRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: () => {
        throw new Error("Simulated crash for the story")
      },
    })
    return createRouter({
      routeTree: rootRoute.addChildren([crashRoute]),
      history: createMemoryHistory({ initialEntries: ["/"] }),
      defaultErrorComponent: ErrorPage,
    })
  })
  return <RouterProvider router={router} />
}

/** A page that crashes shows the error page inside the layout, with Try again. */
export const PageCrash: Story = {
  render: () => <CrashingApp />,
  play: async ({ canvas }) => {
    await canvas.findByRole("heading", { level: 1, name: "Something went wrong" })
    await expect(canvas.getByRole("button", { name: "Try again" })).toBeVisible()
  },
}

import {
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
  type RouterHistory,
  redirect,
} from "@tanstack/react-router"
import { Stars02 } from "@untitledui/icons"
import { type FlagName, isEnabled } from "@/shared/flags/flags"
import { DashboardLayout } from "./layout/dashboard-layout"
import { ErrorPage, RootErrorPage } from "./pages/error-page"
import { NotFoundPage } from "./pages/not-found-page"
import { PlaceholderPage } from "./pages/placeholder-page"

// Every page in the app. Keep this file thin: each route points at a page component.

/** Route-level feature flag: when the flag is off, the route shows the 404 page. */
function requireFlag(name: FlagName) {
  return () => {
    if (!isEnabled(name)) throw notFound()
  }
}

const rootRoute = createRootRoute({
  component: DashboardLayout,
  notFoundComponent: NotFoundPage,
  errorComponent: RootErrorPage,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/chat" })
  },
})

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: () => (
    <PlaceholderPage
      title="New chat"
      breadcrumbs={[{ label: "Chats", to: "/chat", icon: Stars02 }, { label: "New chat" }]}
    />
  ),
})

const bookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bookings",
  beforeLoad: requireFlag("bookings"),
  component: () => <PlaceholderPage title="Bookings" />,
})

const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expenses",
  beforeLoad: requireFlag("expenses"),
  component: () => <PlaceholderPage title="Expenses" />,
})

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallet",
  beforeLoad: requireFlag("wallet"),
  component: () => <PlaceholderPage title="Wallet" />,
})

const policiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/policies",
  beforeLoad: requireFlag("policies"),
  component: () => <PlaceholderPage title="Policies" />,
})

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  beforeLoad: requireFlag("reports"),
  component: () => <PlaceholderPage title="Reports" />,
})

const membersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/members",
  component: () => <PlaceholderPage title="Invite members" />,
})

const supportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/support",
  component: () => <PlaceholderPage title="Chat with support" />,
})

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  component: () => <PlaceholderPage title="Manage your account" />,
})

export const routeTree = rootRoute.addChildren([
  indexRoute,
  chatRoute,
  bookingsRoute,
  expensesRoute,
  walletRoute,
  policiesRoute,
  reportsRoute,
  membersRoute,
  supportRoute,
  accountRoute,
])

/** The app's router. Tests and stories pass a memory history instead of the browser's. */
export function createAppRouter(history?: RouterHistory) {
  return createRouter({
    routeTree,
    history,
    // A crashing page shows the error page inside the layout, so the sidebar still works.
    defaultErrorComponent: ErrorPage,
  })
}

// Lets TypeScript check every <Link to="…"> and redirect against the real routes.
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}

import {
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
  type RouterHistory,
  redirect,
  stripSearchParams,
} from "@tanstack/react-router"
import { z } from "zod"
import {
  BookingsPage,
  bookingsSearchDefaults,
  bookingsSearchSchema,
  TripPage,
  tripSearchDefaults,
  tripSearchSchema,
} from "@/features/bookings"
import { ConversationPage, chatExists, NewChatPage } from "@/features/chat"
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
  // "Edit booking" opens a chat about that trip (or one leg of it). The chat feature reads these.
  validateSearch: z.object({
    tripId: z.string().optional().catch(undefined),
    bookingId: z.string().optional().catch(undefined),
  }),
  component: NewChatPage,
})

const conversationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat/$chatId",
  beforeLoad: ({ params }) => {
    if (!chatExists(params.chatId)) throw notFound()
  },
  component: function Conversation() {
    const { chatId } = conversationRoute.useParams()
    return <ConversationPage chatId={chatId} />
  },
})

const bookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bookings",
  beforeLoad: requireFlag("bookings"),
  validateSearch: bookingsSearchSchema,
  search: { middlewares: [stripSearchParams(bookingsSearchDefaults)] },
  component: BookingsPage,
})

const tripRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bookings/$tripId",
  beforeLoad: requireFlag("bookings"),
  validateSearch: tripSearchSchema,
  search: { middlewares: [stripSearchParams(tripSearchDefaults)] },
  component: TripPage,
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
  conversationRoute,
  bookingsRoute,
  tripRoute,
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

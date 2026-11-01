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
import {
  ConversationPage,
  chatExists,
  conversationSearchDefaults,
  conversationSearchSchema,
  NewChatPage,
} from "@/features/chat"
import {
  bookingExists,
  ExtrasPage,
  ItineraryPage,
  PassengersPage,
  PaymentPage,
} from "@/features/checkout"
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
  // ?view=results shows the chat's flights full width, with filters and page in the URL.
  validateSearch: conversationSearchSchema,
  search: { middlewares: [stripSearchParams(conversationSearchDefaults)] },
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

// Checkout: full pages without the sidebar (staticData.fullPage), one per step.
const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout/$bookingId",
  staticData: { fullPage: true },
  beforeLoad: ({ params }) => {
    requireFlag("checkout")()
    if (!bookingExists(params.bookingId)) throw notFound()
  },
})

const checkoutIndexRoute = createRoute({
  getParentRoute: () => checkoutRoute,
  path: "/",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/checkout/$bookingId/passengers", params })
  },
})

const passengersRoute = createRoute({
  getParentRoute: () => checkoutRoute,
  path: "/passengers",
  component: function Passengers() {
    return <PassengersPage bookingId={passengersRoute.useParams().bookingId} />
  },
})

const extrasRoute = createRoute({
  getParentRoute: () => checkoutRoute,
  path: "/extras",
  component: function Extras() {
    return <ExtrasPage bookingId={extrasRoute.useParams().bookingId} />
  },
})

const itineraryRoute = createRoute({
  getParentRoute: () => checkoutRoute,
  path: "/itinerary",
  component: function Itinerary() {
    return <ItineraryPage bookingId={itineraryRoute.useParams().bookingId} />
  },
})

const paymentRoute = createRoute({
  getParentRoute: () => checkoutRoute,
  path: "/payment",
  component: function Payment() {
    return <PaymentPage bookingId={paymentRoute.useParams().bookingId} />
  },
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
  checkoutRoute.addChildren([
    checkoutIndexRoute,
    passengersRoute,
    extrasRoute,
    itineraryRoute,
    paymentRoute,
  ]),
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
  interface StaticDataRouteOption {
    /** A page of its own without the dashboard's sidebar, e.g. checkout. */
    fullPage?: boolean
  }
}

import type { Decorator } from "@storybook/react-vite"
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { useState } from "react"

/**
 * Storybook decorator for components that use <Link> or useNavigate. The story renders at every
 * path, so following a link doesn't break it. For whole pages, use the real app routes instead
 * (see src/app/layout/dashboard-layout.stories.tsx).
 *
 *   const meta = { decorators: [withRouter] } satisfies Meta
 */
export const withRouter: Decorator = (Story) => <StoryRouter story={<Story />} />

function StoryRouter({ story }: { story: React.ReactNode }) {
  const [router] = useState(() =>
    createRouter({
      routeTree: createRootRoute({ component: () => story }),
      history: createMemoryHistory({ initialEntries: ["/"] }),
    }),
  )
  // The story's own type-checked links point at app routes this little router doesn't have.
  return <RouterProvider router={router as never} />
}

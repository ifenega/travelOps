import { Outlet, useRouter } from "@tanstack/react-router"
import { useEffect } from "react"
import { focusPageHeading } from "@/shared/lib/focus"
import { Sidebar, SidebarProvider } from "@/shared/ui/sidebar"
import { AppSidebar } from "./app-sidebar"

// The Figma dashboard: gray sidebar on the left, white rounded panel for the page on desktop.
// On mobile the panel fills the screen and the sidebar becomes a sheet.
export function DashboardLayout() {
  const router = useRouter()

  // After moving to another page (not on first load), focus its heading so screen readers
  // announce it. "onRendered" fires once the new page is on screen.
  useEffect(
    () =>
      router.subscribe("onRendered", ({ fromLocation, pathChanged }) => {
        if (fromLocation && pathChanged) focusPageHeading()
      }),
    [router],
  )

  return (
    <SidebarProvider>
      <a
        href="#main"
        className="sr-only rounded-lg bg-background px-4 py-2 font-medium shadow-lg focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to content
      </a>
      <div className="flex h-dvh bg-muted">
        <Sidebar>
          <AppSidebar />
        </Sidebar>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] lg:m-2 lg:rounded-xl lg:border lg:shadow-xs">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  )
}

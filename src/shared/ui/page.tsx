import { Link, type LinkProps } from "@tanstack/react-router"
import { ChevronRight } from "@untitledui/icons"
import type { ComponentType, ReactNode } from "react"
import { useOnlineStatus } from "@/shared/hooks/use-online-status"
import { cn } from "@/shared/lib/utils"
import { Banner } from "./banner"
import { SidebarCollapsedHeader } from "./sidebar"

// Every page renders inside <Page>: the browser tab title, the header (sidebar button,
// breadcrumbs, actions), an offline notice, and the scrolling <main> area.

type Breadcrumb = {
  label: string
  to?: LinkProps["to"]
  icon?: ComponentType<{ className?: string }>
}

type PageProps = {
  /** Used for the browser tab: "Bookings · TravelOps". */
  title: string
  /** Defaults to just the title. The last item is the current page. */
  breadcrumbs?: Breadcrumb[]
  /** Buttons on the right of the header, e.g. "Share chat". */
  actions?: ReactNode
  /** A full-height panel to the right of the page, e.g. the chat's map. */
  aside?: ReactNode
  /** Hides the page's own column so `aside` fills the width (the expanded map). */
  asideOnly?: boolean
  children: ReactNode
}

export function Page({
  title,
  breadcrumbs = [{ label: title }],
  actions,
  aside,
  asideOnly = false,
  children,
}: PageProps) {
  const online = useOnlineStatus()

  return (
    <div className="flex min-h-0 flex-1">
      <title>{`${title} · TravelOps`}</title>
      <div className={cn("flex min-w-0 flex-1 flex-col", asideOnly && "hidden")}>
        <PageColumn breadcrumbs={breadcrumbs} actions={actions} online={online}>
          {children}
        </PageColumn>
      </div>
      {aside}
    </div>
  )
}

function PageColumn({
  breadcrumbs,
  actions,
  online,
  children,
}: {
  breadcrumbs: Breadcrumb[]
  actions?: ReactNode
  online: boolean
  children: ReactNode
}) {
  return (
    <>
      <header className="shrink-0 border-b pt-[env(safe-area-inset-top)] print:hidden">
        <div className="flex h-12 items-center gap-2 px-4">
          <SidebarCollapsedHeader />
          <Breadcrumbs items={breadcrumbs} />
          {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </header>
      {!online && (
        <div className="px-4 pt-4">
          <Banner variant="warning" title="You're offline">
            Some things won't work until you reconnect.
          </Banner>
        </div>
      )}
      <main
        id="main"
        tabIndex={-1}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)] print:overflow-visible"
      >
        {children}
      </main>
    </>
  )
}

function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm">
        {items.map(({ label, to, icon: Icon }, index) => {
          const isCurrent = index === items.length - 1
          return (
            // On phones only the current page shows, to save space.
            <li
              key={label}
              className={cn("flex min-w-0 items-center gap-1.5", !isCurrent && "hidden sm:flex")}
            >
              {isCurrent || !to ? (
                <span aria-current={isCurrent ? "page" : undefined} className="truncate">
                  {label}
                </span>
              ) : (
                <Link
                  to={to}
                  className="flex items-center gap-1.5 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {Icon && <Icon className="size-4 shrink-0" />}
                  {label}
                </Link>
              )}
              {!isCurrent && (
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

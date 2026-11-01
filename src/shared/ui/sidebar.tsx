import { Link, type LinkProps } from "@tanstack/react-router"
import { LayoutLeft, Menu01 } from "@untitledui/icons"
import { Collapsible, Dialog } from "radix-ui"
import {
  type ComponentType,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import CaretDown from "@/shared/icons/svg/caret-down.svg?react"
import { focusPageHeading } from "@/shared/lib/focus"
import { cn } from "@/shared/lib/utils"
import { Button } from "./button"
import { Logo } from "./logo"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

// The app sidebar. On desktop (lg+) a column that collapses to an icon rail (design screen 9);
// below that, a sheet that slides in from the left.
// Inspired by shadcn/ui's Sidebar, cut down to what the TravelOps layout needs.

const desktopQuery = "(min-width: 64rem)" // Tailwind's lg breakpoint

type SidebarContextValue = {
  desktopOpen: boolean
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  /** Opens or closes the sidebar for whichever layout is showing. */
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

/** Where the sidebar's contents are being shown: the desktop column or the phone sheet. */
const PlacementContext = createContext<"desktop" | "sheet">("desktop")

/** Returns null outside a SidebarProvider (e.g. a full-screen error page). */
export function useSidebar() {
  return useContext(SidebarContext)
}

/** True while the desktop sidebar is collapsed to its icon rail: show icons, hide text. */
export function useSidebarRail() {
  const sidebar = useSidebar()
  const placement = useContext(PlacementContext)
  return placement === "desktop" && sidebar !== null && !sidebar.desktopOpen
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [desktopOpen, setDesktopOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  // If the window grows to desktop size while the sheet is open, close it. Otherwise the
  // invisible sheet would keep the rest of the page locked.
  useEffect(() => {
    const query = window.matchMedia(desktopQuery)
    const onChange = () => query.matches && setMobileOpen(false)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  function toggle() {
    if (window.matchMedia(desktopQuery).matches) setDesktopOpen(!desktopOpen)
    else setMobileOpen(!mobileOpen)
  }

  return (
    <SidebarContext value={{ desktopOpen, mobileOpen, setMobileOpen, toggle }}>
      {children}
    </SidebarContext>
  )
}

export function Sidebar({ children }: { children: ReactNode }) {
  const sidebar = useSidebar()
  const closedByLink = useRef(false)
  if (!sidebar) return null

  return (
    <>
      {/* Desktop: the width slides between the full column and the icon rail. */}
      <div
        data-slot="sidebar"
        className={cn(
          "hidden shrink-0 overflow-hidden transition-[width] duration-250 ease-in-out motion-reduce:transition-none lg:block print:hidden",
          sidebar.desktopOpen ? "w-60" : "w-14",
        )}
      >
        <PlacementContext value="desktop">{children}</PlacementContext>
      </div>
      <Dialog.Root open={sidebar.mobileOpen} onOpenChange={sidebar.setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in lg:hidden" />
          <Dialog.Content
            aria-describedby={undefined}
            // Tapping any link closes the sheet, and focus goes to the new page's heading
            // instead of back to the menu button, so screen readers announce where you landed.
            onClick={(event) => {
              if (event.target instanceof Element && event.target.closest("a")) {
                closedByLink.current = true
                sidebar.setMobileOpen(false)
              }
            }}
            onCloseAutoFocus={(event) => {
              if (!closedByLink.current) return
              closedByLink.current = false
              event.preventDefault()
              focusPageHeading()
            }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col bg-muted shadow-xl outline-none lg:hidden",
              "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]",
              "data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in",
            )}
          >
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            <PlacementContext value="sheet">{children}</PlacementContext>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

/** The logo and the menu button in the page header, on phones and tablets (no sidebar column). */
export function SidebarCollapsedHeader() {
  const sidebar = useSidebar()
  if (!sidebar) return null

  return (
    <div className="flex shrink-0 items-center gap-2 lg:hidden">
      <Logo />
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open sidebar"
        data-sidebar-open
        onClick={sidebar.toggle}
      >
        <Menu01 />
      </Button>
      <span aria-hidden="true" className="mr-1 h-4 w-px bg-border" />
    </div>
  )
}

/** Collapses / expands the desktop sidebar, or closes the phone sheet. */
export function SidebarToggleButton() {
  const sidebar = useSidebar()
  const placement = useContext(PlacementContext)
  if (!sidebar) return null

  const inSheet = placement === "sheet"
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={
        inSheet ? "Close sidebar" : sidebar.desktopOpen ? "Collapse sidebar" : "Expand sidebar"
      }
      aria-expanded={inSheet ? undefined : sidebar.desktopOpen}
      onClick={sidebar.toggle}
    >
      <LayoutLeft />
    </Button>
  )
}

type SidebarLinkProps = {
  to: LinkProps["to"]
  /** For routes with parameters, e.g. to="/chat/$chatId" params={{ chatId }}. */
  params?: LinkProps["params"]
  icon?: ComponentType<{ className?: string }>
  children: ReactNode
}

export function SidebarLink({ to, params, icon: Icon, children }: SidebarLinkProps) {
  const rail = useSidebarRail()
  const link = (
    <Link
      to={to}
      params={params}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm pointer-coarse:min-h-11",
        "hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2",
        "data-[status=active]:bg-foreground/10 data-[status=active]:font-medium",
        rail && "justify-center",
      )}
    >
      {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
      {/* In the rail the name is hidden but still read out, and shown in a tooltip. */}
      <span className={rail ? "sr-only" : "truncate"}>{children}</span>
    </Link>
  )
  if (!rail) return link

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{children}</TooltipContent>
    </Tooltip>
  )
}

/** A labelled group of links that can be collapsed, like "Workspace" in the Figma. */
export function SidebarSection({ label, children }: { label: string; children: ReactNode }) {
  const rail = useSidebarRail()
  return (
    <Collapsible.Root defaultOpen className="flex flex-col gap-0.5">
      <Collapsible.Trigger
        className={cn(
          "group flex w-fit items-center gap-1 rounded-md px-2 py-1 text-muted-foreground text-xs hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2 pointer-coarse:min-h-11",
          rail && "mx-auto",
        )}
      >
        {/* The rail shows "…" like the Figma; the label is still read out. */}
        {rail ? (
          <>
            <span aria-hidden="true">…</span>
            <span className="sr-only">{label}</span>
          </>
        ) : (
          label
        )}
        <CaretDown className="size-3 transition-transform duration-200 ease-out group-data-[state=closed]:-rotate-90" />
      </Collapsible.Trigger>
      <Collapsible.Content className="flex flex-col gap-0.5 overflow-hidden data-[state=closed]:animate-collapsible-close data-[state=open]:animate-collapsible-open">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

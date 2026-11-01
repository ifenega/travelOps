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

// The app sidebar. A column on desktop (lg+), a sheet that slides in from the left below that.
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

/** Returns null outside a SidebarProvider (e.g. a full-screen error page). */
export function useSidebar() {
  return useContext(SidebarContext)
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
    if (!window.matchMedia(desktopQuery).matches) {
      setMobileOpen(!mobileOpen)
      return
    }
    const next = !desktopOpen
    setDesktopOpen(next)
    // The button that was pressed disappears with the sidebar, so move keyboard focus to the
    // button that replaces it. (The mobile sheet handles focus itself.)
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(next ? "[data-sidebar-close]" : "[data-sidebar-open]")
        ?.focus()
    })
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
      {/*
       * Desktop: collapsing slides the column's width to 0 so the page panel glides over.
       * The contents keep their width (no squashing) and fade. `inert` keeps keyboard and
       * screen-reader users out of the hidden sidebar.
       */}
      <div
        data-slot="sidebar"
        inert={!sidebar.desktopOpen}
        className={cn(
          "hidden shrink-0 overflow-hidden transition-[width] duration-250 ease-in-out motion-reduce:transition-none lg:block",
          sidebar.desktopOpen ? "w-60" : "w-0",
        )}
      >
        <div
          className={cn(
            "flex h-full w-60 flex-col transition-opacity duration-250 ease-in-out",
            !sidebar.desktopOpen && "opacity-0",
          )}
        >
          {children}
        </div>
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
            {children}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

/**
 * The logo and the open button, for the page header whenever the sidebar is hidden:
 * always on mobile, and on desktop after collapsing. Mirrors the sidebar's own top row.
 */
export function SidebarCollapsedHeader() {
  const sidebar = useSidebar()
  if (!sidebar) return null

  return (
    <div className={cn("flex shrink-0 items-center gap-2", sidebar.desktopOpen && "lg:hidden")}>
      <Logo />
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open sidebar"
        data-sidebar-open
        onClick={sidebar.toggle}
      >
        <Menu01 className="lg:hidden" />
        <LayoutLeft className="hidden lg:block" />
      </Button>
      <span aria-hidden="true" className="mr-1 h-4 w-px bg-border" />
    </div>
  )
}

export function SidebarCloseButton() {
  const sidebar = useSidebar()
  if (!sidebar) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Close sidebar"
      data-sidebar-close
      onClick={sidebar.toggle}
    >
      <LayoutLeft />
    </Button>
  )
}

type SidebarLinkProps = {
  to: LinkProps["to"]
  icon: ComponentType<{ className?: string }>
  children: ReactNode
}

export function SidebarLink({ to, icon: Icon, children }: SidebarLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm pointer-coarse:min-h-11",
        "hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2",
        "data-[status=active]:bg-foreground/10 data-[status=active]:font-medium",
      )}
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      {children}
    </Link>
  )
}

/** A labelled group of links that can be collapsed, like "Workspace" in the Figma. */
export function SidebarSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Collapsible.Root defaultOpen className="flex flex-col gap-0.5">
      <Collapsible.Trigger className="group flex w-fit items-center gap-1 rounded-md px-2 py-1 text-muted-foreground text-xs hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2 pointer-coarse:min-h-11">
        {label}
        <CaretDown className="size-3 transition-transform duration-200 ease-out group-data-[state=closed]:-rotate-90" />
      </Collapsible.Trigger>
      <Collapsible.Content className="flex flex-col gap-0.5 overflow-hidden data-[state=closed]:animate-collapsible-close data-[state=open]:animate-collapsible-open">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

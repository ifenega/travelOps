import { createLink, Link } from "@tanstack/react-router"
import { ChevronLeft, XClose } from "@untitledui/icons"
import type { ComponentProps, ReactNode } from "react"
import { Button } from "@/shared/ui/button"
import { Logo } from "@/shared/ui/logo"
import { type CheckoutStep, ProgressSteps } from "./progress-steps"

// Every checkout page: a full page with no sidebar (design screens 20–28). The logo, the
// booking progress and ✕ (back to the chat) at the top, then the page.

export function CheckoutShell({
  title,
  step,
  chatId,
  children,
}: {
  /** For the browser tab. */
  title: string
  /** Leave out on the payment screens, which show only the logo. */
  step?: CheckoutStep
  /** Shows ✕, which leaves checkout for this chat. */
  chatId?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
      <title>{`${title} · TravelOps`}</title>
      <a
        href="#main"
        className="sr-only rounded-lg bg-background px-4 py-2 font-medium shadow-lg focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-10 bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Logo variant="display" />
          {step && <ProgressSteps current={step} />}
          {chatId ? (
            <Button asChild variant="secondary" size="icon" className="rounded-full">
              <Link to="/chat/$chatId" params={{ chatId }} aria-label="Leave checkout">
                <XClose className="size-4" />
              </Link>
            </Button>
          ) : (
            <span />
          )}
        </div>
      </header>
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]"
      >
        {children}
      </main>
    </div>
  )
}

/** "‹ Flight selection": back to the previous checkout step. Takes the same props as <Link>. */
export const BackLink = createLink(function BackLinkAnchor({
  children,
  ...props
}: ComponentProps<"a">) {
  return (
    <a
      {...props}
      className="group mb-4 flex w-fit items-center gap-2 rounded-full font-medium text-sm focus-visible:outline-2 focus-visible:outline-ring"
    >
      <span className="grid size-7 place-items-center rounded-full border shadow-xs group-hover:bg-muted">
        <ChevronLeft aria-hidden="true" className="size-4" />
      </span>
      {children}
    </a>
  )
})

/** The two-column checkout page: the form on the left, the overview card on the right. */
export function CheckoutColumns({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start">
      <div className="flex min-w-0 flex-col gap-8">{children}</div>
      <aside aria-label="Trip summary" className="lg:sticky lg:top-20">
        {aside}
      </aside>
    </div>
  )
}

/** A section heading in the display font: "PASSENGERS", "CONTACT DETAILS". */
export function SectionHeading({
  as: Heading = "h2",
  id,
  children,
}: {
  as?: "h1" | "h2"
  id?: string
  children: ReactNode
}) {
  return (
    // The text stays "Contact details"; CSS makes it capitals, so screen readers read words.
    <Heading id={id} className="font-display text-3xl uppercase leading-none">
      {children}
    </Heading>
  )
}

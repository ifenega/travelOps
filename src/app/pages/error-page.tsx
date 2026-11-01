import { type ErrorComponentProps, Link } from "@tanstack/react-router"
import { AlertCircle } from "@untitledui/icons"
import { useEffect } from "react"
import { Button } from "@/shared/ui/button"
import { Page } from "@/shared/ui/page"
import { StatusPage } from "./status-page"

/** Shown when a page crashes. Users never see technical details; developers do, in dev only. */
export function ErrorPage({ error }: ErrorComponentProps) {
  useEffect(() => {
    // TODO: send to error monitoring once one is chosen.
    console.error(error)
  }, [error])

  return (
    <Page title="Something went wrong">
      <StatusPage
        icon={AlertCircle}
        title="Something went wrong"
        description="We hit an unexpected problem. Try again, or head back to chat."
      >
        <Button onClick={() => window.location.reload()}>Try again</Button>
        <Button asChild variant="outline">
          <Link to="/chat">Go to chat</Link>
        </Button>
      </StatusPage>
      {import.meta.env.DEV && (
        // Wraps instead of scrolling sideways, so it needs no keyboard scrolling.
        <pre className="mx-6 mb-6 whitespace-pre-wrap break-words rounded-lg bg-muted p-4 text-xs">
          {error instanceof Error ? error.stack : String(error)}
        </pre>
      )}
    </Page>
  )
}

/** If the layout itself crashes there's no sidebar to keep, so the error page fills the screen. */
export function RootErrorPage(props: ErrorComponentProps) {
  return (
    <div className="flex h-dvh flex-col">
      <ErrorPage {...props} />
    </div>
  )
}

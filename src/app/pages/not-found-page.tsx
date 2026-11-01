import { Link } from "@tanstack/react-router"
import { SearchLg } from "@untitledui/icons"
import { Button } from "@/shared/ui/button"
import { Page } from "@/shared/ui/page"
import { StatusPage } from "./status-page"

/** Unknown URLs and routes whose feature flag is off. */
export function NotFoundPage() {
  return (
    <Page title="Page not found">
      <StatusPage
        icon={SearchLg}
        title="Page not found"
        description="This page doesn't exist or has moved. Check the address, or head back to chat."
      >
        <Button asChild>
          <Link to="/chat">Go to chat</Link>
        </Button>
      </StatusPage>
    </Page>
  )
}

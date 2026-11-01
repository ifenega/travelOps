import type { ComponentProps } from "react"
import { Page } from "@/shared/ui/page"

/** Stands in for a page until its design arrives. Replace with the real feature page. */
export function PlaceholderPage({
  title,
  breadcrumbs,
}: Pick<ComponentProps<typeof Page>, "title" | "breadcrumbs">) {
  return (
    <Page title={title} breadcrumbs={breadcrumbs}>
      <div className="p-6">
        <h1 className="font-semibold text-2xl">{title}</h1>
        <p className="mt-1 text-muted-foreground">This page is coming soon.</p>
      </div>
    </Page>
  )
}

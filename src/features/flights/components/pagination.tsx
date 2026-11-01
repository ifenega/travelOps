import { ChevronLeft, ChevronRight } from "@untitledui/icons"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"

/**
 * "1 2 … 10 11": the first two, the last two, and the current page with its neighbours.
 * `gapBefore` marks where pages were skipped (shown as "…").
 */
export function pageItems(current: number, count: number) {
  const pages = new Set([1, 2, current - 1, current, current + 1, count - 1, count])
  const sorted = [...pages].filter((page) => page >= 1 && page <= count).sort((a, b) => a - b)
  return sorted.map((page, index) => ({
    page,
    gapBefore: index > 0 && page - sorted[index - 1] > 1,
  }))
}

/** Results pages (design screen 16). The current page is marked for screen readers. */
export function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}) {
  if (pageCount <= 1) return null
  return (
    <nav aria-label="Results pages" className="flex items-center justify-between gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="size-4" />
        Previous
      </Button>
      {/* Phones show "Page 2 of 11"; wider screens show the page numbers. */}
      <p className="text-muted-foreground text-sm sm:hidden">
        Page {page} of {pageCount}
      </p>
      <ol className="hidden items-center gap-1 sm:flex">
        {pageItems(page, pageCount).map((item) => (
          <li key={item.page} className="flex items-center gap-1">
            {item.gapBefore && (
              <span aria-hidden="true" className="px-1 text-muted-foreground text-sm">
                …
              </span>
            )}
            <button
              type="button"
              aria-current={item.page === page ? "page" : undefined}
              onClick={() => onPageChange(item.page)}
              className={cn(
                "grid size-8 place-items-center rounded-md text-sm hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-ring",
                item.page === page ? "bg-foreground/5 font-medium" : "text-muted-foreground",
              )}
            >
              <span className="sr-only">Page </span>
              {item.page}
            </button>
          </li>
        ))}
      </ol>
      <Button
        variant="outline"
        size="sm"
        disabled={page === pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  )
}

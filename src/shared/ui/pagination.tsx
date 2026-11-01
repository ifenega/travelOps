import { useMediaQuery } from "@/shared/hooks/use-media-query"
import { pageNumbers } from "@/shared/lib/page-numbers"
import { cn } from "@/shared/lib/utils"
import { Button } from "./button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

type PaginationProps = {
  /** 1-based. */
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  /** How many items there are in all, e.g. "6 results". */
  total: number
  pageSize: number
  onPageSizeChange: (size: number) => void
  pageSizes?: number[]
  className?: string
}

// The table footer from the Figma: "6 results · Rows per page: 10 ⌄ · 1 2 3 … 10 · Previous / Next".
// On phones the page numbers give way to "Page 2 of 10".
export function Pagination({
  page,
  pageCount,
  onPageChange,
  total,
  pageSize,
  onPageSizeChange,
  pageSizes = [10, 25, 50],
  className,
}: PaginationProps) {
  const wide = useMediaQuery("(min-width: 48rem)")

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-between gap-3 py-3 text-sm", className)}
    >
      <div className="flex items-center gap-4">
        <p aria-live="polite">{total === 1 ? "1 result" : `${total} results`}</p>
        <div className="flex items-center gap-1 text-muted-foreground">
          <span aria-hidden="true" className="hidden sm:inline">
            Rows per page:
          </span>
          <Select value={String(pageSize)} onValueChange={(size) => onPageSizeChange(Number(size))}>
            <SelectTrigger variant="ghost" aria-label="Rows per page" className="text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent aria-label="Rows per page">
              {pageSizes.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {wide ? (
        <ol className="flex items-center gap-0.5">
          {pageNumbers(page, pageCount).map((n, index) =>
            n === "…" ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: gaps have no identity of their own
              <li key={`gap-${index}`} aria-hidden="true" className="px-2 text-muted-foreground">
                …
              </li>
            ) : (
              <li key={n}>
                <button
                  type="button"
                  onClick={() => onPageChange(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === page ? "page" : undefined}
                  className={cn(
                    "size-8 rounded-full text-muted-foreground tabular-nums hover:bg-foreground/5 hover:text-foreground",
                    "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                    "aria-[current=page]:bg-foreground/10 aria-[current=page]:font-medium aria-[current=page]:text-foreground",
                  )}
                >
                  {n}
                </button>
              </li>
            ),
          )}
        </ol>
      ) : (
        <p className="order-last w-full text-center text-muted-foreground sm:order-none sm:w-auto">
          Page {page} of {pageCount}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  )
}

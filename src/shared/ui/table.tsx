import { ArrowDown, ArrowUp, ChevronSelectorVertical } from "@untitledui/icons"
import type * as React from "react"
import { cn } from "@/shared/lib/utils"

// Based on shadcn/ui's Table (plain semantic <table> parts), restyled to the TravelOps Figma,
// plus the Figma's cell types: status bar, status with detail line, and sortable header.
// Number cells: add "text-right tabular-nums" so digits line up.

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    // Wide tables scroll sideways inside their container on phones instead of breaking the page.
    <div data-slot="table-container" className="w-full overflow-x-auto overscroll-x-contain">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b transition-colors duration-150 hover:bg-muted/60 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-10 whitespace-nowrap px-3 text-left align-middle font-medium text-muted-foreground text-xs uppercase tracking-wide",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("whitespace-nowrap px-3 py-2.5 align-middle", className)} {...props} />
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption className={cn("mt-4 text-muted-foreground text-sm", className)} {...props} />
}

type SortDirection = "ascending" | "descending" | "none"

/** A header the user can click to sort by. aria-sort tells screen readers the current order. */
function TableSortHead({
  direction = "none",
  onSort,
  children,
  className,
}: {
  direction?: SortDirection
  onSort: () => void
  children: React.ReactNode
  className?: string
}) {
  const Icon =
    direction === "ascending"
      ? ArrowUp
      : direction === "descending"
        ? ArrowDown
        : ChevronSelectorVertical
  return (
    <TableHead aria-sort={direction} className={className}>
      <button
        type="button"
        onClick={onSort}
        className="-mx-1 inline-flex items-center gap-1 rounded-sm px-1 uppercase hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        {children}
        <Icon aria-hidden="true" className="size-3.5" />
      </button>
    </TableHead>
  )
}

// Status colours. Bars use shades that keep 3:1 contrast against the background; detail text
// uses 700 shades for 4.5:1. Colour is never the only signal: pair it with text or an sr-only label.
const tones = {
  neutral: { bar: "bg-gray-600", text: "text-muted-foreground" },
  info: { bar: "bg-primary-600", text: "text-primary-700" },
  success: { bar: "bg-success-600", text: "text-success-700" },
  warning: { bar: "bg-warning-600", text: "text-warning-700" },
  error: { bar: "bg-error-500", text: "text-error-700" },
}

type Tone = keyof typeof tones

/** The coloured bar at the start of a row. `label` is read out to screen readers. */
function TableStatusBar({ tone, label }: { tone: Tone; label: string }) {
  return (
    <>
      <span aria-hidden="true" className={cn("block h-6 w-0.5 rounded-full", tones[tone].bar)} />
      <span className="sr-only">{label}</span>
    </>
  )
}

/** A value with a coloured detail line underneath, e.g. "Conflict / Fare changed" or "$4,566.00 / −$2.00". */
function TableStatus({
  tone,
  title,
  detail,
}: {
  tone: Tone
  title: React.ReactNode
  detail?: React.ReactNode
}) {
  return (
    <div className="flex gap-2">
      <span aria-hidden="true" className={cn("w-0.5 shrink-0 rounded-full", tones[tone].bar)} />
      <div className="flex flex-col">
        <span>{title}</span>
        {detail && <span className={cn("text-xs", tones[tone].text)}>{detail}</span>}
      </div>
    </div>
  )
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortHead,
  TableStatus,
  TableStatusBar,
}

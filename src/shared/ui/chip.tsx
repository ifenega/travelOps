import { XClose } from "@untitledui/icons"
import type * as React from "react"
import { cn } from "@/shared/lib/utils"

// A small rounded label with a border, e.g. a traveller or a seat ("Flight 1 · 9B · £56 ×").
// With `onRemove` it gets an × button. Plain status labels use <Badge> instead.
function Chip({
  children,
  onRemove,
  removeLabel,
  className,
}: {
  children: React.ReactNode
  onRemove?: () => void
  /** The × button's name, e.g. "Remove seat 9B on flight 1". Required with onRemove. */
  removeLabel?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded-full border bg-background px-2.5 text-xs",
        onRemove && "pr-1",
        className,
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          className="relative grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:after:absolute pointer-coarse:after:size-11"
        >
          <XClose aria-hidden="true" className="size-3.5" />
        </button>
      )}
    </span>
  )
}

export { Chip }

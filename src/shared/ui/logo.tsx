import { Plane } from "@untitledui/icons"
import { cn } from "@/shared/lib/utils"

/**
 * The TravelOps mark and name. Placeholder mark until the logo asset arrives.
 * "display" is the larger wordmark at the top of checkout (design screens 20–28).
 */
export function Logo({
  variant = "default",
  className,
}: {
  variant?: "default" | "display"
  className?: string
}) {
  const display = variant === "display"
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2",
        display ? "font-display text-2xl uppercase leading-none" : "font-semibold text-sm",
        className,
      )}
    >
      <span
        className={cn(
          "grid place-items-center rounded-full bg-primary-600 text-white",
          display ? "size-8" : "size-5",
        )}
      >
        <Plane aria-hidden="true" className={display ? "size-4" : "size-3"} />
      </span>
      TravelOps
    </div>
  )
}

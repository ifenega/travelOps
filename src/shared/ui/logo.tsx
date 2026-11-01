import { Plane } from "@untitledui/icons"
import { cn } from "@/shared/lib/utils"

/** The TravelOps mark and name. Placeholder mark until the logo asset arrives. */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex shrink-0 items-center gap-2 font-semibold text-sm", className)}>
      <span className="grid size-5 place-items-center rounded-full bg-primary-600 text-white">
        <Plane aria-hidden="true" className="size-3" />
      </span>
      TravelOps
    </div>
  )
}

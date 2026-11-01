import { cn } from "@/shared/lib/utils"
import type { Airline } from "../types"

/**
 * A stand-in for the airline's logo (its two-letter code) until logo files arrive.
 * Decorative: the airline's name is always written next to it.
 */
export function AirlineLogo({ airline, className }: { airline: Airline; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-md bg-primary-50 font-semibold text-primary-700 text-xs dark:bg-primary-600/15 dark:text-primary-300",
        className,
      )}
    >
      {airline.code}
    </span>
  )
}

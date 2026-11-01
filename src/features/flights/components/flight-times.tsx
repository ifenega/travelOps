import { Plane } from "@untitledui/icons"
import { cn } from "@/shared/lib/utils"
import type { Flight } from "../types"
import {
  daysLater,
  describeStops,
  formatDuration,
  formatTime,
  summarizeFlight,
} from "../utils/format"

/**
 * "11:50 PM LOS —— 11h 50m · 1 stop —— 1:40 PM⁺¹ ATH", the row on every flight card.
 * Screen readers get the same facts as one sentence instead of the visual pieces.
 */
export function FlightTimes({
  flight,
  compact = false,
  className,
}: {
  flight: Flight
  /** Narrow cards (in the chat, the overview): shorter stop text. */
  compact?: boolean
  className?: string
}) {
  const summary = summarizeFlight(flight)
  const nextDay = daysLater(summary.departAt, summary.arriveAt)
  const stops = describeStops(flight, { detailed: !compact })

  return (
    <div className={className}>
      <p className="sr-only">
        Departs {summary.from.city} ({summary.from.code}) at {formatTime(summary.departAt)}, arrives{" "}
        {summary.to.city} ({summary.to.code}) at {formatTime(summary.arriveAt)}
        {nextDay > 0 && (nextDay === 1 ? " the next day" : ` ${nextDay} days later`)}.{" "}
        {formatDuration(summary.minutes)}, {stops}.
      </p>
      <div aria-hidden="true" className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <div>
          <p className={cn("font-medium", !compact && "sm:text-lg")}>
            {formatTime(summary.departAt)}
          </p>
          <p className="text-muted-foreground text-xs">{summary.from.code}</p>
        </div>
        <div className="flex min-w-0 flex-col items-center gap-0.5 text-muted-foreground text-xs">
          <span>{formatDuration(summary.minutes)}</span>
          <span className="flex w-full items-center gap-1">
            <Plane className="size-3.5 shrink-0 rotate-45" />
            <span className="h-px flex-1 bg-border" />
            <span className="size-1 shrink-0 rounded-full bg-gray-400" />
          </span>
          <span className="truncate">{stops}</span>
        </div>
        <div>
          <p className={cn("font-medium", !compact && "sm:text-lg")}>
            {formatTime(summary.arriveAt)}
            {nextDay > 0 && <sup className="ml-0.5 text-error-600 text-xs">+{nextDay}</sup>}
          </p>
          <p className="text-muted-foreground text-xs">{summary.to.code}</p>
        </div>
      </div>
    </div>
  )
}

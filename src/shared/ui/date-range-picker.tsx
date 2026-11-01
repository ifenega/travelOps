import type { DateRange } from "@daypicker/react"
import { type ReactElement, useState } from "react"
import { useMediaQuery } from "@/shared/hooks/use-media-query"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { ResponsivePopover } from "./responsive-popover"

export type { DateRange }

const shortDate = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" })

/** "Jun 17 – Jun 28", "Jun 17" while only the start is picked, or undefined if empty. */
export function formatDateRange(range: DateRange | undefined) {
  if (!range?.from) return undefined
  if (!range.to) return shortDate.format(range.from)
  return `${shortDate.format(range.from)} – ${shortDate.format(range.to)}`
}

type DateRangePickerProps = {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
  /** The button that opens the picker, e.g. the search bar's "When" field. */
  trigger: ReactElement
  /** Accessible name, and the heading of the sheet on phones. */
  title?: string
}

// Pick a start and end date. A popover with two months on larger screens; a bottom sheet with one
// month on phones. Past dates can't be picked.
export function DateRangePicker({
  value,
  onChange,
  trigger,
  title = "Select dates",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const showTwoMonths = useMediaQuery("(min-width: 48rem)")
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <ResponsivePopover trigger={trigger} title={title} open={open} onOpenChange={setOpen}>
      <Calendar
        mode="range"
        selected={value}
        onSelect={onChange}
        numberOfMonths={showTwoMonths ? 2 : 1}
        defaultMonth={value?.from}
        disabled={{ before: today }}
        className="mx-auto"
      />
      <div className="mt-3 flex justify-end gap-2 border-t pt-3">
        <Button variant="ghost" size="sm" onClick={() => onChange(undefined)}>
          Clear
        </Button>
        <Button size="sm" onClick={() => setOpen(false)}>
          Done
        </Button>
      </div>
    </ResponsivePopover>
  )
}

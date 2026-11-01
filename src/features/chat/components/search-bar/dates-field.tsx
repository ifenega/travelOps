import { cn } from "@/shared/lib/utils"
import { type DateRange, DateRangePicker, formatDateRange } from "@/shared/ui/date-range-picker"
import {
  segmentClassName,
  segmentLabelClassName,
  segmentPlaceholderClassName,
  segmentValueClassName,
} from "./segment"

type DatesFieldProps = {
  id: string
  value: DateRange | undefined
  onChange: (dates: DateRange | undefined) => void
  invalid?: boolean
  describedBy?: string
}

// "When": opens the date range picker (popover on larger screens, bottom sheet on phones).
export function DatesField({ id, value, onChange, invalid, describedBy }: DatesFieldProps) {
  const text = formatDateRange(value)
  return (
    <DateRangePicker
      title="Travel dates"
      value={value}
      onChange={onChange}
      trigger={
        <button
          id={id}
          type="button"
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={segmentClassName}
        >
          <span className={cn(segmentLabelClassName, invalid && "text-error-700")}>
            When<span className="sr-only">,</span>
          </span>
          <span className={cn(segmentValueClassName, !text && segmentPlaceholderClassName)}>
            {text ?? "Add dates"}
          </span>
        </button>
      }
    />
  )
}

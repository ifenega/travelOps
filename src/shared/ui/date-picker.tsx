import { Calendar as CalendarIcon } from "@untitledui/icons"
import type * as React from "react"
import { useState } from "react"
import { formatDayMonthYear, parseDayMonthYear } from "@/shared/lib/day-month-year"
import { cn } from "@/shared/lib/utils"
import { Calendar } from "./calendar"
import { ResponsivePopover } from "./responsive-popover"

type DatePickerProps = Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  /** The text in the field, "DD/MM/YYYY" (the form's Zod schema checks it). */
  value: string
  onChange: (value: string) => void
  /** Names the calendar button and sheet, e.g. "Date from". */
  label: string
}

// A date field from the Figma: type DD/MM/YYYY, or pick from the calendar button inside it.
// It's a real text input, so the <Field> label names it and screen readers read its value.
//
//   <Field label="Date from" error={errors.from?.message}>
//     {(control) => <DatePicker {...control} label="Date from" value={from} onChange={setFrom} />}
//   </Field>
export function DatePicker({ value, onChange, label, className, ...inputProps }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = parseDayMonthYear(value) ?? undefined

  return (
    <div className={cn("relative", className)}>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="DD/MM/YYYY"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-9 w-full min-w-0 rounded-lg border bg-background pr-10 pl-3 text-base shadow-xs outline-none md:text-sm",
          "transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-gray-600",
          "focus:border-primary-500 focus:ring-4 focus:ring-primary-600/15",
          "aria-invalid:border-error-500 aria-invalid:focus:ring-error-600/15",
        )}
        {...inputProps}
      />
      <ResponsivePopover
        title={label}
        open={open}
        onOpenChange={setOpen}
        align="end"
        trigger={
          <button
            type="button"
            aria-label={`${label}: pick from calendar`}
            className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <CalendarIcon aria-hidden="true" className="size-4" />
          </button>
        }
      >
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (date) onChange(formatDayMonthYear(date))
            setOpen(false)
          }}
          className="mx-auto"
        />
      </ResponsivePopover>
    </div>
  )
}

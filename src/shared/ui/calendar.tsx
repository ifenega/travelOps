import { DayPicker, type DayPickerProps } from "@daypicker/react"
import { ChevronLeft, ChevronRight } from "@untitledui/icons"
import { cn } from "@/shared/lib/utils"

// Based on shadcn/ui's Calendar (DayPicker), on our tokens. No Figma yet; it follows the existing
// patterns: primary blue for the selection, gray hover, our focus ring, tabular numbers.
// DayPicker handles the keyboard (arrows, Page Up/Down, Home/End) and the grid semantics.

const navButtonClassName =
  "grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40"

export function Calendar({ className, classNames, ...props }: DayPickerProps) {
  return (
    <DayPicker
      className={cn("w-fit text-sm", className)}
      classNames={{
        months: "relative flex flex-col gap-6 md:flex-row",
        month: "flex flex-col gap-3",
        month_caption: "flex h-8 items-center justify-center font-medium",
        nav: "absolute inset-x-0 top-0 z-10 flex items-center justify-between",
        button_previous: navButtonClassName,
        button_next: navButtonClassName,
        month_grid: "border-collapse",
        weekdays: "flex",
        weekday: "w-10 font-normal text-muted-foreground text-xs",
        week: "mt-1 flex",
        day: "size-10 p-0 text-center",
        day_button:
          "size-10 rounded-lg tabular-nums transition-colors duration-150 hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2",
        today: "[&>button]:font-semibold [&>button]:text-primary-700",
        range_middle: "bg-primary-50 dark:bg-primary-600/15 [&>button]:rounded-none",
        range_start:
          "rounded-l-lg bg-primary-50 dark:bg-primary-600/15 [&>button]:bg-primary-600 [&>button]:text-white",
        range_end:
          "rounded-r-lg bg-primary-50 dark:bg-primary-600/15 [&>button]:bg-primary-600 [&>button]:text-white",
        outside: "opacity-40",
        disabled: "[&>button]:pointer-events-none [&>button]:text-gray-400",
        hidden: "invisible",
        ...classNames,
      }}
      components={{ Chevron }}
      {...props}
    />
  )
}

function Chevron({ orientation, className }: { orientation?: string; className?: string }) {
  const Icon = orientation === "left" ? ChevronLeft : ChevronRight
  return <Icon className={cn("size-4", className)} />
}

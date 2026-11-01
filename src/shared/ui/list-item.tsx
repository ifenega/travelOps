import type * as React from "react"
import { cn } from "@/shared/lib/utils"

type ListItemProps = Omit<React.ComponentProps<"button">, "title"> & {
  icon?: React.ComponentType<{ className?: string }>
  title: React.ReactNode
  description?: React.ReactNode
  /** Marks the current choice. Announced as "pressed" by screen readers. */
  selected?: boolean
}

// The Figma "List item": icon, title and a smaller line under it. Default, selected and disabled.
// A button, so it works in pickers and menus; wrap a group of them in a <ul>.
function ListItem({
  icon: Icon,
  title,
  description,
  selected,
  className,
  type = "button",
  ...props
}: ListItemProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-2.5 rounded-md px-3 py-2 text-left text-sm pointer-coarse:min-h-11",
        "transition-colors duration-150 hover:bg-foreground/5 aria-pressed:bg-foreground/10",
        "focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
      <span className="flex min-w-0 flex-col">
        <span className="truncate">{title}</span>
        {description && (
          <span className="truncate text-muted-foreground text-xs">{description}</span>
        )}
      </span>
    </button>
  )
}

export { ListItem }

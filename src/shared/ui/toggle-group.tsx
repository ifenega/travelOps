import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import type * as React from "react"
import { cn } from "@/shared/lib/utils"

// Based on shadcn/ui's ToggleGroup, styled like the Figma's "Flights · Trains · Stays" pills.
// type="single" lets the choice be cleared (the Figma starts with none selected).
// Arrow keys move between items; Space/Enter toggles.

const ToggleGroup = ToggleGroupPrimitive.Root

function ToggleGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-muted-foreground text-sm pointer-coarse:min-h-11",
        "transition-colors duration-150 hover:text-foreground",
        "data-[state=on]:bg-foreground/5 data-[state=on]:text-foreground",
        "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }

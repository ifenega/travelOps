import { Popover as PopoverPrimitive } from "radix-ui"
import type * as React from "react"
import { cn } from "@/shared/lib/utils"

// Based on shadcn/ui's Popover, on our tokens. On phones prefer <ResponsivePopover>,
// which becomes a bottom sheet.

/** The floating-panel look shared by popovers, selects and autocomplete lists. */
export const popoverSurfaceClassName =
  "z-50 rounded-lg border bg-popover text-popover-foreground shadow-lg outline-none"

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger

function PopoverContent({
  className,
  align = "start",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn(
          popoverSurfaceClassName,
          "max-w-[calc(100vw-1rem)] origin-(--radix-popover-content-transform-origin) animate-popover-in p-3",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverContent, PopoverTrigger }

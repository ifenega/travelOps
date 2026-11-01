import { Tabs as TabsPrimitive } from "radix-ui"
import type * as React from "react"
import { cn } from "@/shared/lib/utils"

// Based on shadcn/ui's Tabs, styled like the ToggleGroup pills ("My bookings · Team bookings").
// Use tabs when each choice shows a different panel; use ToggleGroup for a setting.
// Arrow keys move between tabs. Tab switches are never animated (CLAUDE.md).

const Tabs = TabsPrimitive.Root

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex max-w-full items-center gap-1 overflow-x-auto", className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-muted-foreground text-sm pointer-coarse:min-h-11",
        // No transition: tabs switch with the arrow keys, and keyboard actions never animate.
        "hover:text-foreground",
        "data-[state=active]:bg-foreground/5 data-[state=active]:text-foreground",
        "focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "rounded-md outline-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4",
        className,
      )}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }

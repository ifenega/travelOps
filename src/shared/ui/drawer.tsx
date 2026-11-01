import type * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import { cn } from "@/shared/lib/utils"

// Bottom sheet for phones, based on shadcn/ui's Drawer (Vaul). Vaul handles the drag-to-dismiss
// gesture and the iOS-style animation; focus trapping and Esc come from Radix underneath.

const Drawer = DrawerPrimitive.Root
const DrawerTrigger = DrawerPrimitive.Trigger
const DrawerClose = DrawerPrimitive.Close

function DrawerContent({
  title,
  children,
  className,
}: {
  /** Shown at the top and used as the sheet's accessible name. */
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40" />
      <DrawerPrimitive.Content
        aria-describedby={undefined}
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-xl bg-popover pb-[env(safe-area-inset-bottom)] text-popover-foreground outline-none"
      >
        <div
          aria-hidden="true"
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-foreground/15"
        />
        <DrawerPrimitive.Title className="px-4 pt-3 font-semibold">{title}</DrawerPrimitive.Title>
        <div className={cn("overflow-y-auto overscroll-contain p-4", className)}>{children}</div>
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  )
}

export { Drawer, DrawerClose, DrawerContent, DrawerTrigger }

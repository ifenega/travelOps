import { XClose } from "@untitledui/icons"
import { Dialog as SheetPrimitive } from "radix-ui"
import type * as React from "react"
import { Button } from "./button"

// A panel that slides in from the right over a dimmed page, e.g. checkout's flight details
// (design screen 22). Full width on phones. Built on Radix Dialog: focus is trapped, Esc closes
// it, and focus returns to the trigger.
//
//   <Sheet>
//     <SheetTrigger asChild><Button>See flight details</Button></SheetTrigger>
//     <SheetContent title="Flight details">…</SheetContent>
//   </Sheet>

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger

function SheetContent({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-40 bg-black/30 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
      <SheetPrimitive.Content
        aria-describedby={undefined}
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-popover pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] text-popover-foreground shadow-xl outline-none data-[state=closed]:animate-sheet-right-out data-[state=open]:animate-sheet-right-in sm:max-w-lg"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 px-4 pt-4">
          <SheetPrimitive.Title className="font-display text-3xl uppercase leading-none">
            {title}
          </SheetPrimitive.Title>
          <SheetPrimitive.Close asChild>
            <Button variant="secondary" size="icon" aria-label="Close" className="rounded-full">
              <XClose className="size-4" />
            </Button>
          </SheetPrimitive.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">{children}</div>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

export { Sheet, SheetContent, SheetTrigger }

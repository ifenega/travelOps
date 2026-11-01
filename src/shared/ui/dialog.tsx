import { XClose } from "@untitledui/icons"
import { Dialog as DialogPrimitive } from "radix-ui"
import type * as React from "react"
import { cn } from "@/shared/lib/utils"
import { Button } from "./button"

// Based on shadcn/ui's Dialog, restyled to the Figma's "Share trip" dialog: a white card near
// the top of a dimmed, blurred page, with a title, a description and a close (✕) button.
// Radix traps focus, closes on Esc and returns focus to the DialogTrigger.
// Opened without a trigger (e.g. from a menu item)? Radix can't tell where focus should go back
// to, so pass onCloseAutoFocus: (event) => { event.preventDefault(); buttonRef.current?.focus() }
//
//   <Dialog open={open} onOpenChange={setOpen}>
//     <DialogContent title="Share trip" description="Share this trip with people">…</DialogContent>
//   </Dialog>

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

type DialogContentProps = {
  /** Shown at the top and used as the dialog's accessible name. */
  title: string
  /** Shown under the title and read out when the dialog opens. */
  description?: string
  /** "fullscreen" fills the screen, e.g. a map on phones. */
  size?: "default" | "fullscreen"
  onCloseAutoFocus?: (event: Event) => void
  children: React.ReactNode
  className?: string
}

function DialogContent({
  title,
  description,
  size = "default",
  onCloseAutoFocus,
  children,
  className,
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        onCloseAutoFocus={onCloseAutoFocus}
        // Radix links the description itself; without one, opt out so it doesn't warn.
        {...(!description && { "aria-describedby": undefined })}
        className={cn(
          "fixed z-50 flex flex-col bg-popover text-popover-foreground outline-none",
          "data-[state=closed]:animate-fade-out data-[state=open]:animate-dialog-in",
          size === "default" &&
            "inset-x-4 top-[max(1rem,10dvh)] mx-auto max-h-[80dvh] max-w-md rounded-xl shadow-xl",
          size === "fullscreen" &&
            "inset-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
        )}
      >
        <div className="flex shrink-0 items-start gap-4 px-4 pt-4">
          <div className="min-w-0 flex-1">
            <DialogPrimitive.Title className="font-medium text-lg">{title}</DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="text-muted-foreground text-sm">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="icon" aria-label="Close" className="-mt-0.5 -mr-1">
              <XClose />
            </Button>
          </DialogPrimitive.Close>
        </div>
        <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain p-4", className)}>
          {children}
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export { Dialog, DialogClose, DialogContent, DialogTrigger }

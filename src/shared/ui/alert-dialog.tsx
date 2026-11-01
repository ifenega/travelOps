import { AlertDialog as AlertDialogPrimitive } from "radix-ui"
import { cn } from "@/shared/lib/utils"
import { Button } from "./button"

// Based on shadcn/ui's AlertDialog: asks before something that can't be undone, e.g. Delete.
// Unlike Dialog it doesn't close on an outside click, and Radix puts focus on Cancel.
//
// Opened without a trigger (e.g. from a menu item)? Radix can't tell where focus should go back
// to, so pass onCloseAutoFocus: (event) => { event.preventDefault(); buttonRef.current?.focus() }
//
//   <AlertDialog open={open} onOpenChange={setOpen}>
//     <AlertDialogContent
//       title="Delete this trip?"
//       description="This removes it from your list."
//       confirmLabel="Delete trip"
//       onConfirm={deleteTrip}
//     />
//   </AlertDialog>

const AlertDialog = AlertDialogPrimitive.Root

type AlertDialogContentProps = {
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  /** "destructive" makes the confirm button red. */
  variant?: "default" | "destructive"
  onCloseAutoFocus?: (event: Event) => void
  className?: string
}

function AlertDialogContent({
  title,
  description,
  confirmLabel,
  onConfirm,
  variant = "destructive",
  onCloseAutoFocus,
  className,
}: AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        onCloseAutoFocus={onCloseAutoFocus}
        className={cn(
          "fixed inset-x-4 top-[max(1rem,20dvh)] z-50 mx-auto max-w-sm rounded-xl bg-popover p-4 text-popover-foreground shadow-xl outline-none",
          "data-[state=closed]:animate-fade-out data-[state=open]:animate-dialog-in",
          className,
        )}
      >
        <AlertDialogPrimitive.Title className="font-medium text-lg">
          {title}
        </AlertDialogPrimitive.Title>
        <AlertDialogPrimitive.Description className="mt-1 text-muted-foreground text-sm">
          {description}
        </AlertDialogPrimitive.Description>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AlertDialogPrimitive.Cancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogPrimitive.Cancel>
          <AlertDialogPrimitive.Action asChild>
            <Button
              variant={variant === "destructive" ? "destructive" : "primary"}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </AlertDialogPrimitive.Action>
        </div>
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  )
}

export { AlertDialog, AlertDialogContent }

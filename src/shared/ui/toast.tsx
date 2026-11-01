import { XClose } from "@untitledui/icons"
import type { ReactNode } from "react"
import { Toaster as SonnerToaster, toast as sonner } from "sonner"
import { AlertCircleSolid, CheckCircleSolid } from "@/shared/icons/status-icons"
import { cn } from "@/shared/lib/utils"
import { Button } from "./button"

// Toasts for quick feedback on actions ("Saved", "Couldn't save"). Sonner handles stacking,
// swipe-to-dismiss and the screen-reader live region; we draw the toast ourselves on our tokens
// (Sonner's recommended "headless" setup), so it matches the design system and dark mode.
//
//   toast.success("Booking saved")
//   toast.error("Couldn't save the booking", { description: "Check your connection and try again." })
//   toast("Fare updated", { action: { label: "Undo", onClick: undo } })

const variants = {
  neutral: { label: "", icon: null },
  success: { label: "Success", icon: { Icon: CheckCircleSolid, className: "text-success-600" } },
  warning: { label: "Warning", icon: { Icon: AlertCircleSolid, className: "text-warning-600" } },
  error: { label: "Error", icon: { Icon: AlertCircleSolid, className: "text-error-600" } },
}

type Variant = keyof typeof variants

type ToastOptions = {
  description?: ReactNode
  action?: { label: string; onClick: () => void }
  /** Milliseconds. Errors stay longer by default so there's time to read them. */
  duration?: number
}

function ToastCard({
  id,
  variant,
  title,
  description,
  action,
}: { id: string | number; variant: Variant; title: ReactNode } & Omit<ToastOptions, "duration">) {
  const { label, icon } = variants[variant]
  return (
    // Same widths as Sonner's own toasts: --width (356px) on desktop, full width below 600px.
    <div className="flex w-(--width) max-w-full items-start gap-3 rounded-lg border bg-popover p-4 text-popover-foreground text-sm shadow-lg max-[600px]:w-full">
      {icon && <icon.Icon size={18} className={cn("mt-px shrink-0", icon.className)} />}
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {label && <span className="sr-only">{label}: </span>}
          {title}
        </p>
        {description && <p className="mt-0.5 text-muted-foreground">{description}</p>}
        {action && (
          <Button
            variant="outline"
            size="xs"
            className="mt-3"
            onClick={() => {
              action.onClick()
              sonner.dismiss(id)
            }}
          >
            {action.label}
          </Button>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Dismiss notification"
        onClick={() => sonner.dismiss(id)}
        className="-mt-1 -mr-1"
      >
        <XClose />
      </Button>
    </div>
  )
}

function show(variant: Variant, title: ReactNode, { duration, ...options }: ToastOptions = {}) {
  return sonner.custom((id) => <ToastCard id={id} variant={variant} title={title} {...options} />, {
    duration: duration ?? (variant === "error" ? 8000 : 4000),
  })
}

export const toast = Object.assign(
  (title: ReactNode, options?: ToastOptions) => show("neutral", title, options),
  {
    success: (title: ReactNode, options?: ToastOptions) => show("success", title, options),
    warning: (title: ReactNode, options?: ToastOptions) => show("warning", title, options),
    error: (title: ReactNode, options?: ToastOptions) => show("error", title, options),
    dismiss: sonner.dismiss,
  },
)

/** Mount once at the app root (outside any dialog). */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      // On phones, keep toasts clear of the home indicator.
      mobileOffset={{ bottom: "calc(16px + env(safe-area-inset-bottom))", left: 16, right: 16 }}
    />
  )
}

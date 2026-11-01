import { XClose } from "@untitledui/icons"
import type * as React from "react"
import { AlertCircleSolid, CheckCircleSolid } from "@/shared/icons/status-icons"
import { cn } from "@/shared/lib/utils"
import { Button } from "./button"

// Based on shadcn/ui's Alert, restyled to the TravelOps Figma "Banner".
const variants = {
  neutral: {
    label: "Note",
    Icon: CheckCircleSolid,
    className: "bg-gray-50 dark:bg-gray-900",
    iconClassName: "text-gray-600",
  },
  warning: {
    label: "Warning",
    Icon: AlertCircleSolid,
    className: "bg-warning-100 dark:bg-warning-600/15",
    iconClassName: "text-warning-600",
  },
  error: {
    label: "Error",
    Icon: AlertCircleSolid,
    className: "bg-error-100 dark:bg-error-600/15",
    iconClassName: "text-error-600",
  },
  success: {
    label: "Success",
    Icon: CheckCircleSolid,
    className: "bg-success-100 dark:bg-success-600/15",
    iconClassName: "text-success-600",
  },
}

type BannerProps = Omit<React.ComponentProps<"div">, "title"> & {
  variant?: keyof typeof variants
  title: React.ReactNode
  /** The description under the title. */
  children?: React.ReactNode
  /** Shows a close button. The parent removes the banner. */
  onDismiss?: () => void
}

function Banner({
  variant = "neutral",
  title,
  children,
  onDismiss,
  className,
  ...props
}: BannerProps) {
  const { label, Icon, className: variantClassName, iconClassName } = variants[variant]

  return (
    <div
      data-slot="banner"
      // Errors interrupt a screen reader; everything else waits until it's quiet.
      role={variant === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-4 rounded-lg px-5 py-4", variantClassName, className)}
      {...props}
    >
      <Icon size={18} className={cn("mt-0.75 shrink-0", iconClassName)} />
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {/* The colour and icon carry the type visually; this says it to screen readers. */}
          <span className="sr-only">{label}: </span>
          {title}
        </p>
        {children && <div className="text-muted-foreground">{children}</div>}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="-my-1 -mr-1 [&_svg]:size-6"
        >
          <XClose />
        </Button>
      )}
    </div>
  )
}

export { Banner }

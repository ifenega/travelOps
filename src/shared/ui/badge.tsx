import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"
import { cn } from "@/shared/lib/utils"

// Based on shadcn/ui's Badge, restyled to the TravelOps Figma.
// Text uses the 700 shade so every colour passes WCAG AA on its tinted background.
const badgeVariants = cva("inline-block max-w-full truncate rounded-md align-middle", {
  variants: {
    size: {
      sm: "px-2 py-0.5 text-xs", // inside table cells
      md: "px-2.5 py-1 text-sm",
    },
    variant: {
      neutral: "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
      info: "bg-info-100 text-info-700 dark:bg-info-700/20 dark:text-info-100",
      success: "bg-success-100 text-success-700 dark:bg-success-600/20 dark:text-success-300",
      warning: "bg-warning-100 text-warning-700 dark:bg-warning-600/20 dark:text-warning-300",
      error: "bg-error-100 text-error-700 dark:bg-error-600/20 dark:text-error-300",
      "error-solid": "bg-error-600 text-white",
    },
  },
  defaultVariants: {
    variant: "neutral",
    size: "md",
  },
})

type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

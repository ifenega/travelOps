import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import type * as React from "react"
import { cn } from "@/shared/lib/utils"

// Based on shadcn/ui's Button, restyled to the TravelOps Figma.
// Colours are nudged where the design failed WCAG AA contrast (see docs/phase-1-plan.md).
const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent text-center font-medium",
    "[&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
    // Press feedback: a small scale on press (not on release), dropped for reduced motion.
    "transition-[transform,background-color,border-color,color] duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100",
    "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
    "disabled:pointer-events-none",
    // On touch screens, stretch the tappable area to at least 44×44 without changing the look.
    "pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 pointer-coarse:after:-translate-1/2",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-300",
        outline:
          "border-border bg-background text-foreground shadow-xs hover:bg-muted disabled:text-gray-500 disabled:shadow-none",
        soft: "bg-primary-50 text-primary-700 hover:bg-primary-100 disabled:bg-primary-25 disabled:text-primary-300 dark:bg-primary-600/15 dark:text-primary-300",
        destructive: "bg-error-600 text-white hover:bg-error-700 disabled:bg-error-300",
        "destructive-outline":
          "border-error-200 bg-background text-error-600 shadow-xs hover:bg-error-25 disabled:border-error-100 disabled:text-error-300 disabled:shadow-none dark:border-error-800 dark:text-error-400 dark:hover:bg-error-600/10",
        "destructive-soft":
          "bg-error-50 text-error-700 hover:bg-error-100 disabled:bg-error-25 disabled:text-error-300 dark:bg-error-600/15 dark:text-error-300",
        // Quiet gray button, e.g. "Label" and "+" in table cells.
        secondary: "bg-foreground/5 text-foreground hover:bg-foreground/10 disabled:text-gray-500",
        // For icon-only controls such as a close (✕) or help (?) button.
        ghost: "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
      },
      size: {
        xs: "min-h-7 rounded-md px-2 py-1 text-xs [&_svg]:size-4",
        sm: "min-h-9 px-3 py-1.5 text-sm",
        md: "min-h-10 px-4 py-2 text-sm",
        lg: "min-h-11 px-4 py-2.5 text-base",
        "icon-xs": "size-7 rounded-md [&_svg]:size-4",
        icon: "size-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render the styles on the child element instead, e.g. a link: <Button asChild><a href="…" /></Button> */
    asChild?: boolean
  }

function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Component = asChild ? Slot.Root : "button"
  return (
    <Component
      data-slot="button"
      // Default to type="button" so a button inside a form never submits it by accident.
      type={asChild ? type : (type ?? "button")}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }

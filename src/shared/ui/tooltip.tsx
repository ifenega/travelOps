import { Tooltip as TooltipPrimitive } from "radix-ui"
import type * as React from "react"
import { cn } from "@/shared/lib/utils"

// Based on shadcn/ui's Tooltip, restyled to the TravelOps Figma.
//
// Tooltips only open on hover and keyboard focus, never on touch. Use them for hints that repeat
// something already visible or labelled (e.g. an icon button's aria-label). If a phone user needs
// the information, use <HelpTip> instead, which opens on tap.

/** The dark tooltip look, shared with HelpTip so both always match. */
export const tooltipSurfaceClassName =
  "z-50 max-w-[min(20rem,calc(100vw-1rem))] rounded-lg bg-gray-800 px-3 py-2 text-white text-xs shadow-lg"

/** Wrap the app once. The first tooltip waits; moving to a neighbour opens it instantly. */
function TooltipProvider({
  delayDuration = 400,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
}

const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

type TooltipContentProps = Omit<React.ComponentProps<typeof TooltipPrimitive.Content>, "title"> & {
  /** Optional bold first line, for the larger "title + description" tooltip. */
  title?: React.ReactNode
}

function TooltipContent({
  title,
  children,
  className,
  sideOffset = 6,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn(
          tooltipSurfaceClassName,
          // Animate only the delayed first open. Instant opens (moving between tooltips) don't animate.
          "origin-(--radix-tooltip-content-transform-origin) data-[state=delayed-open]:animate-pop-in",
          className,
        )}
        {...props}
      >
        {title && <p className="font-semibold">{title}</p>}
        {title ? <p className="mt-0.5 text-gray-200">{children}</p> : children}
        <TooltipPrimitive.Arrow width={12} height={6} className="fill-gray-800" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }

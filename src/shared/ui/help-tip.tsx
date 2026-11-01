import { HelpCircle } from "@untitledui/icons"
import { Popover as PopoverPrimitive } from "radix-ui"
import type * as React from "react"
import { cn } from "@/shared/lib/utils"
import { Button } from "./button"
import { tooltipSurfaceClassName } from "./tooltip"

// The Figma "Help icon": a (?) that shows a tooltip-style explanation.
// It's a popover, not a tooltip, so it opens on tap and click as well as with the keyboard:
// phone users get the same help as desktop users.

type HelpTipProps = {
  /** Accessible name for the (?) button, e.g. "About layovers". */
  label: string
  /** Optional bold first line. */
  title?: React.ReactNode
  children: React.ReactNode
  side?: React.ComponentProps<typeof PopoverPrimitive.Content>["side"]
}

function HelpTip({ label, title, children, side = "top" }: HelpTipProps) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          className="size-6 rounded-full [&_svg]:size-4"
        >
          <HelpCircle />
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-slot="help-tip-content"
          aria-label={label}
          side={side}
          sideOffset={6}
          collisionPadding={8}
          className={cn(
            tooltipSurfaceClassName,
            "origin-(--radix-popover-content-transform-origin) animate-pop-in outline-none",
          )}
        >
          {title && <p className="font-semibold">{title}</p>}
          <div className={cn(title && "mt-0.5 text-gray-200")}>{children}</div>
          <PopoverPrimitive.Arrow width={12} height={6} className="fill-gray-800" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

export { HelpTip }

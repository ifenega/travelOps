import { Check, Minus } from "@untitledui/icons"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import type * as React from "react"
import { cn } from "@/shared/lib/utils"

// Based on shadcn/ui's Checkbox, on our tokens. Supports checked="indeterminate" (e.g. "select all"
// when only some rows are selected). Needs a label: a <label>, aria-label or aria-labelledby.
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative grid size-4 shrink-0 place-items-center rounded-sm border border-gray-300 bg-background text-white",
        "transition-[background-color,border-color] duration-150 ease-out",
        "data-[state=checked]:border-primary-600 data-[state=checked]:bg-primary-600",
        "data-[state=indeterminate]:border-primary-600 data-[state=indeterminate]:bg-primary-600",
        "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // On touch screens, stretch the tappable area to 44×44 without changing the look.
        "pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-11 pointer-coarse:after:-translate-1/2",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="group">
        <Check className="size-3 group-data-[state=indeterminate]:hidden" strokeWidth={3} />
        <Minus className="hidden size-3 group-data-[state=indeterminate]:block" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }

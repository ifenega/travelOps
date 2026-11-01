import { Switch as SwitchPrimitive } from "radix-ui"
import type * as React from "react"
import { cn } from "@/shared/lib/utils"

// Based on shadcn/ui's Switch, restyled to the Figma (e.g. "Get a link" in Share trip).
// Give it a name with aria-labelledby (or a <label htmlFor>), and its help text with aria-describedby.
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-gray-200 p-0.5 dark:bg-gray-700",
        "transition-colors duration-150 ease-out data-[state=checked]:bg-primary-600",
        "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        // On touch screens, stretch the tappable area to at least 44×44 without changing the look.
        "pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 pointer-coarse:after:-translate-1/2",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-4 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out data-[state=checked]:translate-x-4" />
    </SwitchPrimitive.Root>
  )
}

export { Switch }

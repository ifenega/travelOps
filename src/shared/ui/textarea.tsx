import type * as React from "react"
import { cn } from "@/shared/lib/utils"

// Multi-line text on the same tokens as Input (border, focus ring, 16px text on phones).
// Use inside <Field> for the label and error wiring.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-14 w-full min-w-0 rounded-lg border bg-background px-3 py-2 text-base shadow-xs outline-none md:text-sm",
        "transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-gray-600",
        "focus:border-primary-500 focus:ring-4 focus:ring-primary-600/15",
        "aria-invalid:border-error-500 aria-invalid:focus:ring-error-600/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }

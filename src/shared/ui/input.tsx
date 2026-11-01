import type * as React from "react"
import { cn } from "@/shared/lib/utils"

// Text input on our tokens; matches the chat prompt input's border and focus ring.
// 16px text so iOS never zooms in on focus. Use inside <Field> for the label and error wiring.
function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border bg-background px-3 text-base shadow-xs outline-none",
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

export { Input }

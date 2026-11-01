import { Briefcase01, CreditCard01, Users01 } from "@untitledui/icons"
import type { ComponentType } from "react"
import { CheckCircleSolid } from "@/shared/icons/status-icons"
import { cn } from "@/shared/lib/utils"

// The booking progress at the top of checkout (design screen 20). The flight steps are always
// done by the time checkout opens.

const steps: { id: CheckoutStep; label: string; icon?: ComponentType<{ className?: string }> }[] = [
  { id: "search", label: "Search" },
  { id: "departing", label: "Departing flight" },
  { id: "return", label: "Return flight" },
  { id: "passengers", label: "Passengers", icon: Users01 },
  { id: "itinerary", label: "Itinerary", icon: Briefcase01 },
  { id: "payment", label: "Payment", icon: CreditCard01 },
]

export type CheckoutStep =
  | "search"
  | "departing"
  | "return"
  | "passengers"
  | "itinerary"
  | "payment"

export function ProgressSteps({ current }: { current: CheckoutStep }) {
  const currentIndex = steps.findIndex((step) => step.id === current)
  return (
    <>
      {/* Phones: just "Step 4 of 6 · Passengers". */}
      <p className="text-muted-foreground text-sm lg:hidden">
        Step {currentIndex + 1} of {steps.length} · {steps[currentIndex].label}
      </p>
      <ol aria-label="Booking progress" className="hidden items-center gap-1 text-xs lg:flex">
        {steps.map((step, index) => {
          const done = index < currentIndex
          const Icon = step.icon
          return (
            <li key={step.id} className="flex items-center gap-1">
              {index > 0 && <span aria-hidden="true" className="h-px w-3 bg-border" />}
              <span
                aria-current={index === currentIndex ? "step" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2 py-1",
                  index === currentIndex && "bg-muted font-medium",
                  index > currentIndex && "text-muted-foreground",
                )}
              >
                {done ? (
                  <CheckCircleSolid aria-hidden="true" className="size-4 text-success-600" />
                ) : (
                  Icon && <Icon aria-hidden="true" className="size-4" />
                )}
                {step.label}
                {done && <span className="sr-only"> (done)</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </>
  )
}

import { BankNote01, Building02, File04, Plane, XClose } from "@untitledui/icons"
import { type ComponentType, useId } from "react"
import { Button } from "@/shared/ui/button"

export type Suggestion = {
  label: string
  icon: ComponentType<{ className?: string }>
}

/** The four cards from the Figma (copy lightly corrected: "Book an hotel(s)" → "Book a hotel"). */
export const startingSuggestions: Suggestion[] = [
  { label: "Book a flight", icon: Plane },
  { label: "Book a hotel", icon: Building02 },
  { label: "What are my itineraries?", icon: File04 },
  { label: "What's my per diem?", icon: BankNote01 },
]

type SuggestionsProps = {
  items: Suggestion[]
  onSelect: (suggestion: Suggestion) => void
  /** Shows the ✕ to hide the whole block. */
  onDismiss?: () => void
}

// The "Get started" cards under the chat input, from the Figma.
export function Suggestions({ items, onSelect, onDismiss }: SuggestionsProps) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 id={headingId} className="font-medium text-sm">
          Get started
        </h2>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Hide suggestions"
            onClick={onDismiss}
            className="-mr-1.5 [&_svg]:size-4"
          >
            <XClose />
          </Button>
        )}
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="flex h-full w-full flex-col items-start gap-3 rounded-lg bg-muted p-3 text-left text-sm transition-[transform,background-color] duration-150 ease-out hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 active:scale-[0.98] motion-reduce:active:scale-100"
            >
              <item.icon className="size-4 text-muted-foreground" />
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

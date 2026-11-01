import { ChevronLeft, ChevronRight, SlashCircle01 } from "@untitledui/icons"
import { useRef } from "react"
import { CheckCircleSolid } from "@/shared/icons/status-icons"
import { Banner } from "@/shared/ui/banner"
import { Button } from "@/shared/ui/button"
import { useFares } from "../hooks/use-flights"
import type { Fare } from "../types"
import { formatPrice } from "../utils/format"
import { PolicyIcon } from "./policy-icon"

/**
 * The fares for a flight, side by side (design screen 17). The row scrolls sideways: swipe on
 * touch screens, the arrow buttons with a mouse, and Tab moves through each fare's Select.
 */
export function FareOptions({
  flightId,
  onSelect,
}: {
  flightId: string
  onSelect: (fare: Fare) => void
}) {
  const fares = useFares(flightId)
  const row = useRef<HTMLUListElement>(null)

  function scroll(direction: 1 | -1) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    row.current?.scrollBy({
      left: direction * row.current.clientWidth * 0.8,
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }

  if (fares.isPending) {
    return (
      <p role="status" className="p-4 text-center text-muted-foreground text-sm">
        Loading fares…
      </p>
    )
  }
  if (fares.isError) {
    return (
      <Banner variant="error" title="We couldn't load the fares">
        <Button variant="outline" size="sm" className="mt-2" onClick={() => fares.refetch()}>
          Try again
        </Button>
      </Banner>
    )
  }

  return (
    <div className="relative">
      <ul
        ref={row}
        aria-label="Fare options"
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none]"
      >
        {fares.data.map((fare) => (
          <li key={fare.id} className="w-60 shrink-0 snap-start">
            <FareCard fare={fare} onSelect={() => onSelect(fare)} />
          </li>
        ))}
      </ul>
      {/* For mouse users; touch users swipe, keyboard users Tab (each Select scrolls into view). */}
      <div className="pointer-events-none absolute inset-y-0 -inset-x-2 hidden items-center justify-between sm:flex">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous fares"
          className="pointer-events-auto rounded-full"
          onClick={() => scroll(-1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="More fares"
          className="pointer-events-auto rounded-full"
          onClick={() => scroll(1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function FareCard({ fare, onSelect }: { fare: Fare; onSelect: () => void }) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-xl bg-background p-4 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-medium">{fare.name}</h4>
          <p className="text-muted-foreground text-xs">{fare.bookingClass}</p>
        </div>
        <PolicyIcon policy={fare.policy} />
      </div>
      <p>
        <span className="font-semibold text-lg">{formatPrice(fare.price)}</span>{" "}
        <span className="text-muted-foreground text-xs italic">round trip</span>
      </p>
      <ul className="flex flex-1 flex-col gap-2 border-t pt-3 text-sm">
        {fare.features.map((feature) => (
          <li
            key={feature.label}
            className={feature.included ? "flex gap-2" : "flex gap-2 text-muted-foreground"}
          >
            {feature.included ? (
              <CheckCircleSolid
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-success-600"
              />
            ) : (
              <SlashCircle01 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            )}
            {feature.label}
          </li>
        ))}
      </ul>
      <Button size="sm" className="w-full" onClick={onSelect}>
        Select
        <span className="sr-only">
          {" "}
          {fare.name}, {formatPrice(fare.price)}
        </span>
      </Button>
    </article>
  )
}

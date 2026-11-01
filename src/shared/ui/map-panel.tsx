import { lazy, Suspense } from "react"
import { cn } from "@/shared/lib/utils"
import type { MapViewProps } from "./map-view"

export type { MapMarker } from "./map-view"

const MapView = lazy(() => import("./map-view"))

// A map with the design's expand (⤢) and zoom (+ / −) controls, pinning the given places.
// Used beside the chat, and by bookings for a trip. Everything on the map is also in the page
// as text, so the map is never the only place information appears.
export function MapPanel({
  label = "Map",
  className,
  ...props
}: MapViewProps & { label?: string; className?: string }) {
  return (
    <section aria-label={label} className={cn("relative overflow-hidden bg-muted", className)}>
      <Suspense
        fallback={
          <p className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">
            Loading map…
          </p>
        }
      >
        <MapView {...props} />
      </Suspense>
    </section>
  )
}

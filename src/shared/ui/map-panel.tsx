import { Expand01, Minimize01, Minus, Plus } from "@untitledui/icons"
import type { Map as MapLibreMap } from "maplibre-gl"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/shared/lib/utils"
import { Button } from "./button"

// The map from the Figma's split views (chat conversation, trip page): MapLibre GL with free
// OpenFreeMap tiles (no API key). MapLibre is large, so it's only downloaded when a map first
// shows. Swapping the map provider later only touches this file.
//
// A map is never the only place information appears: whatever it shows is also in the text
// beside it. Its own buttons (zoom, expand) are labelled and keyboard-operable.

const styleUrl = "https://tiles.openfreemap.org/styles/liberty"

export type MapPoint = { lng: number; lat: number; label: string }

type MapPanelProps = {
  /** Shown as dots, joined by a line in order. The map fits them all in view, or shows the
   * whole world when there are none yet. */
  points: MapPoint[]
  /** Shows the expand button. The parent decides what "expanded" means for its layout. */
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  className?: string
}

export function MapPanel({ points, expanded, onExpandedChange, className }: MapPanelProps) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<MapLibreMap | null>(null)
  const [failed, setFailed] = useState(false)
  // Points change identity on every render; redraw only when they really change.
  const pointsKey = JSON.stringify(points)

  useEffect(() => {
    const element = container.current
    const route: MapPoint[] = JSON.parse(pointsKey)
    if (!element) return
    let cancelled = false
    let resizeObserver: ResizeObserver | undefined

    async function load() {
      const [maplibre, worker] = await Promise.all([
        import("maplibre-gl"),
        // MapLibre runs its tile work in a separate worker file; tell it where Vite put it.
        import("maplibre-gl/dist/maplibre-gl-worker.mjs?url"),
        import("maplibre-gl/dist/maplibre-gl.css"),
      ])
      if (cancelled || !element) return
      maplibre.setWorkerUrl(worker.default)

      const bounds = new maplibre.LngLatBounds()
      for (const point of route) bounds.extend([point.lng, point.lat])

      const instance = new maplibre.Map({
        container: element,
        style: styleUrl,
        ...(route.length > 0
          ? { bounds, fitBoundsOptions: { padding: 64, maxZoom: 11 } }
          : { center: [0, 20], zoom: 1 }),
        attributionControl: { compact: true },
      })
      map.current = instance

      const primary = getComputedStyle(element).getPropertyValue("--color-primary-600").trim()
      instance.on("load", () => {
        if (route.length < 2) return
        instance.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: route.map((p) => [p.lng, p.lat]) },
          },
        })
        instance.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: { "line-color": primary, "line-width": 2, "line-dasharray": [2, 2] },
        })
      })

      for (const point of route) {
        const dot = document.createElement("div")
        dot.className = "size-3.5 rounded-full border-2 border-white bg-primary-600 shadow-sm"
        dot.title = point.label
        new maplibre.Marker({ element: dot }).setLngLat([point.lng, point.lat]).addTo(instance)
      }

      // Keep the map filling its box when the layout changes (sidebar, expand).
      resizeObserver = new ResizeObserver(() => instance.resize())
      resizeObserver.observe(element)
    }

    load().catch(() => !cancelled && setFailed(true))

    return () => {
      cancelled = true
      resizeObserver?.disconnect()
      map.current?.remove()
      map.current = null
    }
  }, [pointsKey])

  function zoom(direction: "in" | "out") {
    const animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (direction === "in") map.current?.zoomIn({ animate })
    else map.current?.zoomOut({ animate })
  }

  return (
    <div className={cn("relative isolate overflow-hidden bg-muted", className)}>
      {/* MapLibre names its own canvas "Map" (a region), so this box needs no label. */}
      <div ref={container} className="size-full" />

      {failed && (
        <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-muted-foreground text-sm">
          The map couldn't load. Everything on it is also listed beside it.
        </p>
      )}

      <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
        {onExpandedChange && (
          <Button
            variant="outline"
            size="icon"
            aria-label="Expand map"
            aria-pressed={expanded}
            onClick={() => onExpandedChange(!expanded)}
          >
            {expanded ? <Minimize01 /> : <Expand01 />}
          </Button>
        )}
        <div className="flex flex-col overflow-hidden rounded-lg border bg-background shadow-xs">
          <Button variant="ghost" size="icon" aria-label="Zoom in" onClick={() => zoom("in")}>
            <Plus />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Zoom out" onClick={() => zoom("out")}>
            <Minus />
          </Button>
        </div>
      </div>
    </div>
  )
}

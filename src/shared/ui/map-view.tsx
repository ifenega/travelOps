import { LngLatBounds, Map as MapLibreMap, Marker, setWorkerUrl } from "maplibre-gl"
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"
import "maplibre-gl/dist/maplibre-gl.css"
import { Expand01, Minimize01, Minus, Plus } from "@untitledui/icons"
import { useEffect, useRef, useState } from "react"
import { Button } from "./button"

// The map itself (MapLibre + OpenFreeMap tiles: open source, no API key). Loaded lazily by
// MapPanel, so this large library only downloads when a map is on screen.

const styleUrl = "https://tiles.openfreemap.org/styles/liberty"

// MapLibre draws tiles in a web worker. Vite's dependency pre-bundling breaks the worker's
// default path, so hand it a URL Vite builds (with the worker's own imports) in dev and production.
setWorkerUrl(workerUrl)

export type MapMarker = { id: string; label: string; lng: number; lat: number }

export type MapViewProps = {
  markers: MapMarker[]
  expanded?: boolean
  /** Shows the expand button (⤢) when given. */
  onExpandedChange?: (expanded: boolean) => void
}

const controlClassName = "bg-background shadow-sm hover:bg-muted dark:bg-gray-900"

export default function MapView({ markers, expanded = false, onExpandedChange }: MapViewProps) {
  const container = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<MapLibreMap | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!container.current) return
    let instance: MapLibreMap
    try {
      instance = new MapLibreMap({
        container: container.current,
        style: styleUrl,
        center: [10, 25],
        zoom: 1.5,
        attributionControl: { compact: true },
      })
    } catch {
      setFailed(true) // e.g. no WebGL on this device: the chat still works without the map
      return
    }
    setMap(instance)
    return () => instance.remove()
  }, [])

  // Pin the trip's places and fit them on screen.
  useEffect(() => {
    if (!map) return
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-primary-600")
      .trim() // CSS variable values can start with a space, which isn't a valid colour
    const pins = markers.map((place) => {
      const pin = new Marker({ color }).setLngLat([place.lng, place.lat]).addTo(map)
      pin.getElement().setAttribute("aria-label", place.label)
      pin.getElement().setAttribute("title", place.label)
      return pin
    })
    if (markers.length === 1) {
      map.jumpTo({ center: [markers[0].lng, markers[0].lat], zoom: 9 })
    } else if (markers.length > 1) {
      const bounds = new LngLatBounds()
      for (const place of markers) bounds.extend([place.lng, place.lat])
      map.fitBounds(bounds, { padding: 80, maxZoom: 9, animate: false })
    }
    return () => {
      for (const pin of pins) pin.remove()
    }
  }, [map, markers])

  // The container changes size when the map is expanded or collapsed.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `expanded` is the trigger, not a value used inside
  useEffect(() => {
    map?.resize()
  }, [map, expanded])

  if (failed) {
    return (
      <p className="absolute inset-0 grid place-items-center p-6 text-center text-muted-foreground text-sm">
        Map unavailable on this device.
      </p>
    )
  }

  return (
    <>
      {/* MapLibre makes its container position: relative, so the sizing lives on a wrapper. */}
      <div className="absolute inset-0">
        <div ref={container} className="size-full" />
      </div>
      <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
        {onExpandedChange && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Expand map"
            aria-pressed={expanded}
            onClick={() => onExpandedChange(!expanded)}
            className={controlClassName}
          >
            {expanded ? <Minimize01 /> : <Expand01 />}
          </Button>
        )}
        <div className="flex flex-col overflow-hidden rounded-md">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Zoom in"
            onClick={() => map?.zoomIn()}
            className={`rounded-none ${controlClassName}`}
          >
            <Plus />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Zoom out"
            onClick={() => map?.zoomOut()}
            className={`rounded-none ${controlClassName}`}
          >
            <Minus />
          </Button>
        </div>
      </div>
    </>
  )
}

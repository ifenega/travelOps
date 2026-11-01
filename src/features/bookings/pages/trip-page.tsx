import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router"
import {
  CalendarPlus01,
  ChevronLeft,
  DotsHorizontal,
  Edit05,
  Map01,
  Printer,
  Stars02,
  Trash01,
} from "@untitledui/icons"
import { useRef, useState } from "react"
import { useMediaQuery } from "@/shared/hooks/use-media-query"
import { cn } from "@/shared/lib/utils"
import { AlertDialog, AlertDialogContent } from "@/shared/ui/alert-dialog"
import { Banner } from "@/shared/ui/banner"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/shared/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { MapPanel, type MapPoint } from "@/shared/ui/map-panel"
import { Page } from "@/shared/ui/page"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { toast } from "@/shared/ui/toast"
import { TripNotFoundError } from "../api/errors"
import { Itinerary } from "../components/itinerary"
import { TripPhoto } from "../components/trip-photo"
import { useDeleteTrip, useTrip } from "../hooks/use-bookings"
import type { TripTab } from "../search-params"
import type { Trip } from "../types"
import { downloadIcs } from "../utils/calendar"
import { formatDateRange } from "../utils/format"

export function TripPage() {
  const { tripId } = useParams({ from: "/bookings/$tripId" })
  const trip = useTrip(tripId)
  const title = trip.data?.title ?? (trip.isPending ? "Loading trip…" : "Trip not found")
  // The map sits beside the trip on wide screens; on phones it opens full screen from a button.
  const isDesktop = useMediaQuery("(min-width: 64rem)")
  const [mapExpanded, setMapExpanded] = useState(false)
  const points = trip.data ? mapPoints(trip.data) : []

  return (
    <Page
      title={title}
      breadcrumbs={[
        { label: "Home", to: "/chat", icon: Stars02 },
        { label: "Bookings", to: "/bookings" },
        { label: title },
      ]}
      actions={!isDesktop && points.length > 0 && <MapButton points={points} />}
    >
      <div className="flex min-h-0 flex-1">
        <div
          className={cn(
            "w-full overflow-y-auto overscroll-contain p-4 sm:p-6 lg:w-lg lg:shrink-0 print:overflow-visible",
            mapExpanded && "lg:hidden",
          )}
        >
          <Link
            to="/bookings"
            className="inline-flex items-center gap-1 rounded-sm text-primary-700 text-sm hover:underline focus-visible:outline-2 focus-visible:outline-ring print:hidden dark:text-primary-300"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
            Back to bookings
          </Link>

          {trip.isSuccess ? (
            <TripDetails trip={trip.data} />
          ) : (
            <>
              <h1 className="mt-4 font-semibold text-2xl">{title}</h1>
              {trip.isError &&
                (trip.error instanceof TripNotFoundError ? (
                  <p className="mt-2 text-muted-foreground">
                    It may have been deleted, or the link is wrong.
                  </p>
                ) : (
                  <Banner variant="error" title="Couldn't load this trip" className="mt-4">
                    <p>Check your connection and try again.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => trip.refetch()}
                    >
                      Try again
                    </Button>
                  </Banner>
                ))}
            </>
          )}
        </div>
        {isDesktop && points.length > 0 && (
          <MapPanel
            points={points}
            expanded={mapExpanded}
            onExpandedChange={setMapExpanded}
            className="flex-1 border-l print:hidden"
          />
        )}
      </div>
    </Page>
  )
}

/** Each place the trip passes through, in order, for the map. */
function mapPoints(trip: Trip): MapPoint[] {
  const places = trip.bookings.flatMap((b) => [b.departure.place, b.arrival.place])
  return places
    .filter((place, index) => place.code !== places[index - 1]?.code)
    .map((place) => ({ lng: place.lng, lat: place.lat, label: `${place.city} (${place.code})` }))
}

function MapButton({ points }: { points: MapPoint[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Map01 aria-hidden="true" />
          Map
        </Button>
      </DialogTrigger>
      <DialogContent title="Map" size="fullscreen" className="p-0">
        <MapPanel points={points} className="size-full" />
      </DialogContent>
    </Dialog>
  )
}

function TripDetails({ trip }: { trip: Trip }) {
  const { tab } = useSearch({ from: "/bookings/$tripId" })
  const navigate = useNavigate({ from: "/bookings/$tripId" })

  const flights = trip.bookings.filter((b) => b.transport === "flight")
  const trains = trip.bookings.filter((b) => b.transport === "train")
  const tabs: { value: TripTab; label: string; bookings: Trip["bookings"] }[] = [
    { value: "itinerary", label: "Itinerary", bookings: trip.bookings },
    ...(flights.length > 0
      ? [{ value: "flights" as const, label: "Flights", bookings: flights }]
      : []),
    ...(trains.length > 0 ? [{ value: "trains" as const, label: "Trains", bookings: trains }] : []),
  ]
  // A link to a tab this trip doesn't have (e.g. ?tab=trains with no trains) shows the itinerary.
  const current = tabs.some((t) => t.value === tab) ? tab : "itinerary"

  return (
    <>
      <div className="mt-4 flex items-start gap-3">
        <TripPhoto src={trip.imageUrl} className="size-16 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-2xl">{trip.title}</h1>
          <p className="text-muted-foreground text-sm">
            <time dateTime={trip.startDate}>
              {formatDateRange(trip.startDate, trip.endDate, { weekday: true })}
            </time>
          </p>
          <p className="text-muted-foreground text-sm">{trip.destination}</p>
        </div>
        <TripMenu trip={trip} />
      </div>

      <Tabs
        value={current}
        onValueChange={(value) => navigate({ search: { tab: value as TripTab }, replace: true })}
        className="mt-5"
      >
        <TabsList aria-label="Show" className="print:hidden">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value} className="mt-5">
            <Itinerary tripId={trip.id} bookings={t.bookings} />
          </TabsContent>
        ))}
      </Tabs>
    </>
  )
}

function TripMenu({ trip }: { trip: Trip }) {
  const navigate = useNavigate()
  const deleteTrip = useDeleteTrip()
  const [confirming, setConfirming] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={menuButton}
            variant="ghost"
            size="icon"
            aria-label={`Manage ${trip.title}`}
            className="print:hidden"
          >
            <DotsHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Manage booking</DropdownMenuLabel>
          <DropdownMenuItem
            icon={Edit05}
            description="Makes changes to your trip"
            onSelect={() => navigate({ to: "/chat", search: { tripId: trip.id } })}
          >
            Edit trip
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={Printer}
            description="Print your trip itinerary"
            // Let the menu close first, so it isn't in the printout.
            onSelect={() => setTimeout(() => window.print(), 0)}
          >
            Print itinerary
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={CalendarPlus01}
            description="Add this trip to your calendar"
            onSelect={() => {
              downloadIcs(trip)
              toast.success("Calendar file downloaded", {
                description: "Open it to add the trip to your calendar.",
              })
            }}
          >
            Add to calendar
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={Trash01}
            variant="destructive"
            description="Remove trip from your list"
            onSelect={() => setConfirming(true)}
          >
            Delete trip
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent
          title={`Delete ${trip.title}?`}
          description="This removes it from your list. It doesn't cancel anything you've booked."
          confirmLabel="Delete"
          onConfirm={() => {
            deleteTrip.mutate(trip)
            navigate({ to: "/bookings" })
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            // After a delete the list page takes focus (its heading); otherwise back to ···.
            if (!deleteTrip.isIdle) return
            menuButton.current?.focus()
          }}
        />
      </AlertDialog>
    </>
  )
}

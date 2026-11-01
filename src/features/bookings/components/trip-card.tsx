import { Link, useNavigate } from "@tanstack/react-router"
import { DotsHorizontal, Edit05, Plane, Share06, Trash01, Users01 } from "@untitledui/icons"
import { useRef } from "react"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import type { Trip } from "../types"
import { formatDateRange, formatPrice, pluralize } from "../utils/format"
import { TripPhoto } from "./trip-photo"
import { TripStatusBadge } from "./trip-status-badge"

type TripCardProps = {
  trip: Trip
  /** The ··· button is passed along, so focus can go back to it when the dialog closes. */
  onShare: (trip: Trip, menuButton: HTMLButtonElement | null) => void
  onDelete: (trip: Trip, menuButton: HTMLButtonElement | null) => void
}

// One trip on the bookings list. The title is a link stretched over the whole card, and the ···
// button sits above it, so there's one link and one button and nothing interactive is nested.
export function TripCard({ trip, onShare, onDelete }: TripCardProps) {
  const navigate = useNavigate()
  const menuButton = useRef<HTMLButtonElement>(null)

  return (
    <article className="relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs transition-transform duration-150 ease-out has-[a:active]:scale-[0.99] motion-reduce:has-[a:active]:scale-100 hover:border-gray-300 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-ring has-[a:focus-visible]:outline-offset-2 dark:hover:border-gray-700">
      <TripPhoto src={trip.imageUrl} className="aspect-5/4" />

      <div className="flex flex-col gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="min-w-0 truncate font-medium text-sm">
            <Link
              to="/bookings/$tripId"
              params={{ tripId: trip.id }}
              data-trip-link
              className="outline-none after:absolute after:inset-0"
            >
              {trip.title}
            </Link>
          </h2>
          <TripStatusBadge status={trip.status} />
        </div>
        <p className="text-muted-foreground text-xs">
          <time dateTime={trip.startDate}>{formatDateRange(trip.startDate, trip.endDate)}</time>
          <span aria-hidden="true"> · </span>
          <span className="sr-only">, </span>
          {formatPrice(trip.price)}
        </p>
        <p className="mt-2 flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <Plane aria-hidden="true" className="size-4 text-muted-foreground" />
            <span aria-hidden="true">{trip.bookings.length}</span>
            <span className="sr-only">{pluralize(trip.bookings.length, "booking")},</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Users01 aria-hidden="true" className="size-4 text-muted-foreground" />
            <span aria-hidden="true">{trip.travellerCount}</span>
            <span className="sr-only">{pluralize(trip.travellerCount, "traveller")}</span>
          </span>
        </p>
      </div>

      <div className="absolute top-3 right-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              ref={menuButton}
              variant="overlay"
              size="icon"
              aria-label={`Manage ${trip.title}`}
            >
              <DotsHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Manage booking</DropdownMenuLabel>
            <DropdownMenuItem
              icon={Edit05}
              description="Makes changes to your booking"
              onSelect={() => navigate({ to: "/chat", search: { tripId: trip.id } })}
            >
              Edit booking
            </DropdownMenuItem>
            <DropdownMenuItem
              icon={Share06}
              description="Share this trip with people"
              onSelect={() => onShare(trip, menuButton.current)}
            >
              Share trip
            </DropdownMenuItem>
            <DropdownMenuItem
              icon={Trash01}
              variant="destructive"
              description="Remove booking from your list"
              onSelect={() => onDelete(trip, menuButton.current)}
            >
              Delete booking
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  )
}

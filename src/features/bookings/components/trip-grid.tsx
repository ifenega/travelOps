import { useRef, useState } from "react"
import { focusPageHeading } from "@/shared/lib/focus"
import { AlertDialog, AlertDialogContent } from "@/shared/ui/alert-dialog"
import { useDeleteTrip } from "../hooks/use-bookings"
import type { Trip } from "../types"
import { ShareTripDialog } from "./share-trip-dialog"
import { TripCard } from "./trip-card"

type OpenDialog = { kind: "share" | "delete"; trip: Trip; menuButton: HTMLButtonElement | null }

/**
 * The cards, plus one Share dialog and one Delete dialog for the whole grid (not one per card),
 * so a dialog never disappears mid-close when its card is deleted.
 */
export function TripGrid({ trips, shareableTrips }: { trips: Trip[]; shareableTrips: Trip[] }) {
  const [dialog, setDialog] = useState<OpenDialog | null>(null)
  // Kept apart from `dialog`, so the dialog still has its trip while it fades out.
  const [open, setOpen] = useState(false)
  const deleteTrip = useDeleteTrip()
  const grid = useRef<HTMLUListElement>(null)
  /** Set when a trip was deleted, so focus moves to its neighbour instead of its (gone) ··· button. */
  const deletedIndex = useRef<number | null>(null)

  function focusAfterDelete() {
    const index = deletedIndex.current ?? 0
    deletedIndex.current = null
    const links = grid.current?.querySelectorAll<HTMLElement>("[data-trip-link]") ?? []
    const next = links[Math.min(index, links.length - 1)]
    if (next) next.focus()
    else focusPageHeading()
  }

  return (
    <>
      <ul
        ref={grid}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {trips.map((trip) => (
          <li key={trip.id}>
            <TripCard
              trip={trip}
              onShare={(trip, menuButton) => {
                setDialog({ kind: "share", trip, menuButton })
                setOpen(true)
              }}
              onDelete={(trip, menuButton) => {
                setDialog({ kind: "delete", trip, menuButton })
                setOpen(true)
              }}
            />
          </li>
        ))}
      </ul>

      <ShareTripDialog
        open={open && dialog?.kind === "share"}
        onOpenChange={setOpen}
        trip={dialog?.kind === "share" ? dialog.trip : null}
        trips={shareableTrips}
        returnFocusTo={dialog?.menuButton ?? null}
      />

      <AlertDialog open={open && dialog?.kind === "delete"} onOpenChange={setOpen}>
        {dialog?.kind === "delete" && (
          <AlertDialogContent
            title={`Delete ${dialog.trip.title}?`}
            description="This removes it from your list. It doesn't cancel anything you've booked."
            confirmLabel="Delete"
            onConfirm={() => {
              deletedIndex.current = trips.findIndex((t) => t.id === dialog.trip.id)
              deleteTrip.mutate(dialog.trip)
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              // Wait a frame so the deleted card has left the grid.
              if (deletedIndex.current !== null) requestAnimationFrame(focusAfterDelete)
              else dialog.menuButton?.focus()
            }}
          />
        )}
      </AlertDialog>
    </>
  )
}

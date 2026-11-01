import type { RefObject } from "react"
import { Dialog, DialogContent } from "@/shared/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { checkoutService, seatPrice } from "../api/checkout-service"
import type { Booking } from "../types"
import { formatAmount } from "../utils/format"

// "Edit seats". The seat map isn't designed yet, so for now it's a seat picker per passenger
// and flight. Seats taken by another passenger on the same flight can't be picked twice.

const rows = [9, 10, 11, 12]
const allSeats = rows.flatMap((row) => [..."ABCDEF"].map((letter) => `${row}${letter}`))
const noSeat = "none"

export function SeatsDialog({
  booking,
  open,
  onOpenChange,
  returnFocusTo,
}: {
  booking: Booking
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The button that opened it, which gets focus back when it closes. */
  returnFocusTo: RefObject<HTMLButtonElement | null>
}) {
  const flights = [...booking.departing.flight.segments, ...booking.returning.flight.segments]
  const seated = booking.passengers.filter((passenger) => passenger.type !== "infant")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Edit seats"
        description={`Each seat costs ${formatAmount(seatPrice)} per flight.`}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          returnFocusTo.current?.focus()
        }}
      >
        <div className="flex flex-col gap-5">
          {seated.map((passenger, index) => {
            const name = passenger.details
              ? `${passenger.details.firstName} ${passenger.details.lastName}`
              : `Passenger ${index + 1}`
            return (
              <fieldset key={passenger.id} className="flex flex-col gap-2">
                <legend className="mb-1 font-medium text-sm">{name}</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {flights.map((segment, flightIndex) => {
                    const flight = flightIndex + 1
                    const label = `Flight ${flight}, ${segment.from.code} to ${segment.to.code}`
                    const current = booking.seats[passenger.id]?.find((s) => s.flight === flight)
                    const taken = new Set(
                      Object.entries(booking.seats)
                        .filter(([id]) => id !== passenger.id)
                        .flatMap(([, seats]) => seats.filter((s) => s.flight === flight))
                        .map((s) => s.seat),
                    )
                    return (
                      <div
                        key={`${segment.flightNumber}-${segment.from.code}`}
                        className="flex flex-col gap-1"
                      >
                        <span aria-hidden="true" className="text-muted-foreground text-xs">
                          Flight {flight} · {segment.from.code}–{segment.to.code}
                        </span>
                        <Select
                          value={current?.seat ?? noSeat}
                          onValueChange={(seat) =>
                            checkoutService.setSeat(
                              booking.id,
                              passenger.id,
                              flight,
                              seat === noSeat ? undefined : seat,
                            )
                          }
                        >
                          <SelectTrigger
                            variant="outline"
                            aria-label={`${name}: ${label}`}
                            className="w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent aria-label={`${name}: ${label}`}>
                            <SelectItem value={noSeat}>No seat</SelectItem>
                            {allSeats.map((seat) => (
                              <SelectItem key={seat} value={seat} disabled={taken.has(seat)}>
                                {seat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  })}
                </div>
              </fieldset>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

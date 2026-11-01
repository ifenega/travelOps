import { useSyncExternalStore } from "react"
import { checkoutService } from "../api/checkout-service"

/** The booking, kept up to date as passengers, seats and payment change. */
export function useBooking(bookingId: string) {
  return useSyncExternalStore(checkoutService.subscribe, () =>
    checkoutService.getBooking(bookingId),
  )
}

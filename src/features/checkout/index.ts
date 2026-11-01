// The checkout feature's public API. Other features and the app import from here only.
import { checkoutService } from "./api/checkout-service"

export { checkoutService, mockCheckoutControls } from "./api/checkout-service"
export { ExtrasPage } from "./pages/extras-page"
export { ItineraryPage } from "./pages/itinerary-page"
export { PassengersPage } from "./pages/passengers-page"
export { PaymentPage } from "./pages/payment-page"

/** For the router: unknown bookings show the 404 page. */
export const bookingExists = (bookingId: string) =>
  checkoutService.getBooking(bookingId) !== undefined

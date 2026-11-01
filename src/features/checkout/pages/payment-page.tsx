import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { CreditCardX, Trophy01 } from "@untitledui/icons"
import type { ComponentType, ReactNode } from "react"
import { useEffect } from "react"
import { focusPageHeading } from "@/shared/lib/focus"
import { Button } from "@/shared/ui/button"
import { checkoutService } from "../api/checkout-service"
import { CheckoutShell, SectionHeading } from "../components/checkout-shell"
import { LoadingScreen } from "../components/loading-screen"
import { useBooking } from "../hooks/use-booking"

// Checkout's last step (design screens 23, 27–28). Paying happens in Paystack's own popup (not
// built yet; the mock stands in), then the backend verifies it: "We're verifying your payment…",
// then failed (with Retry) or successful.

const dateTime = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" })

export function PaymentPage({ bookingId }: { bookingId: string }) {
  const booking = useBooking(bookingId)
  const payment = useQuery({
    queryKey: ["checkout", "payment", bookingId],
    queryFn: () => checkoutService.pay(bookingId),
    // Paying is never retried or refetched behind the user's back; only "Retry payment" does.
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const settled = !payment.isFetching

  // Screen readers hear the result: focus its heading once it's on screen.
  useEffect(() => {
    if (settled) focusPageHeading()
  }, [settled])

  if (!booking) return null

  let content: ReactNode
  if (payment.isFetching) {
    content = <LoadingScreen message="We're verifying your payment…" />
  } else if (payment.data?.ok && booking.payment) {
    const { reference, paidAt } = booking.payment
    content = (
      <Result icon={Trophy01} title="Purchase successful">
        <div className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-muted p-5 text-center">
          <div>
            <p className="text-lg">Your travel ticket has been confirmed and sent to your email.</p>
            <p className="text-muted-foreground text-sm">Keep it ready for entry at the airport.</p>
          </div>
          <dl className="grid grid-cols-2 gap-3 border-y py-3 text-left text-sm">
            <div>
              <dt className="font-medium">Booking ID</dt>
              <dd className="text-muted-foreground">{reference}</dd>
            </div>
            <div>
              <dt className="font-medium">Tickets</dt>
              <dd className="text-muted-foreground">{booking.passengers.length}</dd>
            </div>
            <div className="col-span-2">
              <dt className="font-medium">Date</dt>
              <dd className="text-muted-foreground">{dateTime.format(paidAt)}</dd>
            </div>
          </dl>
          <NextStep>Download your ticket or view it in your account.</NextStep>
        </div>
        <Actions>
          <Button asChild variant="outline">
            <Link to="/chat">Back to home</Link>
          </Button>
          <Button asChild>
            <Link to="/bookings">View booking</Link>
          </Button>
        </Actions>
      </Result>
    )
  } else {
    const reason =
      payment.data && !payment.data.ok
        ? payment.data.reason
        : "We couldn't reach the payment service."
    content = (
      <Result icon={CreditCardX} title="Purchase failed">
        <div>
          <p className="text-lg">Your ticket purchase could not be completed.</p>
          <p className="text-muted-foreground text-sm">{reason}</p>
        </div>
        <NextStep>
          Check your payment details and try again. Contact your bank if the issue persists.
        </NextStep>
        <Actions>
          <Button asChild variant="outline">
            <Link to="/support">Contact support</Link>
          </Button>
          <Button onClick={() => payment.refetch()}>Retry payment</Button>
        </Actions>
      </Result>
    )
  }

  return <CheckoutShell title="Payment">{content}</CheckoutShell>
}

function Result({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-10 text-center">
      {/* Stand-in until the card reader and trophy illustrations arrive. */}
      <span className="grid size-20 place-items-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-600/15">
        <Icon aria-hidden="true" className="size-10" />
      </span>
      <SectionHeading as="h1">{title}</SectionHeading>
      {children}
    </div>
  )
}

function NextStep({ children }: { children: ReactNode }) {
  return (
    <div className="text-sm">
      <h2 className="mb-1 font-medium text-primary-700 dark:text-primary-300">Next step</h2>
      <p className="text-muted-foreground">{children}</p>
    </div>
  )
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-center gap-3">{children}</div>
}

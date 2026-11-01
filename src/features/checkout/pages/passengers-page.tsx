import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Edit05, User01 } from "@untitledui/icons"
import { useId, useState } from "react"
import { useForm } from "react-hook-form"
import { CheckCircleSolid } from "@/shared/icons/status-icons"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/accordion"
import { Avatar } from "@/shared/ui/avatar"
import { Banner } from "@/shared/ui/banner"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { checkoutService } from "../api/checkout-service"
import {
  BackLink,
  CheckoutColumns,
  CheckoutShell,
  SectionHeading,
} from "../components/checkout-shell"
import { ContactFields, contactSchema } from "../components/contact-form"
import { LoadingScreen } from "../components/loading-screen"
import { OverviewCard } from "../components/overview-card"
import { PassengerForm } from "../components/passenger-form"
import { useBooking } from "../hooks/use-booking"
import type { Booking, Contact, Passenger } from "../types"
import { typeLabels } from "../utils/passenger"

// Checkout step 1 (design screens 20–22): each passenger's details, contact details and the
// terms. Proceed checks everything and takes you to the first thing that needs fixing.

export function PassengersPage({ bookingId }: { bookingId: string }) {
  const booking = useBooking(bookingId)
  const options = useQuery({
    queryKey: ["checkout", "passenger-options", bookingId],
    queryFn: () => checkoutService.passengerOptions(),
  })
  if (!booking) return null // the route shows the 404 page for unknown bookings

  return (
    <CheckoutShell title="Passengers" step="passengers" chatId={booking.chatId}>
      {options.isPending ? (
        <LoadingScreen message="Pulling up passengers options." />
      ) : options.isError ? (
        <Banner variant="error" title="We couldn't load the passenger options">
          <Button variant="outline" size="sm" className="mt-2" onClick={() => options.refetch()}>
            Try again
          </Button>
        </Banner>
      ) : (
        <PassengersForm booking={booking} titles={options.data.titles} />
      )}
    </CheckoutShell>
  )
}

function PassengersForm({ booking, titles }: { booking: Booking; titles: string[] }) {
  const navigate = useNavigate()
  const termsId = useId()
  const [showNote, setShowNote] = useState(true)
  const [open, setOpen] = useState(booking.passengers.find((p) => !p.details)?.id ?? "")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [triedToProceed, setTriedToProceed] = useState(false)
  const contactForm = useForm<Contact>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: booking.contact ?? { email: "", phone: "", address: "" },
    // proceed() decides where focus goes: passengers come before the contact details.
    shouldFocusError: false,
  })
  const travelDate = booking.search.departDate
  const allConfirmed = booking.passengers.every((passenger) => passenger.details)
  const contactValid = contactForm.formState.isValid
  const ready = allConfirmed && contactValid && termsAccepted
  // Listed after a first try at Proceed, and kept current as each one gets fixed.
  const problems = [
    !allConfirmed && "Confirm each passenger's details.",
    !contactValid && "Check the contact details.",
    !termsAccepted && "Accept the conditions of purchase.",
  ].filter((problem): problem is string => !!problem)

  const triggerId = (passenger: Passenger) => `passenger-${passenger.id}`
  const focusLater = (id: string) =>
    requestAnimationFrame(() => document.getElementById(id)?.focus())

  function confirm(passenger: Passenger, details: Passenger["details"]) {
    if (!details) return
    checkoutService.savePassenger(booking.id, passenger.id, details)
    // Open the next passenger still to do, and move focus to its header.
    const next = booking.passengers.find((p) => p.id !== passenger.id && !p.details)
    setOpen(next?.id ?? "")
    focusLater(triggerId(next ?? passenger))
  }

  async function proceed() {
    // Submitting (rather than just validating) makes errors update as you type from now on, so
    // they don't vanish on blur and shift the page under the next tap.
    let contactOk = false
    await contactForm.handleSubmit(() => {
      contactOk = true
    })()
    setTriedToProceed(true)

    // Take focus to the first thing to fix, in page order.
    const unconfirmed = booking.passengers.find((passenger) => !passenger.details)
    if (unconfirmed) {
      setOpen(unconfirmed.id)
      focusLater(triggerId(unconfirmed))
    } else if (!contactOk) {
      const field = (["email", "phone", "address"] as const).find(
        (name) => contactForm.formState.errors[name],
      )
      if (field) contactForm.setFocus(field)
    } else if (!termsAccepted) {
      document.getElementById(termsId)?.focus()
    }
    if (unconfirmed || !contactOk || !termsAccepted) return

    checkoutService.saveContact(booking.id, contactForm.getValues())
    navigate({ to: "/checkout/$bookingId/extras", params: { bookingId: booking.id } })
  }

  return (
    <>
      <BackLink
        to="/chat/$chatId"
        params={{ chatId: booking.chatId }}
        search={{ view: "results", leg: "return", departing: booking.departing.fare.id }}
      >
        Flight selection
      </BackLink>
      <CheckoutColumns aside={<OverviewCard booking={booking} />}>
        <section className="flex flex-col gap-4">
          <SectionHeading as="h1">Passengers</SectionHeading>
          {showNote && (
            <Banner
              variant="neutral"
              title="Make sure your details exactly match your legal name as it appears on the identity document you'll present at the airport."
              onDismiss={() => setShowNote(false)}
            />
          )}
          <Accordion
            type="single"
            collapsible
            value={open}
            onValueChange={setOpen}
            className="border-t"
          >
            {booking.passengers.map((passenger, index) => (
              <AccordionItem key={passenger.id} value={passenger.id}>
                <AccordionTrigger
                  id={triggerId(passenger)}
                  headingLevel="h2"
                  icon={
                    passenger.details && (
                      <span className="ml-auto flex items-center gap-3">
                        <CheckCircleSolid aria-hidden="true" className="size-5 text-success-600" />
                        <Edit05 aria-hidden="true" className="size-4 text-muted-foreground" />
                      </span>
                    )
                  }
                >
                  <PassengerHeader passenger={passenger} number={index + 1} />
                </AccordionTrigger>
                <AccordionContent className="rounded-b-lg bg-muted/60 px-3 pt-3">
                  <PassengerForm
                    passenger={passenger}
                    titles={titles}
                    travelDate={travelDate}
                    onConfirm={(details) => confirm(passenger, details)}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section aria-labelledby="contact-heading" className="flex flex-col gap-3">
          <SectionHeading id="contact-heading">Contact details</SectionHeading>
          <p className="text-muted-foreground text-sm">
            The person who will receive the booking confirmation and trip details.
          </p>
          <div className="border-t pt-4">
            <ContactFields form={contactForm} />
          </div>
        </section>

        <section aria-labelledby="terms-heading" className="flex flex-col gap-3 border-t pt-4">
          <h2 id="terms-heading" className="font-medium text-sm">
            To finish this purchase you must accept the following conditions
          </h2>
          <div className="flex items-start gap-3 text-sm">
            <Checkbox
              id={termsId}
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              className="mt-0.5"
            />
            <label htmlFor={termsId} className="text-muted-foreground">
              I accept the general terms and conditions of purchase and confirm that I have read the{" "}
              <a href="/legal" className="text-primary-700 underline dark:text-primary-300">
                Legal terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-primary-700 underline dark:text-primary-300">
                Privacy Policy
              </a>
              .
            </label>
          </div>
        </section>

        <div className="flex flex-col gap-3">
          {triedToProceed && problems.length > 0 && (
            <Banner variant="error" title="Before you continue" role="alert">
              <ul className="list-disc pl-4">
                {problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            </Banner>
          )}
          {/* Quieter until everything's done (the design fades it), but always works: pressing
              it early lists what's missing and moves focus there. */}
          <Button
            size="lg"
            variant={ready ? "primary" : "soft"}
            className="w-full"
            onClick={proceed}
          >
            Proceed
          </Button>
        </div>
      </CheckoutColumns>
    </>
  )
}

/** "Passenger 2 · Child", or once confirmed, their initials, name and type. */
function PassengerHeader({ passenger, number }: { passenger: Passenger; number: number }) {
  const { details } = passenger
  const name = details ? `${details.firstName} ${details.lastName}` : `Passenger ${number}`
  return (
    <span className="flex min-w-0 items-center gap-3">
      {details ? (
        <Avatar name={name} className="size-9" />
      ) : (
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted">
          <User01 aria-hidden="true" className="size-4" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate font-medium">{name}</span>
        <span className="block text-muted-foreground text-xs">
          {typeLabels[passenger.type]}
          {details && <span className="sr-only">, confirmed</span>}
        </span>
      </span>
    </span>
  )
}

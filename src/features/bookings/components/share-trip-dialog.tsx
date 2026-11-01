import { Plane, Train } from "@untitledui/icons"
import { useId, useState } from "react"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent } from "@/shared/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/ui/select"
import { Switch } from "@/shared/ui/switch"
import { toast } from "@/shared/ui/toast"
import {
  useSetShareLinkEnabled,
  useShareByEmail,
  useShareLink,
  useTeamMembers,
} from "../hooks/use-bookings"
import type { TeamMember, Trip } from "../types"
import { formatRoute, pluralize } from "../utils/format"
import { RecipientPicker } from "./recipient-picker"

type ShareTripDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The trip to share. Stays set while the dialog fades out. */
  trip: Trip | null
  /** The trips the picker offers. */
  trips: Trip[]
  /** Where focus goes when it closes (it opens from a menu, so Radix can't work this out). */
  returnFocusTo: HTMLElement | null
}

export function ShareTripDialog({
  open,
  onOpenChange,
  trip,
  trips,
  returnFocusTo,
}: ShareTripDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trip && (
        <DialogContent
          title="Share trip"
          description="Share this trip with people, team members etc."
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            returnFocusTo?.focus()
          }}
        >
          {/* Keyed, so it starts fresh for each trip. */}
          <ShareTripForm key={trip.id} initialTrip={trip} trips={trips} />
        </DialogContent>
      )}
    </Dialog>
  )
}

function ShareTripForm({ initialTrip, trips }: { initialTrip: Trip; trips: Trip[] }) {
  const [tripId, setTripId] = useState(initialTrip.id)
  const trip = trips.find((t) => t.id === tripId) ?? initialTrip

  return (
    <div className="flex flex-col gap-5">
      <LinkSharing trip={trip} trips={trips} onTripChange={setTripId} />
      <EmailSharing trip={trip} />
    </div>
  )
}

/** A setting with its label and help text on the left and a switch on the right. */
function SwitchRow({
  label,
  help,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string
  help: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="text-sm">
        <p id={`${id}-label`} className="font-medium">
          {label}
        </p>
        <p id={`${id}-help`} className="text-muted-foreground">
          {help}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-help`}
        className="mt-0.5"
      />
    </div>
  )
}

function LinkSharing({
  trip,
  trips,
  onTripChange,
}: {
  trip: Trip
  trips: Trip[]
  onTripChange: (id: string) => void
}) {
  const link = useShareLink(trip.id)
  const setEnabled = useSetShareLinkEnabled(trip.id)
  const enabled = Boolean(link.data)

  async function copy() {
    if (!link.data) return
    try {
      await navigator.clipboard.writeText(link.data)
      toast.success("Link copied")
    } catch {
      toast.error("Couldn't copy the link", { description: "Select the link and copy it instead." })
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <SwitchRow
        label="Get a link"
        help="Share trip dates and services, but hide traveller names and prices."
        checked={enabled}
        onCheckedChange={(on) => setEnabled.mutate(on)}
        disabled={link.isPending || setEnabled.isPending}
      />
      {enabled && link.data && (
        <>
          <Select value={trip.id} onValueChange={onTripChange}>
            <SelectTrigger variant="outline" aria-label="Trip to share" className="w-full py-2">
              <TripOption trip={trip} />
            </SelectTrigger>
            <SelectContent aria-label="Trip to share">
              {trips.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <TripOption trip={t} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 rounded-lg border p-0.5 pl-0 shadow-xs">
            <input
              readOnly
              value={link.data}
              aria-label="Share link"
              onFocus={(event) => event.currentTarget.select()}
              className="min-w-0 flex-1 truncate rounded-l-lg bg-transparent px-3 py-1.5 text-base outline-none focus-visible:outline-2 focus-visible:outline-ring md:text-sm"
            />
            <Button variant="ghost" size="sm" onClick={copy}>
              Copy
            </Button>
          </div>
        </>
      )}
    </section>
  )
}

/** "✈ United States trip / One way LOS - PHL" */
function TripOption({ trip }: { trip: Trip }) {
  const Icon = trip.bookings[0]?.transport === "train" ? Train : Plane
  return (
    <span className="flex items-center gap-3">
      <Icon aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
      <span className="min-w-0">
        <span className="block truncate text-sm">{trip.title}</span>
        <span className="block truncate text-muted-foreground text-xs">{formatRoute(trip)}</span>
      </span>
    </span>
  )
}

function EmailSharing({ trip }: { trip: Trip }) {
  const [enabled, setEnabled] = useState(false)
  const [recipients, setRecipients] = useState<TeamMember[]>([])
  const members = useTeamMembers()
  const share = useShareByEmail(trip.id)

  function send() {
    share.mutate(
      recipients.map((r) => r.id),
      {
        onSuccess: () => {
          toast.success(`Trip shared with ${pluralize(recipients.length, "person", "people")}`)
          setRecipients([])
        },
      },
    )
  }

  return (
    <section className="flex flex-col gap-3">
      <SwitchRow
        label="Send via email"
        help="Share the full trip details and travellers. We won't send any prices, confirmation numbers, or tickets."
        checked={enabled}
        onCheckedChange={setEnabled}
      />
      {enabled && (
        <div className="flex flex-col gap-3">
          <RecipientPicker
            members={members.data ?? []}
            selected={recipients}
            onChange={setRecipients}
          />
          <Button
            className="self-end"
            disabled={recipients.length === 0 || share.isPending}
            onClick={send}
          >
            {share.isPending ? "Sending…" : "Send"}
          </Button>
        </div>
      )}
    </section>
  )
}

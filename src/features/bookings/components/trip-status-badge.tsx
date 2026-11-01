import { Badge } from "@/shared/ui/badge"
import type { Booking, TripStatus } from "../types"

const statuses = {
  draft: { label: "Draft", variant: "neutral" },
  pending: { label: "Pending", variant: "warning" },
  booked: { label: "Booked", variant: "success" },
  paid: { label: "Paid", variant: "success" },
} as const

export function statusLabel(status: TripStatus) {
  return statuses[status].label
}

/** "Draft" (grey), "Pending" (amber), "Booked" / "Paid" (green). The word is always shown. */
export function TripStatusBadge({ status }: { status: TripStatus | Booking["status"] }) {
  const { label, variant } = statuses[status]
  return (
    <Badge size="sm" variant={variant} className="shrink-0">
      {label}
    </Badge>
  )
}

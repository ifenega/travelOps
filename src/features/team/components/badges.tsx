import { Badge } from "@/shared/ui/badge"
import type { MemberStatus, Policy } from "../types"

const statuses = {
  active: { label: "Active", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  deactivated: { label: "Deactivated", variant: "error" },
} as const

/** "Active" (green), "Pending" (amber), "Deactivated" (red). The word is always shown. */
export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  const { label, variant } = statuses[status]
  return (
    <Badge size="sm" variant={variant}>
      {label}
    </Badge>
  )
}

/** The default policy is grey; others are blue, as in the design. */
export function PolicyBadge({ policy }: { policy: Policy | undefined }) {
  if (!policy) return <span className="text-muted-foreground">No policy</span>
  return (
    <Badge size="sm" variant={policy.isDefault ? "neutral" : "info"}>
      {policy.name}
    </Badge>
  )
}

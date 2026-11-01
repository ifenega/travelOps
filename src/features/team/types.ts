import { z } from "zod"

// The shapes the team service returns. The Zod schemas are the source of truth: the mock data is
// checked against them, and the real API will be too.

/** The app areas a role can be given access to, in the order the permissions grid lists them. */
export const features = [
  { id: "chat", label: "Chat" },
  { id: "bookings", label: "Bookings" },
  { id: "expenses", label: "Expenses" },
  { id: "wallet", label: "Wallet" },
  { id: "policies", label: "Policies" },
  { id: "reports", label: "Reports" },
  { id: "members", label: "Invite members" },
] as const

export type FeatureId = (typeof features)[number]["id"]

export const accessSchema = z.object({ read: z.boolean(), write: z.boolean() })
export type Access = z.infer<typeof accessSchema>

export const permissionsSchema = z.record(
  z.enum(features.map((f) => f.id) as [FeatureId, ...FeatureId[]]),
  accessSchema,
)
export type Permissions = Record<FeatureId, Access>

export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  /** Only "active" exists in the designs so far. */
  status: z.enum(["active"]),
  permissions: permissionsSchema,
})
export type Role = z.infer<typeof roleSchema> & { permissions: Permissions }

/** A role with how many members have it, as the roles table shows. */
export type RoleWithCount = Role & { memberCount: number }

export const policySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  /** New members get this one unless the inviter picks another. */
  isDefault: z.boolean(),
})
export type Policy = z.infer<typeof policySchema>

export const memberStatusSchema = z.enum(["active", "pending", "deactivated"])
export type MemberStatus = z.infer<typeof memberStatusSchema>

export const genderSchema = z.enum(["female", "male", "unspecified"])
export type Gender = z.infer<typeof genderSchema>

export const memberSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  avatarUrl: z.string().optional(),
  /** "YYYY-MM-DD" */
  dateAdded: z.iso.date(),
  status: memberStatusSchema,
  roleId: z.string(),
  policyId: z.string(),
  phone: z.string().optional(),
  gender: genderSchema.optional(),
  /** Two-letter country code, e.g. "NG". */
  country: z.string().length(2).optional(),
})
export type Member = z.infer<typeof memberSchema>

export type ImportJob = {
  id: string
  fileName: string
  fileSize: number
  /** Rows imported so far, of `total`. */
  done: number
  total: number
  status: "running" | "done" | "cancelled"
}

export type ExportFormat = "csv" | "xls"

export type ExportRequest = {
  /** Members added on or after this day, if set. */
  from?: Date
  /** …and on or before this day, if set. */
  to?: Date
  format: ExportFormat
  /** Also email the export here. */
  emailTo?: string
  /** Also email it to the signed-in user. */
  copyToMe: boolean
}

export type ExportFile = { fileName: string; mimeType: string; content: string }

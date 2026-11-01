import { z } from "zod"
import {
  type Member,
  memberSchema,
  type Permissions,
  type Policy,
  policySchema,
  type Role,
  roleSchema,
} from "../types"

// The team for the mock service, based on uiscreenshot/members and roles. The designs repeat one
// placeholder person and one role description; these are varied so the screens can be checked.

function access(read: boolean, write: boolean) {
  return { read, write }
}

const everything: Permissions = {
  chat: access(true, true),
  bookings: access(true, true),
  expenses: access(true, true),
  wallet: access(true, true),
  policies: access(true, true),
  reports: access(true, true),
  members: access(true, true),
}

const roles: Role[] = [
  {
    id: "admin",
    name: "Administrator",
    description: "Can change workspace settings and invite new members to the workspace.",
    status: "active",
    permissions: everything,
  },
  {
    id: "finance",
    name: "Finance analyst",
    description: "Can see spending, approve expenses and run reports.",
    status: "active",
    permissions: {
      chat: access(true, false),
      bookings: access(true, false),
      expenses: access(true, true),
      wallet: access(true, true),
      policies: access(true, false),
      reports: access(true, true),
      members: access(false, false),
    },
  },
  {
    id: "developer",
    name: "Developer",
    description: "Can change developer settings and invite new members.",
    status: "active",
    permissions: {
      chat: access(true, true),
      bookings: access(true, true),
      expenses: access(true, false),
      wallet: access(false, false),
      policies: access(false, false),
      reports: access(false, false),
      members: access(true, true),
    },
  },
  {
    id: "policy",
    name: "Policy maker",
    description: "Can write travel and spend policies and see who they apply to.",
    status: "active",
    permissions: {
      chat: access(true, false),
      bookings: access(true, false),
      expenses: access(true, false),
      wallet: access(false, false),
      policies: access(true, true),
      reports: access(true, false),
      members: access(true, false),
    },
  },
  {
    id: "traveller",
    name: "Traveller",
    description: "Can plan and book their own trips and submit expenses.",
    status: "active",
    permissions: {
      chat: access(true, true),
      bookings: access(true, true),
      expenses: access(true, true),
      wallet: access(false, false),
      policies: access(false, false),
      reports: access(false, false),
      members: access(false, false),
    },
  },
]

const policies: Policy[] = [
  {
    id: "minimum",
    name: "Minimum spend policy",
    description: "Applies to all D level members",
    isDefault: true,
  },
  {
    id: "high",
    name: "High spend policy",
    description: "Applies to all C level members",
    isDefault: false,
  },
]

const people: [string, string, Member["status"], string, string][] = [
  ["Timilehin", "Folagbade", "active", "admin", "high"],
  ["Ifeoluwa", "Olorunnegan", "pending", "finance", "minimum"],
  ["Ada", "Nwosu", "deactivated", "developer", "minimum"],
  ["Sam", "Okafor", "active", "finance", "minimum"],
  ["Chiamaka", "Eze", "active", "policy", "minimum"],
  ["Tunde", "Bakare", "active", "admin", "high"],
  ["Ngozi", "Adeyemi", "active", "traveller", "minimum"],
  ["Kemi", "Oladipo", "pending", "traveller", "minimum"],
  ["Emeka", "Obi", "active", "developer", "minimum"],
  ["Funmi", "Ajayi", "active", "traveller", "minimum"],
  ["Musa", "Ibrahim", "active", "traveller", "high"],
  ["Zainab", "Bello", "active", "finance", "minimum"],
  ["Daniel", "Mensah", "pending", "developer", "minimum"],
  ["Grace", "Owusu", "active", "traveller", "minimum"],
]

const members: Member[] = people.map(([firstName, lastName, status, roleId, policyId], index) => ({
  id: `member-${index + 1}`,
  firstName,
  lastName,
  email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
  // Spread over the first half of 2026, newest last.
  dateAdded: `2026-0${1 + Math.floor(index / 3)}-${String(1 + ((index * 7) % 27)).padStart(2, "0")}`,
  status,
  roleId,
  policyId,
  country: "NG",
  ...(index === 1 ? { phone: "+234 90 761 751 57", gender: "male" as const } : {}),
}))

/** The signed-in user, for "Send a copy to me". */
export const currentUserEmail = "timilehin.folagbade@example.com"

// Checked once on load, so a typo in the mock data fails loudly instead of rendering oddly.
export const seedRoles = z.array(roleSchema).parse(roles) as Role[]
export const seedPolicies = z.array(policySchema).parse(policies)
export const seedMembers = z.array(memberSchema).parse(members)

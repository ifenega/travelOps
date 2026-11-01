import type { ImportJob, Member, Role } from "../types"
import { countCsvRows, membersCsv } from "../utils/csv"
import { isValidEmail } from "../utils/emails"
import { AlreadyMemberError, RoleInUseError } from "./errors"
import { currentUserEmail, seedMembers, seedPolicies, seedRoles } from "./mock-data"
import type { TeamService } from "./team-service"

// An in-memory stand-in for the team API. Changes last until the page reloads.

/** Lets stories show loading and error states. */
export const mockControls = {
  /** Milliseconds each call takes. */
  delay: 300,
  /** Milliseconds between imported rows. */
  importStepDelay: 400,
  /** When true, every call fails, as if the server were down. */
  fail: false,
  /** Puts the data back as it started (stories call this so they don't affect each other). */
  reset() {
    members = structuredClone(seedMembers)
    roles = structuredClone(seedRoles)
    stopImport()
    importJob = null
    this.delay = 300
    this.importStepDelay = 400
    this.fail = false
  },
}

let members: Member[] = structuredClone(seedMembers)
let roles: Role[] = structuredClone(seedRoles)
let importJob: ImportJob | null = null
let importTimer: ReturnType<typeof setInterval> | undefined

/** Waits like a network call, then returns a copy so callers can't change the "server" data. */
async function respond<T>(getValue: () => T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, mockControls.delay))
  if (mockControls.fail) throw new Error("The server didn't respond")
  return structuredClone(getValue())
}

function findMember(id: string) {
  const member = members.find((m) => m.id === id)
  if (!member) throw new Error(`No member with id "${id}"`)
  return member
}

function findRole(id: string) {
  const role = roles.find((r) => r.id === id)
  if (!role) throw new Error(`No role with id "${id}"`)
  return role
}

function today() {
  return new Date().toLocaleDateString("en-CA")
}

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

function stopImport() {
  clearInterval(importTimer)
  importTimer = undefined
}

/**
 * Members from a template-shaped CSV (First name, Last name, Email, Role, Policy). A simple
 * comma split is enough for the mock; the real import happens on the server.
 */
function membersFromCsv(text: string): Member[] {
  const defaultPolicy = seedPolicies.find((p) => p.isDefault)?.id ?? ""
  return text
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(",").map((cell) => cell.trim()))
    .filter(([, , email]) => email && isValidEmail(email))
    .map(([firstName = "", lastName = "", email = "", roleName = "", policyName = ""]) => ({
      id: newId("member"),
      firstName,
      lastName,
      email,
      dateAdded: today(),
      status: "pending",
      roleId: roles.find((r) => r.name === roleName)?.id ?? "traveller",
      policyId: seedPolicies.find((p) => p.name === policyName)?.id ?? defaultPolicy,
    }))
}

export const mockTeamService: TeamService = {
  listMembers: () => respond(() => members),

  inviteMembers: ({ emails, policyId, roleId }) =>
    respond(() => {
      const taken = emails.filter((email) =>
        members.some((m) => m.email.toLowerCase() === email.toLowerCase()),
      )
      if (taken.length > 0) throw new AlreadyMemberError(taken)
      for (const email of emails) {
        const [name = ""] = email.split("@")
        members.push({
          id: newId("member"),
          firstName: name,
          lastName: "",
          email,
          dateAdded: today(),
          status: "pending",
          roleId,
          policyId,
        })
      }
    }),

  updateMember: (id, changes) =>
    respond(() => {
      const member = findMember(id)
      Object.assign(member, changes)
      return member
    }),

  changeRole: (memberId, roleId) =>
    respond(() => {
      findRole(roleId)
      findMember(memberId).roleId = roleId
    }),

  deleteMember: (id) =>
    respond(() => {
      findMember(id)
      members = members.filter((m) => m.id !== id)
    }),

  resendInvite: (id) => respond(() => void findMember(id)),

  listRoles: () =>
    respond(() =>
      roles.map((role) => ({
        ...role,
        memberCount: members.filter((m) => m.roleId === role.id).length,
      })),
    ),

  createRole: (input) =>
    respond(() => {
      const role: Role = { id: newId("role"), status: "active", ...input }
      roles.push(role)
      return role
    }),

  updateRole: (id, input) =>
    respond(() => {
      const role = findRole(id)
      Object.assign(role, input)
      return role
    }),

  deleteRole: (id) =>
    respond(() => {
      const role = findRole(id)
      const memberCount = members.filter((m) => m.roleId === id).length
      if (memberCount > 0) throw new RoleInUseError(role.name, memberCount)
      roles = roles.filter((r) => r.id !== id)
    }),

  listPolicies: () => respond(() => seedPolicies),

  currentUserEmail: () => respond(() => currentUserEmail),

  startImport: async (file) => {
    const isCsv = file.name.toLowerCase().endsWith(".csv")
    const text = isCsv ? await file.text() : ""
    // The mock can't read spreadsheets, so an XLS file pretends to have 10 rows.
    const imported = isCsv ? membersFromCsv(text) : []
    const total = isCsv ? Math.max(countCsvRows(text), 1) : 10

    return respond(() => {
      stopImport()
      const job: ImportJob = {
        id: newId("import"),
        fileName: file.name,
        fileSize: file.size,
        done: 0,
        total,
        status: "running",
      }
      importJob = job
      importTimer = setInterval(() => {
        job.done += 1
        if (job.done >= job.total) {
          job.status = "done"
          members.push(...imported)
          stopImport()
        }
      }, mockControls.importStepDelay)
      return job
    })
  },

  getImport: () => respond(() => importJob),

  cancelImport: (id) =>
    respond(() => {
      if (importJob?.id !== id) return
      stopImport()
      importJob.status = "cancelled"
    }),

  exportMembers: ({ from, to }) =>
    respond(() => {
      const fromDay = from?.toLocaleDateString("en-CA")
      const toDay = to?.toLocaleDateString("en-CA")
      const inRange = members.filter(
        (m) => (!fromDay || m.dateAdded >= fromDay) && (!toDay || m.dateAdded <= toDay),
      )
      // XLS needs the backend; until then the mock always returns CSV.
      return {
        fileName: `team-members-${today()}.csv`,
        mimeType: "text/csv",
        content: membersCsv(inRange, roles, seedPolicies),
      }
    }),
}

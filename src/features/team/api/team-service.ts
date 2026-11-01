import type {
  ExportFile,
  ExportRequest,
  ImportJob,
  Member,
  Policy,
  Role,
  RoleWithCount,
} from "../types"
import { mockTeamService } from "./mock-team-service"

// Everything the team screens ask the server for. There's no backend yet, so the app uses the
// mock. When the API exists, write a real implementation and change the last line only.

export type InviteRequest = {
  emails: string[]
  policyId: string
  roleId: string
  message?: string
}

export type MemberChanges = Pick<
  Member,
  "firstName" | "lastName" | "policyId" | "phone" | "gender" | "country"
>

export type RoleInput = Pick<Role, "name" | "description" | "permissions">

export type TeamService = {
  listMembers(): Promise<Member[]>
  inviteMembers(request: InviteRequest): Promise<void>
  updateMember(id: string, changes: MemberChanges): Promise<Member>
  changeRole(memberId: string, roleId: string): Promise<void>
  deleteMember(id: string): Promise<void>
  resendInvite(id: string): Promise<void>

  listRoles(): Promise<RoleWithCount[]>
  createRole(role: RoleInput): Promise<Role>
  updateRole(id: string, role: RoleInput): Promise<Role>
  /** Fails with RoleInUseError while any member has the role. */
  deleteRole(id: string): Promise<void>

  listPolicies(): Promise<Policy[]>
  /** The signed-in user's email, for "Send a copy to me". */
  currentUserEmail(): Promise<string>

  /** Starts importing members from a CSV or XLS file. Follow it with getImport. */
  startImport(file: File): Promise<ImportJob>
  /** The import that's running or just finished, or null. */
  getImport(): Promise<ImportJob | null>
  cancelImport(id: string): Promise<void>

  exportMembers(request: ExportRequest): Promise<ExportFile>
}

export const teamService: TeamService = mockTeamService

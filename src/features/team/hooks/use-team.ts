import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { toast } from "@/shared/ui/toast"
import { AlreadyMemberError, RoleInUseError } from "../api/errors"
import {
  type InviteRequest,
  type MemberChanges,
  type RoleInput,
  teamService,
} from "../api/team-service"
import type { ExportRequest, Member } from "../types"

// The team screens' server data, through TanStack Query (loading, errors and caching).

const keys = {
  members: ["team", "members"] as const,
  roles: ["team", "roles"] as const,
  policies: ["team", "policies"] as const,
  me: ["team", "me"] as const,
  import: ["team", "import"] as const,
}

const tryAgain = { description: "Please try again." }

export function fullName(member: Pick<Member, "firstName" | "lastName">) {
  return `${member.firstName} ${member.lastName}`.trim()
}

export function useMembers() {
  return useQuery({ queryKey: keys.members, queryFn: () => teamService.listMembers() })
}

export function useRoles() {
  return useQuery({ queryKey: keys.roles, queryFn: () => teamService.listRoles() })
}

export function usePolicies() {
  return useQuery({ queryKey: keys.policies, queryFn: () => teamService.listPolicies() })
}

export function useCurrentUserEmail() {
  return useQuery({ queryKey: keys.me, queryFn: () => teamService.currentUserEmail() })
}

/** Members and roles change together (role counts), so most changes refresh both. */
function useRefreshTeam() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: keys.members }),
      queryClient.invalidateQueries({ queryKey: keys.roles }),
    ])
}

/** Changes one member in the cached list straight away; the server's answer replaces it later. */
function useOptimisticMember() {
  const queryClient = useQueryClient()
  return async (id: string, change: (member: Member) => Member | null) => {
    await queryClient.cancelQueries({ queryKey: keys.members })
    const previous = queryClient.getQueryData<Member[]>(keys.members)
    queryClient.setQueryData<Member[]>(keys.members, (list) =>
      list?.flatMap((m) => {
        if (m.id !== id) return [m]
        const next = change(m)
        return next ? [next] : []
      }),
    )
    return () => queryClient.setQueryData(keys.members, previous)
  }
}

export function useInviteMembers() {
  const refresh = useRefreshTeam()
  return useMutation({
    mutationFn: (request: InviteRequest) => teamService.inviteMembers(request),
    onSuccess: () =>
      toast.success("Invite sent successfully", {
        description: "Invite email has been shared with members.",
      }),
    onSettled: refresh,
  })
}

export function useUpdateMember() {
  const refresh = useRefreshTeam()
  const optimistic = useOptimisticMember()
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: MemberChanges }) =>
      teamService.updateMember(id, changes),
    onMutate: ({ id, changes }) => optimistic(id, (m) => ({ ...m, ...changes })),
    onError: (_error, _vars, undo) => {
      undo?.()
      toast.error("Couldn't save the changes", tryAgain)
    },
    onSuccess: (member) => toast.success(`${fullName(member)} updated`),
    onSettled: refresh,
  })
}

export function useChangeRole() {
  const refresh = useRefreshTeam()
  const optimistic = useOptimisticMember()
  return useMutation({
    mutationFn: ({ member, roleId }: { member: Member; roleId: string; roleName: string }) =>
      teamService.changeRole(member.id, roleId),
    onMutate: ({ member, roleId }) => optimistic(member.id, (m) => ({ ...m, roleId })),
    onError: (_error, _vars, undo) => {
      undo?.()
      toast.error("Couldn't change the role", tryAgain)
    },
    onSuccess: (_data, { member, roleName }) =>
      toast.success(`${fullName(member)} is now ${roleName}`),
    onSettled: refresh,
  })
}

export function useDeleteMember() {
  const refresh = useRefreshTeam()
  const optimistic = useOptimisticMember()
  return useMutation({
    mutationFn: (member: Member) => teamService.deleteMember(member.id),
    onMutate: (member) => optimistic(member.id, () => null),
    onError: (_error, member, undo) => {
      undo?.()
      toast.error(`Couldn't delete ${fullName(member)}`, tryAgain)
    },
    onSuccess: (_data, member) => toast.success(`${fullName(member)} deleted`),
    onSettled: refresh,
  })
}

export function useResendInvite() {
  return useMutation({
    mutationFn: (member: Member) => teamService.resendInvite(member.id),
    onSuccess: (_data, member) => toast.success(`Invite sent again to ${member.email}`),
    onError: () => toast.error("Couldn't resend the invite", tryAgain),
  })
}

export function useSaveRole() {
  const refresh = useRefreshTeam()
  return useMutation({
    mutationFn: ({ id, role }: { id?: string; role: RoleInput }) =>
      id ? teamService.updateRole(id, role) : teamService.createRole(role),
    onSuccess: (_role, { id }) =>
      id
        ? toast.success("Role updated")
        : toast.success("Role created successfully", {
            description: "You have successfully created a new role.",
          }),
    onError: () => toast.error("Couldn't save the role", tryAgain),
    onSettled: refresh,
  })
}

export function useDeleteRole() {
  const refresh = useRefreshTeam()
  return useMutation({
    mutationFn: (role: { id: string; name: string }) => teamService.deleteRole(role.id),
    onSuccess: (_data, role) => toast.success(`${role.name} role deleted`),
    onError: (error) =>
      toast.error("Couldn't delete the role", {
        description: error instanceof RoleInUseError ? error.message : tryAgain.description,
      }),
    onSettled: refresh,
  })
}

/** The import that's running (or just finished), checked every half second while it runs. */
export function useImport() {
  return useQuery({
    queryKey: keys.import,
    queryFn: () => teamService.getImport(),
    refetchInterval: (q) => (q.state.data?.status === "running" ? 500 : false),
  })
}

/**
 * When an import finishes, refreshes the members and says so in a toast, wherever the user is on
 * the page. Call it once, from the page.
 */
export function useAnnounceImportFinished() {
  const refresh = useRefreshTeam()
  const job = useImport().data
  const lastStatus = useRef(job?.status)

  useEffect(() => {
    if (lastStatus.current === "running" && job?.status === "done") {
      toast.success("Import finished", {
        description: `${job.total} ${job.total === 1 ? "member" : "members"} imported from ${job.fileName}.`,
      })
      refresh()
    }
    lastStatus.current = job?.status
  }, [job, refresh])
}

export function useStartImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => teamService.startImport(file),
    onSuccess: (job) => queryClient.setQueryData(keys.import, job),
    onError: () => toast.error("Couldn't start the import", tryAgain),
  })
}

export function useCancelImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => teamService.cancelImport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.import })
      toast("Import cancelled")
    },
    onError: () => toast.error("Couldn't cancel the import", tryAgain),
  })
}

export function useExportMembers() {
  return useMutation({
    mutationFn: (request: ExportRequest) => teamService.exportMembers(request),
    onError: () => toast.error("Couldn't export members", tryAgain),
  })
}

export { AlreadyMemberError }

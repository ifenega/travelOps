import { useRef, useState } from "react"
import { useMediaQuery } from "@/shared/hooks/use-media-query"
import { focusPageHeading } from "@/shared/lib/focus"
import { AlertDialog, AlertDialogContent } from "@/shared/ui/alert-dialog"
import { Avatar } from "@/shared/ui/avatar"
import { Banner } from "@/shared/ui/banner"
import { Button } from "@/shared/ui/button"
import { Pagination } from "@/shared/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortHead,
} from "@/shared/ui/table"
import {
  fullName,
  useChangeRole,
  useDeleteMember,
  useMembers,
  usePolicies,
  useResendInvite,
  useRoles,
} from "../hooks/use-team"
import type { TeamSearch } from "../search-params"
import type { Member, Policy } from "../types"
import { nextSort, paginate, parseSort, search, sortBy } from "../utils/table-view"
import { MemberStatusBadge, PolicyBadge } from "./badges"
import { EditMemberDialog } from "./edit-member-dialog"
import { ActionsMenu, type MemberAction, PhoneMemberMenu, RoleMenu } from "./member-menus"

type MembersPanelProps = {
  search: TeamSearch
  onSearchChange: (changes: Partial<TeamSearch>) => void
}

const dateAdded = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
})

/** "Jul 09, 2026" */
function formatDateAdded(date: string) {
  return dateAdded.format(new Date(`${date}T00:00:00Z`))
}

export function MembersPanel({ search: params, onSearchChange }: MembersPanelProps) {
  const members = useMembers()
  const roles = useRoles()
  const policies = usePolicies()
  const wide = useMediaQuery("(min-width: 48rem)")

  // The open dialog, and the menu button that opened it (focus goes back there afterwards).
  const [action, setAction] = useState<MemberAction | null>(null)
  const [open, setOpen] = useState(false)
  const [returnFocusTo, setReturnFocusTo] = useState<HTMLButtonElement | null>(null)
  function openAction(next: MemberAction, menuButton: HTMLButtonElement | null) {
    setAction(next)
    setReturnFocusTo(menuButton)
    setOpen(true)
  }

  if (members.isPending || roles.isPending) return <LoadingRows />
  if (members.isError || roles.isError) {
    return (
      <Banner variant="error" title="Couldn't load your team">
        <p>Check your connection and try again.</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => {
            members.refetch()
            roles.refetch()
          }}
        >
          Try again
        </Button>
      </Banner>
    )
  }

  const policyOf = (m: Member) => policies.data?.find((p) => p.id === m.policyId)
  const found = search(members.data, params.q, (m) => [fullName(m), m.email])
  const sorted = sortBy(found, params.sort, { name: fullName, date: (m) => m.dateAdded })
  const view = paginate(sorted, params.page, params.size)
  const sort = parseSort(params.sort)
  const direction = (key: "name" | "date") => (sort.key === key ? sort.direction : "none")

  if (found.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-16 text-center">
        <h2 className="font-medium">
          {params.q ? `No members match “${params.q}”` : "No members yet"}
        </h2>
        {params.q && (
          <Button variant="outline" onClick={() => onSearchChange({ q: undefined, page: 1 })}>
            Clear search
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      {wide ? (
        <Table className="border-t">
          <TableHeader>
            <TableRow>
              <TableSortHead
                direction={direction("name")}
                onSort={() => onSearchChange({ sort: nextSort(params.sort, "name"), page: 1 })}
              >
                Users
              </TableSortHead>
              <TableSortHead
                direction={direction("date")}
                onSort={() => onSearchChange({ sort: nextSort(params.sort, "date"), page: 1 })}
              >
                Date added
              </TableSortHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Policy</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {view.items.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Person member={member} />
                </TableCell>
                <TableCell>
                  <time dateTime={member.dateAdded}>{formatDateAdded(member.dateAdded)}</time>
                </TableCell>
                <TableCell>
                  <MemberStatusBadge status={member.status} />
                </TableCell>
                <TableCell>
                  <RoleMenu member={member} roles={roles.data} onAction={openAction} />
                </TableCell>
                <TableCell>
                  <PolicyBadge policy={policyOf(member)} />
                </TableCell>
                <TableCell className="text-right">
                  <ActionsMenu member={member} onAction={openAction} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <ul className="divide-y border-y">
          {view.items.map((member) => (
            <PhoneRow
              key={member.id}
              member={member}
              policy={policyOf(member)}
              roleName={roles.data.find((r) => r.id === member.roleId)?.name}
              menu={<PhoneMemberMenu member={member} roles={roles.data} onAction={openAction} />}
            />
          ))}
        </ul>
      )}

      <Pagination
        page={view.page}
        pageCount={view.pageCount}
        onPageChange={(page) => onSearchChange({ page })}
        total={found.length}
        pageSize={params.size}
        onPageSizeChange={(size) => onSearchChange({ size: size as TeamSearch["size"], page: 1 })}
        className="border-b"
      />

      <MemberActionDialogs
        action={action}
        open={open}
        onOpenChange={setOpen}
        returnFocusTo={returnFocusTo}
      />
    </>
  )
}

function Person({ member }: { member: Member }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={fullName(member)} src={member.avatarUrl} className="size-9" />
      <div className="min-w-0">
        <p className="truncate font-medium">{fullName(member)}</p>
        <p className="truncate text-muted-foreground">{member.email}</p>
      </div>
    </div>
  )
}

function PhoneRow({
  member,
  policy,
  roleName,
  menu,
}: {
  member: Member
  policy: Policy | undefined
  roleName: string | undefined
  menu: React.ReactNode
}) {
  return (
    <li className="flex items-start gap-3 py-3 text-sm">
      <Avatar name={fullName(member)} src={member.avatarUrl} className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{fullName(member)}</p>
        <p className="truncate text-muted-foreground">{member.email}</p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
          <MemberStatusBadge status={member.status} />
          <span>{roleName ?? "No role"}</span>
          <span aria-hidden="true">·</span>
          <span>{policy?.name ?? "No policy"}</span>
        </p>
      </div>
      {menu}
    </li>
  )
}

/** "Folagbade Timilehin • timilehin@gmail.com", picked out in blue as in the design. */
function Who({ member }: { member: Member }) {
  return (
    <span className="text-primary-700 dark:text-primary-300">
      “{fullName(member)} • {member.email}”
    </span>
  )
}

function MemberActionDialogs({
  action,
  open,
  onOpenChange,
  returnFocusTo,
}: {
  action: MemberAction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  returnFocusTo: HTMLButtonElement | null
}) {
  const changeRole = useChangeRole()
  const deleteMember = useDeleteMember()
  const resend = useResendInvite()
  const deleted = useRef(false)

  function onCloseAutoFocus(event: Event) {
    event.preventDefault()
    // After a delete the row (and its menu button) is gone, so focus the page heading instead.
    if (deleted.current) {
      deleted.current = false
      focusPageHeading()
    } else {
      returnFocusTo?.focus()
    }
  }

  if (!action) return null
  const { member } = action

  if (action.kind === "edit") {
    return (
      <EditMemberDialog
        member={member}
        open={open}
        onOpenChange={onOpenChange}
        onCloseAutoFocus={onCloseAutoFocus}
      />
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {action.kind === "change-role" && (
        <AlertDialogContent
          variant="default"
          title="Change role?"
          description={
            <>
              {fullName(member)} will become <strong>{action.role.name}</strong>. Their access
              changes straight away.
            </>
          }
          confirmLabel="Change role"
          onConfirm={() =>
            changeRole.mutate({ member, roleId: action.role.id, roleName: action.role.name })
          }
          onCloseAutoFocus={onCloseAutoFocus}
        />
      )}
      {action.kind === "delete" && (
        <AlertDialogContent
          title="Delete member"
          description={
            <>
              Are you sure you want to delete <Who member={member} />?
              <span className="mt-3 block">
                Team member will lose all access to their account. This action is permanent and
                irreversible.
              </span>
            </>
          }
          confirmLabel="Delete member"
          onConfirm={() => {
            deleted.current = true
            deleteMember.mutate(member)
          }}
          onCloseAutoFocus={onCloseAutoFocus}
        />
      )}
      {action.kind === "resend" && (
        <AlertDialogContent
          variant="default"
          title="Resend invite email"
          description={
            <>
              An invite email with instructions on how to set up their account will be sent to{" "}
              <Who member={member} />.
            </>
          }
          confirmLabel="Resend email"
          onConfirm={() => resend.mutate(member)}
          onCloseAutoFocus={onCloseAutoFocus}
        />
      )}
    </AlertDialog>
  )
}

/** Grey rows in the shape of the table. Not animated (CLAUDE.md: no motion on load). */
function LoadingRows() {
  return (
    <div role="status" className="flex flex-col divide-y border-y">
      <span className="sr-only">Loading members</span>
      {[1, 2, 3, 4, 5].map((key) => (
        <div key={key} aria-hidden="true" className="flex items-center gap-3 py-3">
          <div className="size-9 rounded-full bg-muted" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3.5 w-36 rounded bg-muted" />
            <div className="h-3 w-48 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

import { ChevronDown, Edit04, UserCircle, UserX01 } from "@untitledui/icons"
import { useRef, useState } from "react"
import { useMediaQuery } from "@/shared/hooks/use-media-query"
import { focusPageHeading } from "@/shared/lib/focus"
import { AlertDialog, AlertDialogContent } from "@/shared/ui/alert-dialog"
import { Banner } from "@/shared/ui/banner"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
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
import { useDeleteRole, useRoles } from "../hooks/use-team"
import type { TeamSearch } from "../search-params"
import type { RoleWithCount } from "../types"
import { nextSort, paginate, parseSort, sortBy } from "../utils/table-view"
import { RoleDialog } from "./role-dialog"

type RolesPanelProps = {
  search: TeamSearch
  onSearchChange: (changes: Partial<TeamSearch>) => void
}

type RoleAction = { kind: "edit" | "delete"; role: RoleWithCount }

export function RolesPanel({ search: params, onSearchChange }: RolesPanelProps) {
  const roles = useRoles()
  const deleteRole = useDeleteRole()
  const wide = useMediaQuery("(min-width: 48rem)")
  const [action, setAction] = useState<RoleAction | null>(null)
  const [open, setOpen] = useState(false)
  const returnFocusTo = useRef<HTMLButtonElement | null>(null)
  const deleted = useRef(false)

  function openAction(next: RoleAction, button: HTMLButtonElement | null) {
    setAction(next)
    returnFocusTo.current = button
    setOpen(true)
  }

  function onCloseAutoFocus(event: Event) {
    event.preventDefault()
    if (deleted.current) {
      deleted.current = false
      focusPageHeading()
    } else {
      returnFocusTo.current?.focus()
    }
  }

  if (roles.isPending) {
    return (
      <p role="status" className="py-8 text-center text-muted-foreground text-sm">
        Loading roles…
      </p>
    )
  }
  if (roles.isError) {
    return (
      <Banner variant="error" title="Couldn't load roles">
        <p>Check your connection and try again.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => roles.refetch()}>
          Try again
        </Button>
      </Banner>
    )
  }

  // Roles only sort by name; a members-only sort (date) falls back to it.
  const sortKey = params.sort.endsWith("date") ? "name" : params.sort
  const sorted = sortBy(roles.data, sortKey, { name: (r) => r.name, date: (r) => r.name })
  const view = paginate(sorted, params.page, params.size)

  return (
    <>
      {wide ? (
        <Table className="table-fixed border-t">
          <TableHeader>
            <TableRow>
              <TableSortHead
                direction={parseSort(sortKey).direction}
                onSort={() => onSearchChange({ sort: nextSort(sortKey, "name"), page: 1 })}
                className="w-48"
              >
                Role
              </TableSortHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24 text-right">Members</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-20 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {view.items.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                {/* One line, cut off, as in the design; the full text is in Edit role. */}
                <TableCell className="truncate text-muted-foreground" title={role.description}>
                  {role.description}
                </TableCell>
                <TableCell className="text-right tabular-nums">{role.memberCount}</TableCell>
                <TableCell>
                  <RoleStatusMenu role={role} onDelete={openAction} />
                </TableCell>
                <TableCell className="text-right">
                  <EditRoleButton role={role} onEdit={openAction} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <ul className="divide-y border-y">
          {view.items.map((role) => (
            <li key={role.id} className="flex items-start gap-3 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{role.name}</p>
                <p className="text-muted-foreground">{role.description}</p>
                <div className="mt-2 flex items-center gap-3 text-muted-foreground text-xs">
                  <RoleStatusMenu role={role} onDelete={openAction} />
                  <span>
                    {role.memberCount} {role.memberCount === 1 ? "member" : "members"}
                  </span>
                </div>
              </div>
              <EditRoleButton role={role} onEdit={openAction} />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={view.page}
        pageCount={view.pageCount}
        onPageChange={(page) => onSearchChange({ page })}
        total={roles.data.length}
        pageSize={params.size}
        onPageSizeChange={(size) => onSearchChange({ size: size as TeamSearch["size"], page: 1 })}
        className="border-b"
      />

      <RoleDialog
        open={open && action?.kind === "edit"}
        onOpenChange={setOpen}
        role={action?.kind === "edit" ? action.role : undefined}
        roles={roles.data}
        onCloseAutoFocus={onCloseAutoFocus}
      />

      <AlertDialog open={open && action?.kind === "delete"} onOpenChange={setOpen}>
        {action?.kind === "delete" && (
          <AlertDialogContent
            title="Delete role"
            description={
              <>
                Are you sure you want to delete the{" "}
                <span className="text-primary-700 dark:text-primary-300">“{action.role.name}”</span>{" "}
                role?
                <span className="mt-3 block">This action cannot be undone.</span>
              </>
            }
            confirmLabel="Delete role"
            onConfirm={() => {
              deleted.current = true
              deleteRole.mutate(action.role)
            }}
            onCloseAutoFocus={onCloseAutoFocus}
          />
        )}
      </AlertDialog>
    </>
  )
}

function EditRoleButton({
  role,
  onEdit,
}: {
  role: RoleWithCount
  onEdit: (action: RoleAction, button: HTMLButtonElement | null) => void
}) {
  const button = useRef<HTMLButtonElement>(null)
  return (
    <Button
      ref={button}
      variant="ghost"
      size="icon"
      aria-label={`Edit ${role.name} role`}
      onClick={() => onEdit({ kind: "edit", role }, button.current)}
    >
      <Edit04 />
    </Button>
  )
}

/** "Active ⌄": the role's status, and Delete role (only once no one has the role). */
function RoleStatusMenu({
  role,
  onDelete,
}: {
  role: RoleWithCount
  onDelete: (action: RoleAction, button: HTMLButtonElement | null) => void
}) {
  const button = useRef<HTMLButtonElement>(null)
  const inUse = role.memberCount > 0
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          ref={button}
          type="button"
          aria-label={`Status of ${role.name}: Active`}
          className="inline-flex items-center gap-0.5 rounded-md bg-success-100 px-2 py-0.5 text-success-700 text-xs hover:bg-success-200 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 pointer-coarse:min-h-8 dark:bg-success-600/20 dark:text-success-300 transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100"
        >
          Active
          <ChevronDown aria-hidden="true" className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-w-xs">
        <DropdownMenuLabel>Select status</DropdownMenuLabel>
        <DropdownMenuItem
          icon={UserCircle}
          description="This role can be assigned to team members"
          disabled
        >
          Active <span className="sr-only">(current status)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          icon={UserX01}
          variant="destructive"
          disabled={inUse}
          description={
            inUse
              ? `Roles with members can't be deleted. ${role.memberCount} ${role.memberCount === 1 ? "member has" : "members have"} this role.`
              : "Remove this role for good"
          }
          onSelect={() => onDelete({ kind: "delete", role }, button.current)}
        >
          Delete role
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

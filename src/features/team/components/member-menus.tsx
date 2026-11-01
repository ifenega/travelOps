import {
  ChevronDown,
  DotsHorizontal,
  Edit05,
  Mail01,
  User01,
  UserCircle,
  UserX01,
} from "@untitledui/icons"
import { useRef } from "react"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { fullName } from "../hooks/use-team"
import type { Member, Role } from "../types"

/** What a row's menus ask the members tab to do. The tab opens the matching dialog. */
export type MemberAction =
  | { kind: "change-role"; member: Member; role: Role }
  | { kind: "delete" | "resend" | "edit"; member: Member }

type MenuProps = {
  member: Member
  roles: Role[]
  /** The menu button is passed along, so focus can go back to it when the dialog closes. */
  onAction: (action: MemberAction, menuButton: HTMLButtonElement | null) => void
}

function RoleItems({
  member,
  roles,
  onPick,
}: Pick<MenuProps, "member" | "roles"> & { onPick: (action: MemberAction) => void }) {
  return (
    <>
      <DropdownMenuLabel>Select role</DropdownMenuLabel>
      {roles.map((role) => (
        <DropdownMenuItem
          key={role.id}
          icon={role.id === "admin" ? UserCircle : User01}
          description={role.description}
          // Picking the role they already have does nothing, so it isn't offered.
          disabled={role.id === member.roleId}
          onSelect={() => onPick({ kind: "change-role", member, role })}
        >
          {role.name}
          {role.id === member.roleId && <span className="sr-only"> (current role)</span>}
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        icon={UserX01}
        variant="destructive"
        description="Revoke user's access"
        onSelect={() => onPick({ kind: "delete", member })}
      >
        Delete user
      </DropdownMenuItem>
    </>
  )
}

function ActionItems({
  member,
  onPick,
}: Pick<MenuProps, "member"> & { onPick: (action: MemberAction) => void }) {
  return (
    <>
      <DropdownMenuLabel>Select action</DropdownMenuLabel>
      {member.status === "pending" && (
        <DropdownMenuItem
          icon={Mail01}
          description="Resend invitation email to user"
          onSelect={() => onPick({ kind: "resend", member })}
        >
          Resend invite email
        </DropdownMenuItem>
      )}
      <DropdownMenuItem
        icon={Edit05}
        description="Change their name, policy and contact details"
        onSelect={() => onPick({ kind: "edit", member })}
      >
        Edit user
      </DropdownMenuItem>
    </>
  )
}

/** "Administrator ⌄" in the Role column. */
export function RoleMenu({ member, roles, onAction }: MenuProps) {
  const button = useRef<HTMLButtonElement>(null)
  const current = roles.find((r) => r.id === member.roleId)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          ref={button}
          type="button"
          aria-label={`Role for ${fullName(member)}: ${current?.name ?? "none"}`}
          className="-ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:min-h-11 transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100"
        >
          {current?.name ?? "No role"}
          <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-w-xs">
        <RoleItems
          member={member}
          roles={roles}
          onPick={(action) => onAction(action, button.current)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** The ··· in the Actions column. */
export function ActionsMenu({ member, onAction }: Omit<MenuProps, "roles">) {
  const button = useRef<HTMLButtonElement>(null)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={button}
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${fullName(member)}`}
        >
          <DotsHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-xs">
        <ActionItems member={member} onPick={(action) => onAction(action, button.current)} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** On phones there's no Role column, so one ··· menu holds the actions and the role choices. */
export function PhoneMemberMenu({ member, roles, onAction }: MenuProps) {
  const button = useRef<HTMLButtonElement>(null)
  const pick = (action: MemberAction) => onAction(action, button.current)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={button}
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${fullName(member)}`}
        >
          <DotsHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-(--radix-dropdown-menu-content-available-height) max-w-xs overflow-y-auto">
        <ActionItems member={member} onPick={pick} />
        <DropdownMenuSeparator />
        <RoleItems member={member} roles={roles} onPick={pick} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { Dialog, DialogClose, DialogContent } from "@/shared/ui/dialog"
import { Field } from "@/shared/ui/field"
import { HelpTip } from "@/shared/ui/help-tip"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { useSaveRole } from "../hooks/use-team"
import { type Access, features, type Permissions, type Role } from "../types"

const noAccess = Object.fromEntries(
  features.map((f) => [f.id, { read: false, write: false }]),
) as Permissions

function roleSchema(takenNames: string[]) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, "Give the role a name")
      .refine(
        (name) => !takenNames.includes(name.toLowerCase()),
        "There's already a role with this name",
      ),
    description: z.string().trim().max(200, "Keep the description under 200 characters"),
    permissions: z
      .custom<Permissions>()
      .refine(
        (permissions) => Object.values(permissions).some((access) => access.read),
        "Give the role access to at least one feature",
      ),
  })
}

type RoleValues = z.infer<ReturnType<typeof roleSchema>>

type RoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Editing this role, or creating a new one when undefined. */
  role?: Role
  /** Every role, to keep names unique. */
  roles: Role[]
  onCloseAutoFocus?: (event: Event) => void
}

export function RoleDialog({ open, onOpenChange, role, roles, onCloseAutoFocus }: RoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={role ? "Edit role" : "Create role"}
        description={role ? "Update your role details" : "Create a new role for your members"}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        {open && (
          <RoleForm
            key={role?.id ?? "new"}
            role={role}
            roles={roles}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function RoleForm({ role, roles, onDone }: { role?: Role; roles: Role[]; onDone: () => void }) {
  const save = useSaveRole()
  const schema = useMemo(
    () => roleSchema(roles.filter((r) => r.id !== role?.id).map((r) => r.name.toLowerCase())),
    [roles, role],
  )
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleValues>({
    mode: "onTouched",
    resolver: zodResolver(schema),
    defaultValues: {
      name: role?.name ?? "",
      description: role?.description ?? "",
      permissions: role?.permissions ?? noAccess,
    },
  })

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        save.mutate({ id: role?.id, role: values })
        onDone()
      })}
      className="flex flex-col gap-4"
    >
      <Field label="Role" error={errors.name?.message}>
        {(c) => <Input {...c} placeholder="Type here…" {...register("name")} />}
      </Field>
      <Field label="Role description" error={errors.description?.message}>
        {(c) => (
          <Textarea
            {...c}
            placeholder="Give this role a description…"
            {...register("description")}
          />
        )}
      </Field>
      <Controller
        control={control}
        name="permissions"
        render={({ field, fieldState }) => (
          <PermissionsGrid
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <div className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">{role ? "Save changes" : "Create role"}</Button>
      </div>
    </form>
  )
}

/**
 * Features × Read / Write. Write includes Read: ticking Write ticks Read, and Read can't be
 * unticked while Write is on (it would make a role that can change what it can't see).
 */
export function PermissionsGrid({
  value,
  onChange,
  error,
}: {
  value: Permissions
  onChange: (permissions: Permissions) => void
  error?: string
}) {
  function set(feature: keyof Permissions, access: Access) {
    onChange({ ...value, [feature]: access })
  }

  return (
    <div>
      <table className="w-full text-sm">
        <caption className="mb-2 text-left font-medium">Select permissions</caption>
        <thead className="text-muted-foreground">
          <tr className="border-y">
            <th scope="col" className="py-2 pl-2 text-left font-normal">
              <span className="inline-flex items-center gap-1">
                Features
                <HelpTip label="About features">
                  Read lets people see that part of TravelOps. Write lets them change things there,
                  and includes Read.
                </HelpTip>
              </span>
            </th>
            <th scope="col" className="w-20 py-2 text-left font-normal">
              Read
            </th>
            <th scope="col" className="w-20 py-2 text-left font-normal">
              Write
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => {
            const access = value[feature.id]
            return (
              <tr key={feature.id} className="border-b">
                <th scope="row" className="py-2.5 pl-2 text-left font-normal">
                  {feature.label}
                </th>
                <td className="py-2.5">
                  <Checkbox
                    aria-label={
                      access.write
                        ? `${feature.label}: Read (included with Write)`
                        : `${feature.label}: Read`
                    }
                    checked={access.read}
                    disabled={access.write}
                    onCheckedChange={(checked) =>
                      set(feature.id, { ...access, read: checked === true })
                    }
                  />
                </td>
                <td className="py-2.5">
                  <Checkbox
                    aria-label={`${feature.label}: Write`}
                    checked={access.write}
                    onCheckedChange={(checked) =>
                      set(feature.id, {
                        write: checked === true,
                        read: checked === true ? true : access.read,
                      })
                    }
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {error && (
        <p role="alert" className="mt-2 text-error-700 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}

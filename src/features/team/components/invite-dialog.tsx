import { zodResolver } from "@hookform/resolvers/zod"
import { User01, UserCircle, Wallet02 } from "@untitledui/icons"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogClose, DialogContent } from "@/shared/ui/dialog"
import { Field } from "@/shared/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Textarea } from "@/shared/ui/textarea"
import { AlreadyMemberError, useInviteMembers, usePolicies, useRoles } from "../hooks/use-team"
import type { Policy, Role } from "../types"
import { isValidEmail } from "../utils/emails"
import { EmailChipsInput } from "./email-chips-input"

const inviteSchema = z.object({
  emails: z
    .array(z.string())
    .min(1, "Add at least one email")
    .refine((emails) => emails.every(isValidEmail), "Fix or remove the emails marked in red"),
  policyId: z.string().min(1, "Choose a policy"),
  roleId: z.string().min(1, "Choose a role"),
  message: z.string().max(500, "Keep the message under 500 characters"),
})

type InviteValues = z.infer<typeof inviteSchema>

export function InviteDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const roles = useRoles()
  const policies = usePolicies()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Add members"
        description="Type or paste in emails below, separated by commas"
      >
        {/* The form needs the roles and policies for its choices and its default policy. */}
        {open &&
          (roles.data && policies.data ? (
            <InviteForm
              roles={roles.data}
              policies={policies.data}
              onDone={() => onOpenChange(false)}
            />
          ) : (
            <p role="status" className="text-muted-foreground text-sm">
              Loading…
            </p>
          ))}
      </DialogContent>
    </Dialog>
  )
}

function RoleOption({ role }: { role: Role }) {
  const Icon = role.id === "admin" ? UserCircle : User01
  return (
    <span className="flex items-start gap-2.5 text-left">
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0">
        <span className="block">{role.name}</span>
        <span className="block text-muted-foreground text-xs">{role.description}</span>
      </span>
    </span>
  )
}

function InviteForm({
  roles,
  policies,
  onDone,
}: {
  roles: Role[]
  policies: Policy[]
  onDone: () => void
}) {
  const invite = useInviteMembers()
  const {
    control,
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InviteValues>({
    mode: "onTouched",
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      emails: [],
      policyId: policies.find((p) => p.isDefault)?.id ?? "",
      roleId: "",
      message: "",
    },
  })
  const selectedRole = roles.find((r) => r.id === watch("roleId"))

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        try {
          await invite.mutateAsync({ ...values, message: values.message || undefined })
          onDone()
        } catch (error) {
          setError("emails", {
            message:
              error instanceof AlreadyMemberError
                ? `Already in your team: ${error.emails.join(", ")}`
                : "Couldn't send the invites. Please try again.",
          })
        }
      })}
      className="flex flex-col gap-4"
    >
      <Field label="Email" error={errors.emails?.message}>
        {(c) => (
          <Controller
            control={control}
            name="emails"
            // No onBlur: checking on blur would show the error as the user clicks Send, pushing
            // the button down mid-click so the click misses. Bad emails are already red chips;
            // the message appears on Send and updates as chips change.
            render={({ field }) => (
              <EmailChipsInput {...c} value={field.value} onChange={field.onChange} />
            )}
          />
        )}
      </Field>

      <Field label="Select policy" error={errors.policyId?.message}>
        {(c) => (
          <Controller
            control={control}
            name="policyId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger {...c} variant="outline" className="w-full">
                  <SelectValue placeholder="What policy applies to these members" />
                </SelectTrigger>
                <SelectContent aria-label="Select policy">
                  {policies.map((policy) => (
                    <SelectItem key={policy.id} value={policy.id} description={policy.description}>
                      <span className="flex items-center gap-2">
                        <Wallet02 aria-hidden="true" className="size-4 text-muted-foreground" />
                        {policy.name}
                        {policy.isDefault && (
                          <span className="rounded bg-foreground/5 px-1.5 text-xs">Default</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </Field>

      <Field label="Role" error={errors.roleId?.message}>
        {(c) => (
          <Controller
            control={control}
            name="roleId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger {...c} variant="outline" className="w-full py-2">
                  {/* The trigger shows the description too, as in the design. */}
                  <SelectValue placeholder="Select a role">
                    {selectedRole && <RoleOption role={selectedRole} />}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent aria-label="Role" className="max-w-(--radix-select-trigger-width)">
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <RoleOption role={role} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </Field>

      <Field label="Message" error={errors.message?.message}>
        {(c) => (
          <Textarea {...c} placeholder="Add a note to your invite" {...register("message")} />
        )}
      </Field>

      <div className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send invite"}
        </Button>
      </div>
    </form>
  )
}

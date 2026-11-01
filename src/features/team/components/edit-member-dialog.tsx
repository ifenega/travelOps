import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogClose, DialogContent } from "@/shared/ui/dialog"
import { Field } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { usePolicies, useUpdateMember } from "../hooks/use-team"
import type { Gender, Member } from "../types"
import { countryList } from "../utils/countries"

const genders: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "unspecified", label: "Prefer not to say" },
]

const editMemberSchema = z.object({
  firstName: z.string().trim().min(1, "Enter a first name"),
  lastName: z.string().trim().min(1, "Enter a last name"),
  policyId: z.string().min(1, "Choose a policy"),
  phone: z
    .string()
    .trim()
    .refine(
      (phone) => phone === "" || /^\+?[\d\s-]{6,20}$/.test(phone),
      "Use digits, spaces, + or - only",
    ),
  gender: z.union([z.literal(""), z.enum(["female", "male", "unspecified"])]),
  country: z.string(),
})

type EditMemberValues = z.infer<typeof editMemberSchema>

type EditMemberDialogProps = {
  member: Member
  open: boolean
  onOpenChange: (open: boolean) => void
  onCloseAutoFocus: (event: Event) => void
}

export function EditMemberDialog({
  member,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: EditMemberDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Edit member"
        description="Manage your members details"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        {/* Keyed, so it starts from this member's details each time. */}
        <EditMemberForm key={member.id} member={member} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function EditMemberForm({ member, onDone }: { member: Member; onDone: () => void }) {
  const policies = usePolicies()
  const update = useUpdateMember()
  const countries = useMemo(() => countryList(), [])
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditMemberValues>({
    mode: "onTouched",
    resolver: zodResolver(editMemberSchema),
    defaultValues: {
      firstName: member.firstName,
      lastName: member.lastName,
      policyId: member.policyId,
      phone: member.phone ?? "",
      gender: member.gender ?? "",
      country: member.country ?? "",
    },
  })

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        update.mutate({
          id: member.id,
          changes: {
            firstName: values.firstName,
            lastName: values.lastName,
            policyId: values.policyId,
            phone: values.phone || undefined,
            gender: values.gender || undefined,
            country: values.country || undefined,
          },
        })
        onDone()
      })}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <Field label="First name" error={errors.firstName?.message}>
        {(c) => <Input {...c} autoComplete="given-name" {...register("firstName")} />}
      </Field>
      <Field label="Last name" error={errors.lastName?.message}>
        {(c) => <Input {...c} autoComplete="family-name" {...register("lastName")} />}
      </Field>

      {/* Read-only, not disabled, so screen readers still read it along with why. */}
      <Field
        label="Email address"
        description="Members email address cannot be changed."
        className="sm:col-span-2"
      >
        {(c) => <Input {...c} value={member.email} readOnly />}
      </Field>

      <Field label="Select policy" error={errors.policyId?.message} className="sm:col-span-2">
        {(c) => (
          <Controller
            control={control}
            name="policyId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger {...c} variant="outline" className="w-full">
                  <SelectValue placeholder="What policy applies to this member" />
                </SelectTrigger>
                <SelectContent aria-label="Select policy">
                  {policies.data?.map((policy) => (
                    <SelectItem key={policy.id} value={policy.id} description={policy.description}>
                      {policy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </Field>

      <Field label="Phone number" error={errors.phone?.message}>
        {(c) => <Input {...c} type="tel" autoComplete="tel" {...register("phone")} />}
      </Field>
      <Field label="Gender">
        {(c) => (
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger {...c} variant="outline" className="w-full">
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent aria-label="Gender">
                  {genders.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </Field>

      <Field label="Country" className="sm:col-span-2">
        {(c) => (
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger {...c} variant="outline" className="w-full">
                  <SelectValue placeholder="Choose a country" />
                </SelectTrigger>
                <SelectContent aria-label="Country" className="max-h-72">
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </Field>

      <div className="flex justify-end gap-2 sm:col-span-2">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  )
}

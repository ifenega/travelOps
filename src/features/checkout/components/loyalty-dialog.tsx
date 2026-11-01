import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import type { RefObject } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogClose, DialogContent } from "@/shared/ui/dialog"
import { Field } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { checkoutService } from "../api/checkout-service"
import type { Loyalty } from "../types"

const loyaltySchema = z.object({
  program: z.string().min(1, "Choose a loyalty program"),
  number: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{6,20}$/, "Enter your membership number: 6 to 20 letters or digits"),
})

/** "Add loyalty" (design screen 25): a program and a membership number. */
export function LoyaltyDialog({
  open,
  onOpenChange,
  loyalty,
  onSave,
  returnFocusTo,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  loyalty?: Loyalty
  onSave: (loyalty: Loyalty) => void
  /** The button that opened it, which gets focus back when it closes. */
  returnFocusTo: RefObject<HTMLButtonElement | null>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={loyalty ? "Edit loyalty" : "Add loyalty"}
        description="Provide your loyalty program details."
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          returnFocusTo.current?.focus()
        }}
      >
        {/* The dialog's content mounts each time it opens, so the form starts fresh. */}
        <LoyaltyForm
          loyalty={loyalty}
          onSave={(values) => {
            onSave(values)
            onOpenChange(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function LoyaltyForm({
  loyalty,
  onSave,
}: {
  loyalty?: Loyalty
  onSave: (loyalty: Loyalty) => void
}) {
  const programs = useQuery({
    queryKey: ["checkout", "loyalty-programs"],
    queryFn: () => checkoutService.loyaltyPrograms(),
  })
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Loyalty>({
    resolver: zodResolver(loyaltySchema),
    mode: "onTouched",
    defaultValues: loyalty ?? { program: "", number: "" },
  })

  return (
    <form noValidate onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
      <Field label="Loyalty program" error={errors.program?.message}>
        {(fieldProps) => (
          <Controller
            control={control}
            name="program"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  {...fieldProps}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  variant="outline"
                  className="h-10 w-full"
                >
                  <SelectValue placeholder="Select loyalty program" />
                </SelectTrigger>
                <SelectContent aria-label="Loyalty program">
                  {(programs.data ?? []).map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </Field>
      <Field label="Membership number" error={errors.number?.message}>
        {(fieldProps) => (
          <Input {...fieldProps} {...register("number")} inputMode="text" autoComplete="off" />
        )}
      </Field>
      <div className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}

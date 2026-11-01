import type { UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { Field } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import type { Contact } from "../types"

/** Who gets the booking confirmation (design screen 21). */
export const contactSchema = z.object({
  email: z.email("Enter an email address like name@example.com"),
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[\d\s()-]{7,}$/,
      "Enter a phone number with its country code, like +234 803 000 0000",
    ),
  address: z.string().trim().min(5, "Enter a postal address"),
})

/** The fields only; the page owns the form, since its Proceed button checks everything. */
export function ContactFields({ form }: { form: UseFormReturn<Contact> }) {
  const {
    register,
    formState: { errors },
  } = form
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Email address" error={errors.email?.message}>
        {(fieldProps) => (
          <Input
            {...fieldProps}
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
          />
        )}
      </Field>
      <Field label="Phone number" error={errors.phone?.message}>
        {(fieldProps) => (
          <Input
            {...fieldProps}
            {...register("phone")}
            type="tel"
            autoComplete="tel"
            placeholder="+234 00 000 000 00"
          />
        )}
      </Field>
      <Field label="Postal address" error={errors.address?.message} className="sm:col-span-2">
        {(fieldProps) => (
          <Input
            {...fieldProps}
            {...register("address")}
            autoComplete="street-address"
            placeholder="House number, street, city"
          />
        )}
      </Field>
    </div>
  )
}

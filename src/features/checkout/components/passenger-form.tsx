import { zodResolver } from "@hookform/resolvers/zod"
import { Check } from "@untitledui/icons"
import { Controller, useForm } from "react-hook-form"
import { Banner } from "@/shared/ui/banner"
import { Button } from "@/shared/ui/button"
import { Field } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import type { Passenger, PassengerDetails } from "../types"
import { passengerSchema } from "../utils/passenger"

/** One passenger's details, inside their accordion section (design screen 20). */
export function PassengerForm({
  passenger,
  titles,
  travelDate,
  onConfirm,
}: {
  passenger: Passenger
  titles: string[]
  /** The departure day, to check children's and infants' ages. */
  travelDate: Date
  onConfirm: (details: PassengerDetails) => void
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PassengerDetails>({
    resolver: zodResolver(passengerSchema(passenger.type, travelDate)),
    mode: "onTouched",
    defaultValues: passenger.details ?? { title: "", firstName: "", lastName: "", dateOfBirth: "" },
  })

  return (
    <form noValidate onSubmit={handleSubmit(onConfirm)} className="flex flex-col gap-4">
      {passenger.type === "infant" && (
        <Banner
          variant="warning"
          title="Infants under 2 won't get their own seat and must travel on the accompanying adult's lap"
        />
      )}
      <div className="grid gap-3 sm:grid-cols-[7rem_1fr_1fr]">
        <Field label="Title" error={errors.title?.message}>
          {(fieldProps) => (
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    {...fieldProps}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    variant="outline"
                    className="h-10 w-full"
                  >
                    <SelectValue placeholder="Title" />
                  </SelectTrigger>
                  <SelectContent aria-label="Title">
                    {titles.map((title) => (
                      <SelectItem key={title} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </Field>
        <Field label="First name" error={errors.firstName?.message}>
          {(fieldProps) => (
            <Input
              {...fieldProps}
              {...register("firstName")}
              autoComplete="off"
              placeholder="Enter first name"
            />
          )}
        </Field>
        <Field label="Last name" error={errors.lastName?.message}>
          {(fieldProps) => (
            <Input
              {...fieldProps}
              {...register("lastName")}
              autoComplete="off"
              placeholder="Enter last name"
            />
          )}
        </Field>
      </div>
      {passenger.type !== "adult" && (
        <Field label="Date of birth" error={errors.dateOfBirth?.message}>
          {(fieldProps) => <Input {...fieldProps} {...register("dateOfBirth")} type="date" />}
        </Field>
      )}
      <div>
        <Button type="submit" size="sm">
          Confirm
          <Check className="size-4" />
        </Button>
      </div>
    </form>
  )
}

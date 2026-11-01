import { zodResolver } from "@hookform/resolvers/zod"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useForm } from "react-hook-form"
import { expect, fn } from "storybook/test"
import { z } from "zod"
import { Button } from "./button"
import { Field } from "./field"
import { Input } from "./input"
import { toast } from "./toast"

const meta = {
  title: "Components/Field",
  component: Field,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const States: Story = {
  args: { label: "Full name", children: () => null },
  render: () => (
    <div className="flex max-w-sm flex-col gap-6">
      <Field label="Full name">
        {(control) => <Input {...control} placeholder="As on passport" />}
      </Field>
      <Field label="Frequent flyer number" description="Optional. We'll add it to your booking.">
        {(control) => <Input {...control} autoCapitalize="characters" autoCorrect="off" />}
      </Field>
      <Field label="Email" error="Enter a valid email address">
        {(control) => <Input {...control} type="email" defaultValue="ada@" />}
      </Field>
      <Field label="Nationality">
        {(control) => <Input {...control} disabled value="Nigerian" />}
      </Field>
    </div>
  ),
}

// A real form: React Hook Form + Zod. The schema is the single source of the rules and the types.
const passengerSchema = z.object({
  fullName: z.string().trim().min(1, "Enter the passenger's full name, as on their passport"),
  email: z.email("Enter a valid email address, like name@example.com"),
})

type Passenger = z.infer<typeof passengerSchema>

function PassengerForm({ onSave }: { onSave: (passenger: Passenger) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Passenger>({
    resolver: zodResolver(passengerSchema),
    mode: "onTouched", // check a field when the user leaves it, then as they fix it
  })

  return (
    <form
      noValidate
      onSubmit={handleSubmit((passenger) => {
        onSave(passenger)
        toast.success("Passenger saved")
      })}
      className="flex max-w-sm flex-col gap-5"
    >
      <Field label="Full name" error={errors.fullName?.message}>
        {(control) => <Input {...control} {...register("fullName")} autoComplete="name" />}
      </Field>
      <Field label="Email" error={errors.email?.message}>
        {(control) => (
          <Input
            {...control}
            {...register("email")}
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
          />
        )}
      </Field>
      <Button type="submit" className="self-start">
        Save passenger
      </Button>
    </form>
  )
}

export const PassengerFormExample: Story = {
  args: { label: "Full name", children: () => null },
  render: () => <PassengerForm onSave={() => {}} />,
}

const onSave = fn()

/** Behaviour: errors appear on submit, are linked to their fields, and focus jumps to the first one. */
export const Validation: Story = {
  args: { label: "Full name", children: () => null },
  render: () => <PassengerForm onSave={onSave} />,
  play: async ({ canvas, userEvent }) => {
    const name = canvas.getByRole("textbox", { name: "Full name" })
    const email = canvas.getByRole("textbox", { name: "Email" })

    await userEvent.click(canvas.getByRole("button", { name: "Save passenger" }))
    await expect(name).toHaveAttribute("aria-invalid", "true")
    await expect(name).toHaveAccessibleDescription(/full name, as on their passport/)
    await expect(name).toHaveFocus()
    await expect(onSave).not.toHaveBeenCalled()

    await userEvent.type(name, "Ada Okafor")
    await userEvent.type(email, "ada@example.com")
    await userEvent.click(canvas.getByRole("button", { name: "Save passenger" }))
    await expect(onSave).toHaveBeenCalledWith({ fullName: "Ada Okafor", email: "ada@example.com" })
    await expect(name).not.toHaveAttribute("aria-invalid")
  },
}

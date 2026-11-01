import { AlertCircle } from "@untitledui/icons"
import { type ReactNode, useId } from "react"
import { cn } from "@/shared/lib/utils"

type ControlProps = {
  id: string
  "aria-invalid"?: true
  "aria-describedby"?: string
}

type FieldProps = {
  label: string
  /** Help text under the control. */
  description?: string
  /** Error message, e.g. from React Hook Form: errors.email?.message */
  error?: string
  /** Render the control with the props that connect it to the label, help text and error. */
  children: (control: ControlProps) => ReactNode
  className?: string
}

/**
 * A labelled form control with optional help text and error message, wired for screen readers:
 * the label names the control, and help/error text is read out with it.
 *
 *   <Field label="Email" error={errors.email?.message}>
 *     {(control) => <Input type="email" {...control} {...register("email")} />}
 *   </Field>
 */
export function Field({ label, description, error, children, className }: FieldProps) {
  const id = useId()
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`
  const describedBy = [description && descriptionId, error && errorId].filter(Boolean).join(" ")

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="font-medium text-sm">
        {label}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}
      {description && (
        <p id={descriptionId} className="text-muted-foreground text-sm">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-error-700 text-sm">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

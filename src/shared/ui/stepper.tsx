import { Minus, Plus } from "@untitledui/icons"
import { type ComponentType, useId } from "react"
import { cn } from "@/shared/lib/utils"
import { Button } from "./button"

type StepperProps = {
  /** e.g. "Adults". Names the group and is read out with the count. */
  label: string
  /** e.g. "Ages 18+". */
  description?: string
  icon?: ComponentType<{ className?: string }>
  /** Singular noun for the button labels: "Add adult", "Remove adult". */
  unit: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

// The Figma's "− 1 +" counter, e.g. for passengers. The new count is announced to screen readers.
// Buttons use aria-disabled (not disabled) at the limits, so keyboard focus stays on them.
export function Stepper({
  label,
  description,
  icon: Icon,
  unit,
  value,
  onChange,
  min = 0,
  max = 9,
}: StepperProps) {
  const labelId = useId()
  const atMin = value <= min
  const atMax = value >= max

  return (
    <fieldset
      aria-labelledby={labelId}
      className="m-0 flex min-w-0 items-center gap-3 border-0 p-0"
    >
      {Icon && <Icon className="size-5 shrink-0 text-muted-foreground" />}
      <div className="min-w-0 flex-1">
        <p id={labelId} className="text-sm">
          {label}
        </p>
        {description && <p className="truncate text-muted-foreground text-xs">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <StepButton
          label={`Remove ${unit}`}
          disabled={atMin}
          onClick={() => onChange(value - 1)}
          icon={Minus}
        />
        <span className="w-5 text-center text-sm tabular-nums" aria-live="polite">
          <span className="sr-only">{label}: </span>
          {value}
        </span>
        <StepButton
          label={`Add ${unit}`}
          disabled={atMax}
          onClick={() => onChange(value + 1)}
          icon={Plus}
        />
      </div>
    </fieldset>
  )
}

function StepButton({
  label,
  disabled,
  onClick,
  icon: Icon,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  icon: ComponentType
}) {
  return (
    <Button
      variant="secondary"
      size="icon-xs"
      aria-label={label}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled) onClick()
      }}
      className={cn(
        "rounded-full",
        disabled && "opacity-40 hover:bg-foreground/5 active:scale-100",
      )}
    >
      <Icon />
    </Button>
  )
}

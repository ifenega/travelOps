import { FaceSmile, HeartHand, User01, Users01 } from "@untitledui/icons"
import { cn } from "@/shared/lib/utils"
import { ResponsivePopover } from "@/shared/ui/responsive-popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Stepper } from "@/shared/ui/stepper"
import { formatTravellers, maxSeatedTravellers, type Travellers } from "../../search"
import {
  segmentClassName,
  segmentLabelClassName,
  segmentPlaceholderClassName,
  segmentValueClassName,
} from "./segment"

const defaultTravellers: Travellers = { adults: 1, childAges: [], infants: 0, pets: 0 }
const childAgeOptions = Array.from({ length: 16 }, (_, index) => index + 2) // 2–17

type TravellersFieldProps = {
  id: string
  /** "Passengers" for flights and trains, "Guests" for stays. */
  label: string
  value: Travellers | null
  onChange: (travellers: Travellers) => void
  invalid?: boolean
  describedBy?: string
}

// "Passengers" / "Guests": counters for adults, children (each with an age), infants and pets.
export function TravellersField({
  id,
  label,
  value,
  onChange,
  invalid,
  describedBy,
}: TravellersFieldProps) {
  const travellers = value ?? defaultTravellers
  const { adults, childAges, infants, pets } = travellers
  const text = value ? formatTravellers(value) : undefined

  function update(change: Partial<Travellers>) {
    onChange({ ...travellers, ...change })
  }

  function setChildCount(count: number) {
    // Keep the ages already chosen; new children start without an age.
    update({ childAges: Array.from({ length: count }, (_, index) => childAges[index] ?? null) })
  }

  function setChildAge(index: number, age: number) {
    update({ childAges: childAges.map((current, i) => (i === index ? age : current)) })
  }

  return (
    <ResponsivePopover
      title={label}
      align="end"
      contentClassName="flex w-80 flex-col gap-4"
      // Opening it the first time counts as "1 adult", like the Figma.
      onOpenChange={(open) => open && !value && onChange(defaultTravellers)}
      trigger={
        <button
          id={id}
          type="button"
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={segmentClassName}
        >
          <span className={cn(segmentLabelClassName, invalid && "text-error-700")}>
            {label}
            <span className="sr-only">,</span>
          </span>
          <span className={cn(segmentValueClassName, !text && segmentPlaceholderClassName)}>
            {text ?? `Add ${label.toLowerCase()}`}
          </span>
        </button>
      }
    >
      <Stepper
        label="Adults"
        description="Ages 18+"
        icon={Users01}
        unit="adult"
        value={adults}
        // Fewer adults can't hold more infants.
        onChange={(next) => update({ adults: next, infants: Math.min(infants, next) })}
        min={1}
        max={maxSeatedTravellers - childAges.length}
      />
      <Stepper
        label="Children"
        description="Ages 2–17"
        icon={User01}
        unit="child"
        value={childAges.length}
        onChange={setChildCount}
        max={maxSeatedTravellers - adults}
      />
      {childAges.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs">
            {childAges.length === 1
              ? "Please select the age of your child."
              : "Please select the ages of your children."}
          </p>
          <div className="flex flex-wrap gap-2">
            {childAges.map((age, index) => {
              const name = `Child ${index + 1} age`
              return (
                <Select
                  // biome-ignore lint/suspicious/noArrayIndexKey: children have no id; their position ("Child 2") is who they are
                  key={index}
                  value={age === null ? "" : String(age)}
                  onValueChange={(next) => setChildAge(index, Number(next))}
                >
                  <SelectTrigger aria-label={name} className="min-w-32">
                    <SelectValue placeholder={name} />
                  </SelectTrigger>
                  <SelectContent aria-label={name}>
                    {childAgeOptions.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option} years old
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            })}
          </div>
        </div>
      )}
      <Stepper
        label="Infants"
        description="Under 2, on an adult's lap"
        icon={FaceSmile}
        unit="infant"
        value={infants}
        onChange={(next) => update({ infants: next })}
        max={adults}
      />
      <Stepper
        label="Pets"
        description="Bringing a service animal?"
        icon={HeartHand}
        unit="pet"
        value={pets}
        onChange={(next) => update({ pets: next })}
        max={2}
      />
    </ResponsivePopover>
  )
}

import {
  ChevronDown,
  Clock,
  FileCheck02,
  LayersThree01,
  Plane,
  Route,
  SwitchVertical01,
} from "@untitledui/icons"
import type { ComponentType } from "react"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import type { ResultsFilters as Filters } from "../search-params"
import type { Airline } from "../types"
import { cabinLabels } from "../types"

// The filter row above the results (design screen 16): stops, airlines, departure time, cabin,
// travel policy and sort. Every change goes into the URL, so it survives a refresh.

const options = {
  stops: { any: "Any stops", "0": "Nonstop", "1": "1 stop or fewer" },
  time: {
    any: "Any time",
    morning: "Morning (5am–12pm)",
    afternoon: "Afternoon (12–6pm)",
    evening: "Evening (6pm–12am)",
    night: "Night (12–5am)",
  },
  cabin: cabinLabels,
  policy: { any: "Any policy", within: "Within policy" },
  sort: { best: "Best", cheapest: "Cheapest", fastest: "Fastest", earliest: "Earliest departure" },
}

export function ResultsFilters({
  filters,
  airlines,
  onChange,
}: {
  filters: Filters
  /** The airlines in the results, for the Airlines filter. */
  airlines: Airline[]
  onChange: (changes: Partial<Filters>) => void
}) {
  return (
    // Scrolls sideways on phones instead of wrapping into a tall block.
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      <FilterSelect
        label="Stops"
        icon={Route}
        value={filters.stops}
        options={options.stops}
        onChange={(stops) => onChange({ stops })}
      />
      <AirlinesFilter
        airlines={airlines}
        selected={filters.airlines}
        onChange={(codes) => onChange({ airlines: codes })}
      />
      <FilterSelect
        label="Departure time"
        icon={Clock}
        value={filters.time}
        options={options.time}
        onChange={(time) => onChange({ time })}
      />
      <FilterSelect
        label="Cabin"
        icon={LayersThree01}
        value={filters.cabin}
        options={options.cabin}
        onChange={(cabin) => onChange({ cabin })}
      />
      <FilterSelect
        label="Travel policy"
        icon={FileCheck02}
        value={filters.policy}
        options={options.policy}
        onChange={(policy) => onChange({ policy })}
      />
      <FilterSelect
        label="Sort by"
        icon={SwitchVertical01}
        value={filters.sort}
        options={options.sort}
        onChange={(sort) => onChange({ sort })}
      />
    </div>
  )
}

function FilterSelect<Value extends string>({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: {
  label: string
  icon: ComponentType<{ className?: string }>
  value: Value
  options: Record<Value, string>
  onChange: (value: Value) => void
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as Value)}>
      <SelectTrigger variant="outline" aria-label={label} className="shrink-0">
        <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent aria-label={label}>
        {(Object.entries(options) as [Value, string][]).map(([option, text]) => (
          <SelectItem key={option} value={option}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function AirlinesFilter({
  airlines,
  selected,
  onChange,
}: {
  airlines: Airline[]
  selected: string[]
  onChange: (codes: string[]) => void
}) {
  const label = selected.length === 0 ? "Airlines" : `Airlines (${selected.length})`
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0 font-normal">
          <Plane aria-hidden="true" className="size-4 text-muted-foreground" />
          {label}
          <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <fieldset>
          <legend className="px-2 py-1 font-medium text-sm">Airlines</legend>
          {airlines.map((airline) => {
            const checked = selected.includes(airline.code)
            return (
              <label
                key={airline.code}
                htmlFor={`airline-${airline.code}`}
                className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-foreground/5"
              >
                <Checkbox
                  id={`airline-${airline.code}`}
                  checked={checked}
                  onCheckedChange={() =>
                    onChange(
                      checked
                        ? selected.filter((code) => code !== airline.code)
                        : [...selected, airline.code],
                    )
                  }
                />
                {airline.name}
              </label>
            )
          })}
          {selected.length > 0 && (
            <Button variant="ghost" size="sm" className="mt-1 w-full" onClick={() => onChange([])}>
              Show all airlines
            </Button>
          )}
        </fieldset>
      </PopoverContent>
    </Popover>
  )
}

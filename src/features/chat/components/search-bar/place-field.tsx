import { MarkerPin01, Plane, Train } from "@untitledui/icons"
import { useState } from "react"
import { cn } from "@/shared/lib/utils"
import { Combobox } from "@/shared/ui/combobox"
import { usePlaces } from "../../hooks/use-places"
import type { Place, TravelMode } from "../../search"
import { segmentClassName, segmentLabelClassName, segmentValueClassName } from "./segment"

const kindIcons = { airport: Plane, city: MarkerPin01, station: Train }

type PlaceFieldProps = {
  id: string
  label: string
  placeholder: string
  mode: TravelMode
  value: Place | null
  onChange: (place: Place | null) => void
  invalid?: boolean
  describedBy?: string
}

// "From", "To" or "Where": type to search airports, cities or stations (depending on the mode).
export function PlaceField({
  id,
  label,
  placeholder,
  mode,
  value,
  onChange,
  invalid,
  describedBy,
}: PlaceFieldProps) {
  const [query, setQuery] = useState("")
  const { data: places = [], isFetching } = usePlaces(query, mode)

  return (
    <Combobox
      id={id}
      label={label}
      items={query.trim() ? places : []}
      itemToString={(place) => place?.name ?? ""}
      itemToKey={(place) => place.id}
      renderItem={(place) => <PlaceOption place={place} />}
      selectedItem={value}
      onSelectedItemChange={onChange}
      onInputValueChange={setQuery}
      placeholder={placeholder}
      emptyMessage="No places match"
      isLoading={isFetching}
      invalid={invalid}
      describedBy={describedBy}
      className={segmentClassName}
      labelClassName={cn(segmentLabelClassName, invalid && "text-error-700")}
      inputClassName={segmentValueClassName}
    />
  )
}

function PlaceOption({ place }: { place: Place }) {
  const Icon = kindIcons[place.kind]
  return (
    <div className="flex items-start gap-2.5">
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-col">
        <span>
          {place.name}
          <span className="sr-only"> ({place.kind})</span>
        </span>
        <span className="text-muted-foreground text-xs">{place.region}</span>
      </div>
    </div>
  )
}

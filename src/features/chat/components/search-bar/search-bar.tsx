import { Building02, Plane, Train } from "@untitledui/icons"
import { useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group"
import type { SearchRequest, SearchValues, TravelMode } from "../../search"
import { SearchForm } from "./search-form"

const emptyValues: SearchValues = {
  origin: null,
  destination: null,
  dates: undefined,
  travellers: null,
}

// "Flights · Trains · Stays". Picking one shows its search form; picking it again hides it.
// Dates and travellers carry over between modes; places don't (airports aren't stations).
export function SearchBar({ onSearch }: { onSearch: (request: SearchRequest) => void }) {
  const [mode, setMode] = useState<TravelMode | "">("")
  const [values, setValues] = useState<SearchValues>(emptyValues)

  function changeMode(next: string) {
    setMode(next as TravelMode | "")
    setValues((current) => ({ ...current, origin: null, destination: null }))
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <ToggleGroup type="single" value={mode} onValueChange={changeMode} aria-label="Search for">
        <ToggleGroupItem value="flights">
          Flights <Plane aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="trains">
          Trains <Train aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="stays">
          Stays <Building02 aria-hidden="true" />
        </ToggleGroupItem>
      </ToggleGroup>
      {mode && (
        // Keyed by mode so a validation message from one mode doesn't linger in another.
        <SearchForm
          key={mode}
          mode={mode}
          values={values}
          onChange={setValues}
          onSearch={onSearch}
        />
      )}
    </div>
  )
}

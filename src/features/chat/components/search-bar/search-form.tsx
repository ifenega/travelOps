import { AlertCircle, SearchLg, SwitchHorizontal01 } from "@untitledui/icons"
import { type FormEvent, useId, useState } from "react"
import { Button } from "@/shared/ui/button"
import {
  type SearchField,
  type SearchRequest,
  type SearchValues,
  type TravelMode,
  validateSearch,
} from "../../search"
import { DatesField } from "./dates-field"
import { PlaceField } from "./place-field"
import { TravellersField } from "./travellers-field"

type SearchFormProps = {
  mode: TravelMode
  values: SearchValues
  onChange: (values: SearchValues) => void
  onSearch: (request: SearchRequest) => void
}

// The bar under "Flights · Trains · Stays". All fields are custom pickers, so it uses plain state
// plus the Zod rules in search.ts rather than React Hook Form (nothing here is typed field by field).
export function SearchForm({ mode, values, onChange, onSearch }: SearchFormProps) {
  const formId = useId()
  const errorId = `${formId}-error`
  const fieldId = (field: SearchField) => `${formId}-${field}`
  const [error, setError] = useState<{ field: SearchField; message: string } | null>(null)
  const [announcement, setAnnouncement] = useState("")

  function update(change: Partial<SearchValues>) {
    const next = { ...values, ...change }
    onChange(next)
    // After a failed search, keep the message current as things get fixed.
    if (error) setError(validateSearch(mode, next).error ?? null)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const result = validateSearch(mode, values)
    if (result.error) {
      setError(result.error)
      document.getElementById(fieldId(result.error.field))?.focus()
      return
    }
    setError(null)
    onSearch(result.request)
  }

  function swap() {
    update({ origin: values.destination, destination: values.origin })
    setAnnouncement(
      `Swapped. From ${values.destination?.name ?? "not set"}, to ${values.origin?.name ?? "not set"}.`,
    )
  }

  const fieldProps = (field: SearchField) => ({
    id: fieldId(field),
    invalid: error?.field === field,
    describedBy: error?.field === field ? errorId : undefined,
  })

  return (
    <form onSubmit={submit} noValidate aria-label={`Search ${mode}`} className="w-full">
      <div className="flex flex-col rounded-xl border bg-background shadow-xs md:flex-row md:items-stretch md:p-1">
        {mode === "stays" ? (
          <PlaceField
            {...fieldProps("destination")}
            label="Where"
            placeholder="City or area…"
            mode={mode}
            value={values.destination}
            onChange={(destination) => update({ destination })}
          />
        ) : (
          <>
            <PlaceField
              {...fieldProps("origin")}
              label="From"
              placeholder={mode === "flights" ? "Departure city…" : "Departure station…"}
              mode={mode}
              value={values.origin}
              onChange={(origin) => update({ origin })}
            />
            <div className="relative flex flex-col justify-center md:flex-row">
              <Divider />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Swap from and to"
                onClick={swap}
                className="absolute top-1/2 right-3 -translate-y-1/2 bg-background md:right-auto md:left-1/2 md:-translate-x-1/2"
              >
                <SwitchHorizontal01 className="max-md:rotate-90" />
              </Button>
            </div>
            <PlaceField
              {...fieldProps("destination")}
              label="To"
              placeholder={mode === "flights" ? "Destination city…" : "Destination station…"}
              mode={mode}
              value={values.destination}
              onChange={(destination) => update({ destination })}
            />
          </>
        )}
        <Divider />
        <DatesField
          {...fieldProps("dates")}
          value={values.dates}
          onChange={(dates) => update({ dates })}
        />
        <Divider />
        <TravellersField
          {...fieldProps("travellers")}
          label={mode === "stays" ? "Guests" : "Passengers"}
          value={values.travellers}
          onChange={(travellers) => update({ travellers })}
        />
        <div className="flex items-center p-2 md:p-1">
          <Button type="submit" className="w-full md:size-9 md:rounded-full md:p-0">
            <SearchLg className="size-4" />
            <span className="md:sr-only">Search {mode}</span>
          </Button>
        </div>
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 flex items-start gap-1.5 text-error-700 text-sm"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error.message}
        </p>
      )}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </form>
  )
}

/** A thin line between fields: vertical in the bar, horizontal when stacked on phones. */
function Divider() {
  return (
    <span
      aria-hidden="true"
      className="mx-3 h-px shrink-0 bg-border md:mx-0 md:my-2 md:h-auto md:w-px md:self-stretch"
    />
  )
}

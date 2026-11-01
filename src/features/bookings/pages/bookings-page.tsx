import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { SearchLg, Stars02 } from "@untitledui/icons"
import { useEffect, useRef, useState } from "react"
import { Banner } from "@/shared/ui/banner"
import { Button } from "@/shared/ui/button"
import { Page } from "@/shared/ui/page"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group"
import { TripGrid } from "../components/trip-grid"
import { statusLabel } from "../components/trip-status-badge"
import { useTrips } from "../hooks/use-bookings"
import type { BookingsSearch } from "../search-params"
import { type TripOwner, type TripStatus, tripStatusSchema } from "../types"
import { filterTrips } from "../utils/filter-trips"
import { pluralize } from "../utils/format"

const owners: { value: TripOwner; label: string }[] = [
  { value: "mine", label: "My bookings" },
  { value: "team", label: "Team bookings" },
]

/** Past trips are all paid, so the status filter only offers the upcoming statuses. */
const upcomingStatuses = tripStatusSchema.options.filter((s) => s !== "paid")

export function BookingsPage() {
  const search = useSearch({ from: "/bookings" })
  const navigate = useNavigate({ from: "/bookings" })
  const trips = useTrips(search.when)
  // Only announce result counts after the user changes something, not on page load.
  const [changed, setChanged] = useState(false)

  function update(changes: Partial<BookingsSearch>, { replace = false } = {}) {
    setChanged(true)
    navigate({ search: (previous) => ({ ...previous, ...changes }), replace })
  }

  const all = trips.data ?? []
  const visible = filterTrips(all, { owner: search.owner, status: search.status, q: search.q })
  const filtering = Boolean(search.status || search.q)

  return (
    <Page
      title="Bookings"
      breadcrumbs={[{ label: "Home", to: "/chat", icon: Stars02 }, { label: "Bookings" }]}
    >
      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <div>
          <h1 className="font-semibold text-3xl">Bookings</h1>
          <p className="mt-1 text-muted-foreground">
            Your trips and your team's trips, in one place.
          </p>
        </div>

        <Tabs value={search.owner} onValueChange={(owner) => update({ owner: owner as TripOwner })}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList aria-label="Whose bookings">
                {owners.map(({ value, label }) => {
                  const count = filterTrips(all, { owner: value }).length
                  return (
                    <TabsTrigger
                      key={value}
                      value={value}
                      // "My bookings 4 trips": the visible text, then what the number means.
                      aria-label={
                        trips.isSuccess
                          ? `${label} ${count} ${count === 1 ? "trip" : "trips"}`
                          : undefined
                      }
                    >
                      {label}{" "}
                      {trips.isSuccess && <span className="text-muted-foreground">{count}</span>}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <TripSearch
                  value={search.q ?? ""}
                  onChange={(q) => update({ q: q || undefined }, { replace: true })}
                />
                {search.when === "upcoming" && (
                  <StatusFilter value={search.status} onChange={(status) => update({ status })} />
                )}
              </div>
            </div>
            <ToggleGroup
              type="single"
              value={search.when}
              // Picking the selected one again would clear it; there's always a choice here.
              onValueChange={(when) =>
                when && update({ when: when as BookingsSearch["when"], status: undefined })
              }
              aria-label="When"
              className="self-start"
            >
              <ToggleGroupItem value="upcoming">Upcoming</ToggleGroupItem>
              <ToggleGroupItem value="past">Past</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {owners.map(({ value }) => (
            <TabsContent key={value} value={value} className="mt-5">
              {trips.isPending ? (
                <LoadingGrid />
              ) : trips.isError ? (
                <Banner variant="error" title="Couldn't load your trips">
                  <p>Check your connection and try again.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => trips.refetch()}
                  >
                    Try again
                  </Button>
                </Banner>
              ) : visible.length > 0 ? (
                <TripGrid trips={visible} shareableTrips={filterTrips(all, { owner: "mine" })} />
              ) : filtering ? (
                <EmptyState title="No trips match">
                  <Button
                    variant="outline"
                    onClick={() => update({ status: undefined, q: undefined })}
                  >
                    Clear filters
                  </Button>
                </EmptyState>
              ) : (
                <EmptyState
                  title={
                    search.when === "past"
                      ? "No past trips"
                      : value === "team"
                        ? "Your team has no upcoming trips"
                        : "No upcoming trips"
                  }
                >
                  {search.when === "upcoming" && value === "mine" && (
                    <Button asChild>
                      <Link to="/chat">Plan a trip</Link>
                    </Button>
                  )}
                </EmptyState>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <p aria-live="polite" className="sr-only">
          {changed && trips.isSuccess
            ? visible.length > 0
              ? pluralize(visible.length, "trip")
              : "No trips match"
            : ""}
        </p>
      </div>
    </Page>
  )
}

/** Search as you type. The URL updates once typing pauses, so history isn't flooded. */
function TripSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [text, setText] = useState(value)
  // Refs, so the timer below restarts only when the user types, not when the URL catches up.
  const latest = useRef({ value, onChange })
  latest.current = { value, onChange }

  // When the URL changes from elsewhere (Clear filters, Back), show its value.
  useEffect(() => setText(value), [value])

  useEffect(() => {
    if (text === latest.current.value) return
    const timer = setTimeout(() => latest.current.onChange(text), 250)
    return () => clearTimeout(timer)
  }, [text])

  return (
    <label className="relative flex min-w-0 flex-1 items-center sm:w-48 sm:flex-none">
      <SearchLg
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground"
      />
      <input
        type="search"
        aria-label="Search trips"
        placeholder="Search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="h-9 w-full min-w-0 rounded-lg bg-transparent pr-2 pl-8 text-base outline-none transition-colors duration-150 placeholder:text-muted-foreground hover:bg-foreground/5 focus:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:h-11 md:text-sm"
      />
    </label>
  )
}

function StatusFilter({
  value,
  onChange,
}: {
  value: TripStatus | undefined
  onChange: (status: TripStatus | undefined) => void
}) {
  return (
    <Select
      value={value ?? "all"}
      onValueChange={(next) => onChange(next === "all" ? undefined : (next as TripStatus))}
    >
      <SelectTrigger variant="outline" aria-label="Status" className="shrink-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent aria-label="Status" align="end">
        <SelectItem value="all">All status</SelectItem>
        {upcomingStatuses.map((status) => (
          <SelectItem key={status} value={status}>
            {statusLabel(status)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-16 text-center">
      <h2 className="font-medium">{title}</h2>
      {children}
    </div>
  )
}

/** Grey placeholders in the shape of the cards. Not animated (CLAUDE.md: no motion on load). */
function LoadingGrid() {
  return (
    <div
      role="status"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <span className="sr-only">Loading trips</span>
      {[1, 2, 3, 4].map((key) => (
        <div key={key} aria-hidden="true" className="overflow-hidden rounded-xl border">
          <div className="aspect-5/4 bg-muted" />
          <div className="flex flex-col gap-2 p-3">
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

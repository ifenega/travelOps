import { Banner } from "@/shared/ui/banner"
import { Button } from "@/shared/ui/button"
import { useFlightResults } from "../hooks/use-flights"
import { type ResultsFilters as Filters, resultsFiltersDefaults } from "../search-params"
import type { Fare, FlightSearch, Leg } from "../types"
import { FlightCard } from "./flight-card"
import { Pagination } from "./pagination"
import { ResultsFilters } from "./results-filters"

/** The filters, one page of flight cards, and the pages (design screens 16 and 19). */
export function FlightResults({
  search,
  leg,
  filters,
  departingFarePrice,
  onFiltersChange,
  onSelectFare,
}: {
  search: FlightSearch
  leg: Leg
  filters: Filters
  departingFarePrice?: number
  onFiltersChange: (changes: Partial<Filters>) => void
  onSelectFare: (fare: Fare) => void
}) {
  const results = useFlightResults(search, leg, filters, departingFarePrice)

  return (
    <div className="flex flex-col gap-4">
      <ResultsFilters
        filters={filters}
        airlines={results.data?.airlines ?? []}
        // A new filter starts again from the first page.
        onChange={(changes) => onFiltersChange({ ...changes, page: 1 })}
      />

      {results.isPending ? (
        <div role="status" className="flex flex-col gap-3">
          <span className="sr-only">Loading flights…</span>
          {[1, 2, 3].map((row) => (
            <div key={row} className="h-36 rounded-xl border bg-muted" />
          ))}
        </div>
      ) : results.isError ? (
        <Banner variant="error" title="We couldn't load flights">
          <p>Check your connection and try again.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => results.refetch()}>
            Try again
          </Button>
        </Banner>
      ) : results.data.total === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">No flights match these filters</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFiltersChange({ ...resultsFiltersDefaults, cabin: filters.cabin })}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          {/* Read out when the results change, e.g. after a filter. */}
          <p role="status" className="text-muted-foreground text-sm">
            <span className="font-medium text-foreground">{results.data.flights.length}</span> of{" "}
            {results.data.total} results
          </p>
          <ul
            aria-busy={results.isFetching}
            className="flex flex-col gap-3 transition-opacity duration-150 aria-busy:opacity-60"
          >
            {results.data.flights.map((flight) => (
              <li key={flight.id}>
                <FlightCard flight={flight} onSelectFare={onSelectFare} />
              </li>
            ))}
          </ul>
          <Pagination
            page={filters.page}
            pageCount={results.data.pageCount}
            onPageChange={(page) => onFiltersChange({ page })}
          />
        </>
      )}
    </div>
  )
}

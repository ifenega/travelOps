import { SearchLg, XCircle } from "@untitledui/icons"
import { useEffect, useRef, useState } from "react"

/**
 * "🔍 Search" from the Figma, with a ⓧ to clear it. It reports the text once typing pauses, so a
 * page that keeps it in the URL doesn't flood the history. Announce the result count elsewhere
 * (e.g. the pagination's "6 results").
 */
export function SearchInput({
  label,
  value,
  onChange,
}: {
  /** Accessible name, e.g. "Search members". */
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [text, setText] = useState(value)
  const input = useRef<HTMLInputElement>(null)
  // Refs, so the timer below restarts only when the user types, not when the URL catches up.
  const latest = useRef({ value, onChange })
  latest.current = { value, onChange }

  // When the URL changes from elsewhere (Back, a "Clear search" button), show its value.
  useEffect(() => setText(value), [value])

  useEffect(() => {
    if (text === latest.current.value) return
    const timer = setTimeout(() => latest.current.onChange(text), 250)
    return () => clearTimeout(timer)
  }, [text])

  return (
    <div className="relative flex min-w-0 flex-1 items-center sm:w-56 sm:flex-none">
      <SearchLg
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground"
      />
      <input
        ref={input}
        type="search"
        aria-label={label}
        placeholder="Search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="h-9 w-full min-w-0 rounded-lg bg-transparent pr-8 pl-8 text-base outline-none transition-colors duration-150 placeholder:text-muted-foreground hover:bg-foreground/5 focus:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:h-11 md:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setText("")
            onChange("")
            input.current?.focus()
          }}
          className="absolute right-1.5 flex size-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <XCircle aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  )
}

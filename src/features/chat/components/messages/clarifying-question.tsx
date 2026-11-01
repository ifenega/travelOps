import { ChevronLeft, ChevronRight, SearchLg } from "@untitledui/icons"
import { useEffect, useId, useRef, useState } from "react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import type { Question, QuestionOption } from "../../chat"

const pageSize = 5

type ClarifyingQuestionProps = {
  question: Question
  onAnswer: (option: QuestionOption) => void
  onDismiss: () => void
}

// Sparky asking for one missing detail (design screen 14). It takes the prompt input's place:
// search the options, pick one, then Next. Dismiss brings the prompt input back.
export function ClarifyingQuestion({ question, onAnswer, onDismiss }: ClarifyingQuestionProps) {
  const headingId = useId()
  const searchRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<QuestionOption | null>(null)

  const text = query.trim().toLowerCase()
  const matches = question.options.filter((option) =>
    `${option.label} ${option.description ?? ""}`.toLowerCase().includes(text),
  )
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize))
  const visible = matches.slice(page * pageSize, page * pageSize + pageSize)

  // This card replaces the prompt input. If focus was there, it would be lost: move it here.
  useEffect(() => {
    if (document.activeElement === document.body) searchRef.current?.focus()
  }, [])

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-xl border bg-background p-3 dark:bg-gray-900 shadow-xs"
    >
      <h2 id={headingId} className="font-medium text-sm">
        {question.prompt}
      </h2>
      <label className="flex items-center gap-2 rounded-lg border px-3 has-[input:focus]:border-primary-500 has-[input:focus]:ring-4 has-[input:focus]:ring-primary-600/15">
        <SearchLg aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <span className="sr-only">{question.searchLabel}</span>
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(0)
          }}
          placeholder={`${question.searchLabel}…`}
          enterKeyHint="search"
          className="h-10 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-gray-600 pointer-fine:text-sm"
        />
      </label>

      {visible.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {visible.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                aria-pressed={selected?.id === option.id}
                onClick={() => setSelected(option)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg bg-muted px-3 py-2 text-left text-sm pointer-coarse:min-h-11",
                  "transition-colors duration-150 hover:bg-foreground/10 aria-pressed:bg-primary-50 aria-pressed:text-primary-800 dark:aria-pressed:bg-primary-600/20 dark:aria-pressed:text-primary-200",
                  "focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2",
                )}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="truncate text-muted-foreground text-xs">
                      {option.description}
                    </span>
                  )}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-1 text-muted-foreground text-sm">No matches. Try another name.</p>
      )}

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Previous page"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-6 text-center text-sm tabular-nums">
            {page + 1}
            <span className="sr-only"> of {pageCount}</span>
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Next page"
            disabled={page >= pageCount - 1}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={onDismiss}>
          Dismiss
        </Button>
        <Button
          size="sm"
          aria-disabled={!selected}
          onClick={() => selected && onAnswer(selected)}
          className="rounded-full aria-disabled:opacity-50"
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </section>
  )
}

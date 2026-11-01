import { useCombobox } from "downshift"
import type { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"
import { popoverSurfaceClassName } from "./popover"

type ComboboxProps<T> = {
  label: string
  /** The options for what's typed so far. The parent does the searching. */
  items: T[]
  itemToString: (item: T | null) => string
  itemToKey: (item: T) => string
  /** How an option looks in the list. Defaults to its text. */
  renderItem?: (item: T) => ReactNode
  selectedItem: T | null
  onSelectedItemChange: (item: T | null) => void
  onInputValueChange?: (value: string) => void
  placeholder?: string
  /** Shown (and announced) when there's text but nothing matches. */
  emptyMessage?: string
  className?: string
  labelClassName?: string
  inputClassName?: string
}

// An autocomplete input, e.g. "From: Departure city…" in the search bar.
// Downshift supplies the ARIA combobox pattern: arrow keys move, Enter picks, Esc closes.
export function Combobox<T>({
  label,
  items,
  itemToString,
  itemToKey,
  renderItem = (item) => itemToString(item),
  selectedItem,
  onSelectedItemChange,
  onInputValueChange,
  placeholder,
  emptyMessage = "No matches",
  className,
  labelClassName,
  inputClassName,
}: ComboboxProps<T>) {
  const {
    isOpen,
    inputValue,
    highlightedIndex,
    getLabelProps,
    getInputProps,
    getMenuProps,
    getItemProps,
  } = useCombobox({
    items,
    itemToString,
    itemToKey: (item) => (item ? itemToKey(item) : ""),
    selectedItem,
    onSelectedItemChange: ({ selectedItem }) => onSelectedItemChange(selectedItem ?? null),
    onInputValueChange: ({ inputValue }) => onInputValueChange?.(inputValue ?? ""),
  })

  const labelProps = getLabelProps()
  const showList = isOpen && items.length > 0
  const showEmpty = isOpen && items.length === 0 && inputValue.trim() !== ""
  const status = !isOpen
    ? ""
    : items.length > 0
      ? `${items.length} ${items.length === 1 ? "result" : "results"} available`
      : showEmpty
        ? emptyMessage
        : ""

  return (
    <div className={cn("relative", className)}>
      <label
        id={labelProps.id}
        htmlFor={labelProps.htmlFor}
        className={cn("text-sm", labelClassName)}
      >
        {label}
      </label>
      <input
        {...getInputProps({ placeholder })}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={cn(
          "w-full min-w-0 bg-transparent text-base outline-none placeholder:text-gray-600",
          inputClassName,
        )}
      />
      {/* The list must always be in the DOM for Downshift; it's hidden when there's nothing to show. */}
      <ul
        {...getMenuProps()}
        className={cn(
          popoverSurfaceClassName,
          "absolute top-full left-0 mt-2 max-h-72 w-max min-w-full max-w-[min(22rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain p-1",
          showList ? "animate-popover-in" : "hidden",
        )}
      >
        {showList &&
          items.map((item, index) => (
            <li
              key={itemToKey(item)}
              {...getItemProps({ item, index })}
              className={cn(
                "cursor-default rounded-md px-2 py-1.5 text-sm",
                highlightedIndex === index && "bg-foreground/5",
              )}
            >
              {renderItem(item)}
            </li>
          ))}
      </ul>
      {showEmpty && (
        <p
          className={cn(
            popoverSurfaceClassName,
            "absolute top-full left-0 mt-2 min-w-full px-3 py-2 text-muted-foreground text-sm",
          )}
        >
          {emptyMessage}
        </p>
      )}
      <span aria-live="polite" className="sr-only">
        {status}
      </span>
    </div>
  )
}

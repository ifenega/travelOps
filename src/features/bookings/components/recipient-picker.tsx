import { ChevronDown, XClose } from "@untitledui/icons"
import { useCombobox, useMultipleSelection } from "downshift"
import { useState } from "react"
import { cn } from "@/shared/lib/utils"
import { Avatar } from "@/shared/ui/avatar"
import { popoverSurfaceClassName } from "@/shared/ui/popover"
import type { TeamMember } from "../types"

type RecipientPickerProps = {
  members: TeamMember[]
  selected: TeamMember[]
  onChange: (selected: TeamMember[]) => void
}

// "Select email" in Share trip: type to find team members, pick several, and they show as chips.
// Downshift supplies the ARIA combobox pattern (arrow keys, Enter picks, Esc closes) and the chip
// keys (Backspace in an empty input removes the last chip; arrow keys move between chips).
// It stays in this feature until a second one needs it (Invite members probably will).
export function RecipientPicker({ members, selected, onChange }: RecipientPickerProps) {
  const [inputValue, setInputValue] = useState("")

  const query = inputValue.trim().toLowerCase()
  const items = members.filter(
    (member) =>
      !selected.some((s) => s.id === member.id) &&
      (member.name.toLowerCase().includes(query) || member.email.toLowerCase().includes(query)),
  )

  const { getSelectedItemProps, getDropdownProps, removeSelectedItem } = useMultipleSelection({
    selectedItems: selected,
    itemToKey: (member) => member?.id ?? "",
    onSelectedItemsChange: ({ selectedItems }) => onChange(selectedItems ?? []),
  })

  const {
    isOpen,
    highlightedIndex,
    getLabelProps,
    getInputProps,
    getMenuProps,
    getItemProps,
    getToggleButtonProps,
  } = useCombobox({
    items,
    itemToString: (member) => member?.name ?? "",
    itemToKey: (member) => member?.id ?? "",
    inputValue,
    selectedItem: null,
    defaultHighlightedIndex: 0,
    // After picking someone, keep the list open and clear the text, ready for the next person.
    stateReducer: (state, { changes, type }) => {
      if (
        type === useCombobox.stateChangeTypes.InputKeyDownEnter ||
        type === useCombobox.stateChangeTypes.ItemClick
      ) {
        return {
          ...changes,
          isOpen: true,
          highlightedIndex: state.highlightedIndex,
          inputValue: "",
        }
      }
      return changes
    },
    onStateChange: ({ type, selectedItem, inputValue: next }) => {
      if (
        (type === useCombobox.stateChangeTypes.InputKeyDownEnter ||
          type === useCombobox.stateChangeTypes.ItemClick) &&
        selectedItem
      ) {
        onChange([...selected, selectedItem])
        setInputValue("")
      }
      if (type === useCombobox.stateChangeTypes.InputChange) setInputValue(next ?? "")
    },
  })

  const labelProps = getLabelProps()
  const status = !isOpen
    ? ""
    : items.length > 0
      ? `${items.length} ${items.length === 1 ? "person" : "people"} available`
      : "No one else to add"

  return (
    <div className="relative">
      <label id={labelProps.id} htmlFor={labelProps.htmlFor} className="sr-only">
        Send to
      </label>
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border bg-background py-1 pr-1 pl-2 shadow-xs focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-600/15">
        {selected.map((member, index) => (
          <span
            key={member.id}
            {...getSelectedItemProps({ selectedItem: member, index })}
            className="flex items-center gap-1 rounded-md bg-foreground/5 py-0.5 pr-0.5 pl-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-ring"
          >
            {member.name}
            <button
              type="button"
              tabIndex={-1}
              aria-label={`Remove ${member.name}`}
              onClick={(event) => {
                event.stopPropagation()
                removeSelectedItem(member)
              }}
              className="rounded-sm p-0.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
            >
              <XClose aria-hidden="true" className="size-3.5" />
            </button>
          </span>
        ))}
        <input
          {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
          placeholder={selected.length === 0 ? "Select email" : ""}
          autoComplete="off"
          className="min-w-24 flex-1 bg-transparent py-1 text-base outline-none placeholder:text-gray-600 md:text-sm"
        />
        <button
          type="button"
          aria-label="Show team members"
          {...getToggleButtonProps()}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5"
        >
          <ChevronDown aria-hidden="true" className="size-4" />
        </button>
      </div>

      {/*
       * The list must always be in the DOM for Downshift; it's hidden when closed. It sits in the
       * flow (not floating) so the dialog's scroll area can't clip it, on any screen size.
       */}
      <ul
        {...getMenuProps()}
        className={cn(
          popoverSurfaceClassName,
          "mt-1 max-h-60 origin-top overflow-y-auto overscroll-contain p-1",
          isOpen ? "animate-popover-in" : "hidden",
        )}
      >
        {isOpen && (
          <li role="presentation" className="px-2 pt-1 pb-1.5 text-muted-foreground text-xs">
            Select email
          </li>
        )}
        {isOpen &&
          items.map((member, index) => (
            <li
              key={member.id}
              {...getItemProps({ item: member, index })}
              className={cn(
                "flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm pointer-coarse:min-h-11",
                highlightedIndex === index && "bg-foreground/5",
              )}
            >
              <Avatar name={member.name} src={member.avatarUrl} className="size-7" />
              <span className="min-w-0">
                <span className="block truncate">{member.name}</span>
                <span className="block truncate text-muted-foreground text-xs">{member.email}</span>
              </span>
            </li>
          ))}
        {isOpen && items.length === 0 && (
          <li role="presentation" className="px-2 py-1.5 text-muted-foreground text-sm">
            No one else to add
          </li>
        )}
      </ul>
      <span aria-live="polite" className="sr-only">
        {status}
      </span>
    </div>
  )
}

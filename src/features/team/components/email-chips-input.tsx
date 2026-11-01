import { XClose } from "@untitledui/icons"
import { useRef, useState } from "react"
import { cn } from "@/shared/lib/utils"
import { addEmails, isValidEmail } from "../utils/emails"

type EmailChipsInputProps = {
  value: string[]
  onChange: (emails: string[]) => void
  onBlur?: () => void
  /** From <Field>: id, aria-invalid, aria-describedby. */
  id?: string
  "aria-invalid"?: true
  "aria-describedby"?: string
  placeholder?: string
}

// "Email" in Add members: type or paste emails; a comma, space, Enter or leaving the field turns
// them into chips. Invalid ones stay as red chips, said in words too, so they can be fixed.
// Backspace in an empty field removes the last chip.
export function EmailChipsInput({
  value,
  onChange,
  onBlur,
  placeholder = "Enter emails",
  ...fieldProps
}: EmailChipsInputProps) {
  const [text, setText] = useState("")
  const input = useRef<HTMLInputElement>(null)

  function commit(raw: string) {
    if (raw.trim()) onChange(addEmails(value, raw))
    setText("")
  }

  return (
    // Clicking anywhere in the box puts the cursor in the text field, like a real input.
    // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: the input inside is the keyboard target
    <div
      onClick={() => input.current?.focus()}
      className={cn(
        "flex min-h-16 w-full flex-wrap content-start items-center gap-1.5 rounded-lg border bg-background p-2 shadow-xs",
        "transition-[border-color,box-shadow] duration-150 ease-out",
        "focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-600/15",
        fieldProps["aria-invalid"] && "border-error-500",
      )}
    >
      {value.length > 0 && (
        <ul aria-label="Emails added" className="contents">
          {value.map((email) => {
            const valid = isValidEmail(email)
            return (
              <li
                key={email}
                className={cn(
                  "flex items-center gap-1 rounded-md py-0.5 pr-0.5 pl-2 text-sm",
                  valid
                    ? "bg-foreground/5"
                    : "bg-error-50 text-error-700 dark:bg-error-600/15 dark:text-error-300",
                )}
              >
                {email}
                {!valid && <span className="sr-only"> (not a valid email)</span>}
                <button
                  type="button"
                  aria-label={`Remove ${email}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    onChange(value.filter((e) => e !== email))
                    input.current?.focus()
                  }}
                  className="rounded-sm p-0.5 opacity-70 hover:bg-foreground/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <XClose aria-hidden="true" className="size-3.5" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <input
        ref={input}
        {...fieldProps}
        // Text, not type="email": email inputs trim spaces, which would hide the separator.
        type="text"
        inputMode="email"
        autoCapitalize="none"
        autoComplete="off"
        spellCheck={false}
        value={text}
        placeholder={value.length === 0 ? placeholder : ""}
        onChange={(event) => {
          const next = event.target.value
          // A separator (typed or pasted) finishes what came before it.
          if (/[\s,;]/.test(next)) commit(next)
          else setText(next)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            commit(text)
          } else if (event.key === "Backspace" && text === "" && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={() => {
          commit(text)
          onBlur?.()
        }}
        className="min-w-40 flex-1 bg-transparent px-1 py-0.5 text-base outline-none placeholder:text-gray-600 md:text-sm"
      />
    </div>
  )
}

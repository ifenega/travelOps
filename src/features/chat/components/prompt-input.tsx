import { ArrowUp, Microphone02, Plus } from "@untitledui/icons"
import { type FormEvent, type KeyboardEvent, useId, useRef, useState } from "react"
import { Button } from "@/shared/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip"

type PromptInputProps = {
  /** Called with the trimmed message. The input clears itself afterwards. */
  onSubmit: (message: string) => void
  /** Shows the ＋ button. Leave out until attachments work, so there's no dead button. */
  onAttach?: () => void
  /** Shows the microphone button. Leave out until voice input works. */
  onVoiceInput?: () => void
  placeholder?: string
  /** Earlier prompts, oldest first. ↑ / ↓ step through them, like a terminal or other AI chats. */
  history?: string[]
}

// The chat composer from the Figma. Enter sends, Shift+Enter adds a new line, ↑ / ↓ recall
// earlier prompts.
export function PromptInput({
  onSubmit,
  onAttach,
  onVoiceInput,
  placeholder = "Do anything with AI…",
  history = [],
}: PromptInputProps) {
  const [message, setMessage] = useState("")
  // Which earlier prompt is showing; null while typing your own.
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const draft = useRef("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const id = useId()
  const hintId = useId()
  const isEmpty = message.trim() === ""

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isEmpty) return
    onSubmit(message.trim())
    setMessage("")
    setHistoryIndex(null)
    textareaRef.current?.focus()
  }

  /** Shows the previous (-1) or next (+1) prompt. Past the newest, your draft comes back. */
  function recall(step: -1 | 1) {
    if (historyIndex === null && step === 1) return false
    if (historyIndex === null) draft.current = message
    const next = (historyIndex ?? history.length) + step
    if (next < 0) return true // already at the oldest: stay there
    if (next >= history.length) {
      setHistoryIndex(null)
      setMessage(draft.current)
    } else {
      setHistoryIndex(next)
      setMessage(history[next])
    }
    // Put the cursor at the end, after React has updated the text.
    requestAnimationFrame(() => {
      const textarea = textareaRef.current
      textarea?.setSelectionRange(textarea.value.length, textarea.value.length)
    })
    return true
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const textarea = event.currentTarget
    const plainKey = !event.shiftKey && !event.altKey && !event.metaKey && !event.ctrlKey
    // isComposing: don't act while someone is mid-way through typing with an IME (e.g. Japanese).
    if (event.nativeEvent.isComposing) return

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      textarea.form?.requestSubmit()
      return
    }
    // Only take over ↑ on the first line and ↓ on the last, so moving through a long message works.
    const onFirstLine = !textarea.value.slice(0, textarea.selectionStart).includes("\n")
    const onLastLine = !textarea.value.slice(textarea.selectionEnd).includes("\n")
    if (plainKey && history.length > 0) {
      if (event.key === "ArrowUp" && onFirstLine && recall(-1)) event.preventDefault()
      if (event.key === "ArrowDown" && onLastLine && recall(1)) event.preventDefault()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col rounded-xl border bg-background shadow-xs dark:bg-gray-900 transition-[border-color,box-shadow] duration-150 ease-out has-[textarea:focus]:border-primary-500 has-[textarea:focus]:ring-4 has-[textarea:focus]:ring-primary-600/15"
    >
      <label htmlFor={id} className="sr-only">
        Message
      </label>
      <span id={hintId} className="sr-only">
        Up and down arrows recall your earlier messages.
      </span>
      <textarea
        id={id}
        ref={textareaRef}
        value={message}
        onChange={(event) => {
          setMessage(event.target.value)
          setHistoryIndex(null) // editing a recalled prompt makes it your draft
        }}
        onKeyDown={handleKeyDown}
        aria-describedby={history.length > 0 ? hintId : undefined}
        placeholder={placeholder}
        rows={3}
        enterKeyHint="send"
        // Grows with the text (where supported), up to a limit, then scrolls.
        className="field-sizing-content max-h-60 min-h-20 resize-none overflow-y-auto overscroll-contain bg-transparent px-4 pt-3 text-base outline-none placeholder:text-gray-600"
      />
      <div className="flex items-center gap-1 px-2 pb-2">
        {onAttach && (
          <Button variant="ghost" size="icon" aria-label="Add attachment" onClick={onAttach}>
            <Plus />
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1">
          {onVoiceInput && (
            <Button variant="ghost" size="icon" aria-label="Voice input" onClick={onVoiceInput}>
              <Microphone02 />
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              {/* aria-disabled (not disabled) so it stays focusable and its tooltip still shows. */}
              <Button
                type="submit"
                size="icon"
                aria-label="Send message"
                aria-disabled={isEmpty}
                className="rounded-full [&_svg]:size-4 aria-disabled:bg-muted aria-disabled:text-gray-500 aria-disabled:hover:bg-muted aria-disabled:active:scale-100"
              >
                <ArrowUp />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send a message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}

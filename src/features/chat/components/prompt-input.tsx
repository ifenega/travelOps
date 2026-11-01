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
}

// The chat composer from the Figma. Enter sends, Shift+Enter adds a new line.
export function PromptInput({
  onSubmit,
  onAttach,
  onVoiceInput,
  placeholder = "Do anything with AI…",
}: PromptInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const id = useId()
  const isEmpty = message.trim() === ""

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isEmpty) return
    onSubmit(message.trim())
    setMessage("")
    textareaRef.current?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // isComposing: don't send while someone is mid-way through typing with an IME (e.g. Japanese).
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col rounded-xl border bg-background shadow-xs transition-[border-color,box-shadow] duration-150 ease-out has-[textarea:focus]:border-primary-500 has-[textarea:focus]:ring-4 has-[textarea:focus]:ring-primary-600/15"
    >
      <label htmlFor={id} className="sr-only">
        Message
      </label>
      <textarea
        id={id}
        ref={textareaRef}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
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

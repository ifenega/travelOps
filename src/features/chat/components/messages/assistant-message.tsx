import { Banner } from "@/shared/ui/banner"
import { Button } from "@/shared/ui/button"
import type { AssistantMessage as AssistantMessageType } from "../../chat"
import { ThinkingIndicator } from "../thinking-indicator"

// Sparky's reply: plain paragraphs, no bubble (design screen 13). Shows the thinking indicator
// until the first words arrive, and an error with "Try again" if the reply breaks.
export function AssistantMessage({
  message,
  onRetry,
}: {
  message: AssistantMessageType
  onRetry: () => void
}) {
  if (message.status === "thinking") return <ThinkingIndicator />

  return (
    <div className="flex flex-col gap-3">
      {message.text && (
        <div className="flex max-w-prose flex-col gap-3 break-words">
          {message.text.split("\n\n").map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      )}
      {message.status === "error" && (
        <Banner variant="error" title="Sparky couldn't finish this reply">
          <p>Something went wrong on our side. Your message is saved.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            Try again
          </Button>
        </Banner>
      )}
    </div>
  )
}

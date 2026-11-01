import { RoundTripResults } from "@/features/flights"
import { Banner } from "@/shared/ui/banner"
import { Button } from "@/shared/ui/button"
import type { AssistantMessage as AssistantMessageType } from "../../chat"
import { ThinkingIndicator } from "../thinking-indicator"

// Sparky's reply: plain paragraphs, no bubble (design screen 13), then any flight results (15).
// Shows the thinking indicator until the first words arrive, and an error with "Try again" if
// the reply breaks.
export function AssistantMessage({
  message,
  onRetry,
  onSeeMoreFlights,
}: {
  message: AssistantMessageType
  onRetry: () => void
  onSeeMoreFlights: () => void
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
      {message.status === "done" && message.flights && (
        <RoundTripResults search={message.flights} onSeeMore={onSeeMoreFlights} />
      )}
      {message.status === "error" && message.error === "rate-limit" && (
        <Banner variant="warning" title="You're sending messages quickly">
          <p>Sparky needs a moment to catch up. Wait a minute, then try again.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            Try again
          </Button>
        </Banner>
      )}
      {message.status === "error" && !message.error && (
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

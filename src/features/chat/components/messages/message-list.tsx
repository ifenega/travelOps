import { useEffect, useRef, useState } from "react"
import type { Chat } from "../../chat"
import { AssistantMessage } from "./assistant-message"
import { UserMessage } from "./user-message"

// The conversation. Screen readers hear each finished reply once (not every streamed word),
// through the hidden live region at the end.
export function MessageList({
  chat,
  onRetry,
}: {
  chat: Chat
  onRetry: (messageId: string) => void
}) {
  const [announcement, setAnnouncement] = useState("")
  const announced = useRef(new Set<string>())

  useEffect(() => {
    for (const message of chat.messages) {
      if (message.role !== "assistant" || announced.current.has(message.id)) continue
      if (message.status === "done") {
        announced.current.add(message.id)
        setAnnouncement(`Sparky: ${message.text}`)
      } else if (message.status === "error") {
        announced.current.add(message.id)
        setAnnouncement("Sparky couldn't finish this reply.")
      }
    }
  }, [chat.messages])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">{chat.title}</h1>
      <ol className="flex flex-col gap-6">
        {chat.messages.map((message) => (
          <li key={message.id}>
            {message.role === "user" ? (
              <UserMessage message={message} />
            ) : (
              <AssistantMessage message={message} onRetry={() => onRetry(message.id)} />
            )}
          </li>
        ))}
      </ol>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  )
}

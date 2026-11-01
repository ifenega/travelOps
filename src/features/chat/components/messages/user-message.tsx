import { searchDetails, type UserMessage as UserMessageType } from "../../chat"
import { MessageMeta } from "./message-meta"

// The user's message, on the right in a grey bubble. A search from the search bar shows as the
// Figma's summary: a title plus When / Who's flying? / Cabin rows.
export function UserMessage({ message }: { message: UserMessageType }) {
  const details = message.search ? searchDetails(message.search) : []
  const copyText = [message.text, ...details.map(([label, value]) => `${label}: ${value}`)].join(
    "\n",
  )

  return (
    <div className="ml-auto flex w-fit max-w-[min(30rem,90%)] flex-col gap-1">
      <div className="rounded-xl bg-muted px-4 py-3">
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        {details.length > 0 && (
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
            {details.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <MessageMeta createdAt={message.createdAt} copyText={copyText} />
    </div>
  )
}

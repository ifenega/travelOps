import { useNavigate } from "@tanstack/react-router"
import { Stars02 } from "@untitledui/icons"
import { useState } from "react"
import AiSparkle from "@/shared/icons/svg/ai-sparkle.svg?react"
import { Page } from "@/shared/ui/page"
import { chatService } from "../api/chat-service"
import { PromptInput } from "../components/prompt-input"
import { SearchBar } from "../components/search-bar/search-bar"
import { Suggestions, startingSuggestions } from "../components/suggestions"
import { useChats } from "../hooks/use-chat"

// "How can I help you travel today?" (design screens 1–7). Searching or sending starts a chat.
export function NewChatPage() {
  const navigate = useNavigate()
  const chats = useChats()
  const [showSuggestions, setShowSuggestions] = useState(true)

  // ↑ in the prompt recalls what you've asked before, across chats.
  const history = chats
    .toReversed()
    .flatMap((chat) => chat.messages)
    .filter((message) => message.role === "user" && !message.search)
    .map((message) => message.text)

  function open(chatId: string) {
    void navigate({ to: "/chat/$chatId", params: { chatId } })
  }

  return (
    <Page
      title="New chat"
      breadcrumbs={[{ label: "Chats", to: "/chat", icon: Stars02 }, { label: "New chat" }]}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 pt-4 pb-10">
        <SearchBar onSearch={(search) => open(chatService.start({ search }))} />

        <div className="flex flex-col items-center gap-3 text-center">
          <AiSparkle aria-hidden="true" className="size-12" />
          <h1 className="font-semibold text-2xl">How can I help you travel today?</h1>
          <p className="text-muted-foreground text-sm">
            Ask me to book a flight, check your per diem, or find a hotel in London
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <PromptInput history={history} onSubmit={(text) => open(chatService.start({ text }))} />
          {showSuggestions && (
            <Suggestions
              items={startingSuggestions}
              onSelect={(suggestion) => open(chatService.start({ text: suggestion.label }))}
              onDismiss={() => setShowSuggestions(false)}
            />
          )}
        </div>
      </div>
    </Page>
  )
}

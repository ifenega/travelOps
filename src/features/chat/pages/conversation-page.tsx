import { Map01, Stars02 } from "@untitledui/icons"
import { useCallback, useState } from "react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "@/shared/ui/drawer"
import { MapPanel, type MapPoint } from "@/shared/ui/map-panel"
import { Page } from "@/shared/ui/page"
import { chatService } from "../api/chat-service"
import type { AssistantMessage, Chat } from "../chat"
import { ClarifyingQuestion } from "../components/messages/clarifying-question"
import { MessageList } from "../components/messages/message-list"
import { PromptInput } from "../components/prompt-input"
import { useChat } from "../hooks/use-chat"
import { useStickToBottom } from "../hooks/use-stick-to-bottom"

// One conversation (design screens 8–14): messages, then the prompt input pinned at the bottom
// (or Sparky's question in its place). On large screens the map sits beside the chat and can be
// expanded; on smaller screens a "Map" button opens it full screen.
export function ConversationPage({ chatId }: { chatId: string }) {
  const chat = useChat(chatId)
  const [mapExpanded, setMapExpanded] = useState(false)
  useStickToBottom(
    useCallback(() => document.getElementById("main"), []),
    chat?.messages,
  )
  if (!chat) return null // the route shows the 404 page for unknown chats

  const points = tripPoints(chat)

  const openQuestion = chat.messages.findLast(
    (message): message is AssistantMessage =>
      message.role === "assistant" && message.question?.state === "open",
  )
  const history = chat.messages
    .filter((message) => message.role === "user" && !message.search)
    .map((message) => message.text)

  return (
    <Page
      title={chat.title}
      breadcrumbs={[{ label: "Chats", to: "/chat", icon: Stars02 }, { label: chat.title }]}
      actions={
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden">
              <Map01 className="size-4" />
              Map
            </Button>
          </DrawerTrigger>
          <DrawerContent title="Map of your trip" className="p-0">
            <MapPanel points={points} className="h-[70dvh]" />
          </DrawerContent>
        </Drawer>
      }
      asideOnly={mapExpanded}
      aside={
        <MapPanel
          points={points}
          expanded={mapExpanded}
          onExpandedChange={setMapExpanded}
          className={cn(
            "hidden border-l lg:block lg:shrink-0",
            mapExpanded ? "lg:w-full lg:border-l-0" : "lg:w-[55%]",
          )}
        />
      }
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4">
        <div className="flex-1 py-6">
          <MessageList chat={chat} onRetry={(messageId) => chatService.retry(chatId, messageId)} />
        </div>
        <div className="sticky bottom-0 bg-background pt-2 pb-4">
          {openQuestion?.question ? (
            <ClarifyingQuestion
              key={openQuestion.id}
              question={openQuestion.question}
              onAnswer={(option) => chatService.answer(chatId, openQuestion.id, option)}
              onDismiss={() => chatService.dismissQuestion(chatId, openQuestion.id)}
            />
          ) : (
            <PromptInput history={history} onSubmit={(text) => chatService.send(chatId, text)} />
          )}
        </div>
      </div>
    </Page>
  )
}

/** The places in the chat's searches, as map points. (MapPanel only redraws when they change.) */
function tripPoints(chat: Chat): MapPoint[] {
  return chat.messages
    .flatMap((message) =>
      message.role === "user" && message.search
        ? message.search.mode === "stays"
          ? [message.search.destination]
          : [message.search.origin, message.search.destination]
        : [],
    )
    .map((place) => ({ label: place.name, lng: place.lng, lat: place.lat }))
}

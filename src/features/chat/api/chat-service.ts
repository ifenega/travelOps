import type { AssistantMessage, Chat, ChatMessage, QuestionOption } from "../chat"
import { describeSearch } from "../chat"
import type { SearchRequest } from "../search"
import { mockReply } from "./mock-assistant"

// The chat "backend" for now: chats live in memory, and Sparky's replies come from
// mock-assistant.ts, streamed word by word. Screens only use `chatService` and the hooks in
// use-chat.ts, so the real API can replace this file without touching them.
// (Chats don't survive a page refresh yet: that's the real API's job.)

type Listener = () => void

const chats = new Map<string, Chat>()
let chatList: Chat[] = []
const listeners = new Set<Listener>()

function emit() {
  chatList = [...chats.values()].sort((a, b) => b.createdAt - a.createdAt)
  for (const listener of listeners) listener()
}

function updateChat(chatId: string, change: (chat: Chat) => Chat) {
  const chat = chats.get(chatId)
  if (!chat) return
  chats.set(chatId, change(chat))
  emit()
}

function updateMessage(chatId: string, messageId: string, change: Partial<ChatMessage>) {
  updateChat(chatId, (chat) => ({
    ...chat,
    messages: chat.messages.map((message) =>
      message.id === messageId ? ({ ...message, ...change } as ChatMessage) : message,
    ),
  }))
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Adds Sparky's reply to the latest message: thinking, then streamed, then done (or error). */
async function reply(chatId: string) {
  const chat = chats.get(chatId)
  if (!chat) return
  const replyTo = chat.messages.at(-1)
  if (replyTo?.role !== "user") return

  const message: AssistantMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    createdAt: Date.now(),
    text: "",
    status: "thinking",
  }
  updateChat(chatId, (current) => ({ ...current, messages: [...current.messages, message] }))

  await wait(1500)
  const { text, question, fail } = mockReply(replyTo)
  const words = text.split(" ")
  let streamed = ""
  for (const [index, word] of words.entries()) {
    if (fail && index === Math.floor(words.length / 2)) {
      updateMessage(chatId, message.id, { status: "error" })
      return
    }
    streamed += (index === 0 ? "" : " ") + word
    updateMessage(chatId, message.id, { text: streamed, status: "streaming" })
    await wait(25)
  }
  updateMessage(chatId, message.id, {
    status: "done",
    question: question && { ...question, state: "open" },
  })
}

function addUserMessage(chatId: string, text: string, search?: SearchRequest) {
  const message: ChatMessage = {
    id: crypto.randomUUID(),
    role: "user",
    createdAt: Date.now(),
    text,
    search,
  }
  updateChat(chatId, (chat) => ({ ...chat, messages: [...chat.messages, message] }))
}

export const chatService = {
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  getChat: (chatId: string) => chats.get(chatId),
  listChats: () => chatList,

  /** Starts a chat from the search bar or the prompt. Returns the new chat's id. */
  start(input: { text: string } | { search: SearchRequest }) {
    const text = "text" in input ? input.text : describeSearch(input.search)
    const chat: Chat = {
      id: crypto.randomUUID(),
      title: text.length > 60 ? `${text.slice(0, 57)}…` : text,
      createdAt: Date.now(),
      messages: [],
    }
    chats.set(chat.id, chat)
    addUserMessage(chat.id, text, "search" in input ? input.search : undefined)
    void reply(chat.id)
    return chat.id
  },

  send(chatId: string, text: string) {
    addUserMessage(chatId, text)
    void reply(chatId)
  },

  /** Answers Sparky's open question with one of its options. */
  answer(chatId: string, questionMessageId: string, option: QuestionOption) {
    closeQuestion(chatId, questionMessageId, "answered")
    chatService.send(chatId, option.label)
  },

  dismissQuestion(chatId: string, questionMessageId: string) {
    closeQuestion(chatId, questionMessageId, "dismissed")
  },

  /** Tries a failed reply again. */
  retry(chatId: string, failedMessageId: string) {
    updateChat(chatId, (chat) => ({
      ...chat,
      messages: chat.messages.filter((message) => message.id !== failedMessageId),
    }))
    void reply(chatId)
  },
}

function closeQuestion(chatId: string, messageId: string, state: "answered" | "dismissed") {
  const message = chats.get(chatId)?.messages.find((m) => m.id === messageId)
  if (message?.role !== "assistant" || !message.question) return
  updateMessage(chatId, messageId, { question: { ...message.question, state } })
}

import { useSyncExternalStore } from "react"
import { chatService } from "../api/chat-service"

/** One chat, kept up to date as Sparky streams. Undefined if it doesn't exist. */
export function useChat(chatId: string) {
  return useSyncExternalStore(chatService.subscribe, () => chatService.getChat(chatId))
}

/** All chats, newest first (the sidebar's "Recent chats"). */
export function useChats() {
  return useSyncExternalStore(chatService.subscribe, chatService.listChats)
}

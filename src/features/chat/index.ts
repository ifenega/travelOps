// The chat feature's public API. Other features and the app import from here only.
import { chatService } from "./api/chat-service"

export { PromptInput } from "./components/prompt-input"
export { SearchBar } from "./components/search-bar/search-bar"
export { type Suggestion, Suggestions, startingSuggestions } from "./components/suggestions"
export { ThinkingIndicator } from "./components/thinking-indicator"
export { useChats } from "./hooks/use-chat"
export { ConversationPage } from "./pages/conversation-page"
export { NewChatPage } from "./pages/new-chat-page"
export type { Place, SearchRequest, Travellers, TravelMode } from "./search"
export { conversationSearchDefaults, conversationSearchSchema } from "./search-params"

/** For the router: unknown chat ids show the 404 page. */
export const chatExists = (chatId: string) => chatService.getChat(chatId) !== undefined

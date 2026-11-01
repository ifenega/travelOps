# Phase 2 — Chat UI plan

**Scope:** the chat section's UI, frontend only. There is no backend work in this phase. Every server call goes through a typed service with a **mock implementation**, so the UI works end to end now and switches to the real API later without touching screens.

**Designs:** `uiscreenshot/chat/` (15 screenshots, 2026-11-01). Mobile isn't designed; see [Mobile](#mobile-proposed-no-designs-yet).

- **More chat screenshots are coming.** The flight booking part of the chat includes the assistant replies and result cards.
- **When they arrive,** regroup `uiscreenshot/chat/` into subfolders by flow (e.g. `01-new-chat-and-search/`, `02-conversation-and-map/`, `03-flight-booking/`) and update section 1.

Read `CLAUDE.md` first. Its rules (simplicity, accessibility, tokens, animation) apply to everything here.

---

## 1. What the designs show

| #   | Screen / state                                                                                                                                                                                                                                                                                                                                | Screenshots       |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | **New chat, empty**: mode toggles (Flights · Trains · Stays, none selected), sparkle hero "How can I help you travel today?", prompt input, "Get started" cards                                                                                                                                                                               | 02.58.58          |
| 2   | **Flights selected**: a search bar appears above the hero. Fields: From ⇄ To · When · Passengers · round search button                                                                                                                                                                                                                        | 02.59.24          |
| 3   | **From / To autocomplete**: a dropdown of places. Airports get a ✈ icon, cities a 📍 icon. Each shows a name and a "region, country" line. Picking one fills the field.                                                                                                                                                                       | 02.59.30–02.59.42 |
| 4   | **When filled**: "Jun 17 - Jun 28". The date picker itself isn't designed.                                                                                                                                                                                                                                                                    | 02.59.50          |
| 5   | **Passengers popover**: steppers (− n +) for Adult 18+, Children 2–17, Infants under 2, Pets ("Bringing a service animal"). Each child adds a "Select age" dropdown (2–17 years). The field summarises e.g. "1 adult, 3 children, 2…".                                                                                                        | 03.00.27–03.00.39 |
| 6   | **Trains selected**: the same bar as Flights, with stations instead of airports                                                                                                                                                                                                                                                               | 03.00.46–03.00.51 |
| 7   | **Stays selected**: Where · When · Guests (same popover) · search                                                                                                                                                                                                                                                                             | 03.00.56          |
| 8   | **Conversation, split view**: chat column on the left, **map panel** on the right (expand ⤢, zoom + / −). The user's message is a **structured summary bubble**: "Round trip flight from Nigeria to Greece" with When / Passengers / Cabin. The prompt input is pinned to the bottom of the chat column. The breadcrumb shows the chat title. | 03.01.03          |
| 9   | **Sidebar collapsed to an icon rail** (icons only, labels hidden), in the conversation view                                                                                                                                                                                                                                                   | 03.01.09          |
| 10  | **Map expanded**: the map fills the panel and the chat column is hidden                                                                                                                                                                                                                                                                       | 03.01.17          |

**Not designed** (built on existing patterns, then adjusted when designs arrive):

- **The assistant's reply** (streamed text, the "thinking" state, result cards): designs exist in the flight booking part of the chat, still to come.
- **The date range picker:** follows existing patterns (section 8).
- **What the map shows** (markers, popups).
- **"Share chat" and the chat `···` menu:** later (section 8).
- **Error states and mobile:** mobile follows section 6.
- **A stray "Child 1 age" chip** at the bottom of 03.00.27 / 03.00.34: ignored.

---

## 2. Architecture

### Folder layout

Everything starts inside the chat feature (CLAUDE.md rule). It moves to `shared/` only when a second feature needs it.

```
src/features/chat/
  api/            chat-service.ts (interface), mock-chat-service.ts, places-service.ts (+ mock data)
  components/     prompt-input, suggestions (done), search-bar/, message-list, message, map-panel, …
  hooks/          use-chat.ts (conversation + streaming), use-places.ts (autocomplete)
  pages/          new-chat-page.tsx, conversation-page.tsx
  types.ts        Chat, Message, SearchRequest, Place, …
  index.ts        public API (only these are imported from outside)
```

### Data, without a backend

- **`ChatService` interface:**
  - `createChat(request)`
  - `sendMessage(chatId, text)`, which returns an **async stream of text chunks**
  - `listChats()`
  - `getChat(id)`
- **`mockChatService`:**
  - Keeps chats in memory (with an optional `localStorage` copy so a refresh keeps them).
  - Streams canned replies word by word with small delays.
  - Can be told to fail, to exercise error states (rate limit, stream cut off).
  - Replacing it with the real API later is one file.
- **`PlacesService`:** a mock search over a small local list of airports, cities and stations.
- **TanStack Query** handles request/response data: place search and the chat list, with caching and loading/error states for free.
- **Streaming** goes through `useChat`, a small hook that holds the messages and appends chunks as they arrive. TanStack Query isn't built for streams, so it isn't used here.
- **Types:** Zod schemas define the search request and the shapes the mock returns, so the real API can be validated against the same schemas later.

### Routes (in `src/app/routes.tsx`)

| Path            | Page                                                                   |
| --------------- | ---------------------------------------------------------------------- |
| `/chat`         | New chat (screens 1–7)                                                 |
| `/chat/$chatId` | Conversation (screens 8–10). The chat title appears in the breadcrumb. |

Submitting the search bar or the prompt creates a chat and navigates to `/chat/$chatId`.

### Map

- **Decided:** **MapLibre GL + OpenFreeMap tiles**. Both are open source and need no API key or billing, which fits "no backend". The design looks like Google Maps, but Google needs a key with billing.
- **How it's built:**
  - The map is **lazy-loaded** (`React.lazy`), so its large library only downloads when a conversation opens.
  - It's wrapped in our own `MapPanel` with the design's expand and zoom controls. Swapping the provider later touches one component.

---

## 3. New shared components (build these first)

The chat needs these, and other sections will too (a bookings form needs a Select and a date picker). They go in `src/shared/ui/`, each with stories. Building them **first, on main, before splitting into parallel sessions** prevents two sessions from building two Selects.

| Component                   | Built on                                                                                     | Used for                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Popover**                 | Radix Popover                                                                                | Passengers / guests panel                                                                         |
| **Select**                  | Radix Select                                                                                 | Child age (2–17 years old), styled like the Figma list                                            |
| **Combobox** (autocomplete) | Downshift `useCombobox`: headless and small, with the correct ARIA combobox pattern built in | From / To / Where                                                                                 |
| **Stepper** (− n +)         | Plain buttons + an `aria-live` count                                                         | Passenger counts. Labels like "Add adult" / "Remove adult"; min/max disable the buttons.          |
| **DateRangePicker**         | react-day-picker (what shadcn's Calendar uses) inside Popover                                | When                                                                                              |
| **ToggleGroup**             | Radix ToggleGroup (single, can be cleared)                                                   | Flights · Trains · Stays. A toggle group, not tabs, because the design starts with none selected. |
| **Drawer**                  | Vaul                                                                                         | Mobile versions of the popovers (bottom sheet)                                                    |

---

## 4. Milestones

Each milestone ends with: stories for any new components; a11y checks passing; `pnpm lint`, `typecheck`, `test` and `build` green; and a visual check against the screenshots at desktop width and 375px.

| #      | Milestone                                                                                                                                                                                                                                                                                                      | Done when                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **M0** | **Baseline:** commit phase 1 to `main`, then work on a branch                                                                                                                                                                                                                                                  | `git log` shows the baseline; the chat work is on `chat-ui`                           |
| **M1** | **Shared components** (section 3)                                                                                                                                                                                                                                                                              | Each has stories, including keyboard behaviour tests for Combobox, Select and Stepper |
| **M2** | **Search bar:** ToggleGroup modes; Flights/Trains form (From ⇄ To, When, Passengers); Stays form (Where, When, Guests); passengers popover with child ages; Zod validation (e.g. each child needs an age, at least 1 adult, infants ≤ adults); swap button                                                     | Matches screens 2–7; fully usable by keyboard; validation errors are announced        |
| **M3** | **New chat page:** hero, search bar, prompt input, suggestions, assembled at `/chat`; suggestion cards fill the prompt                                                                                                                                                                                         | Matches screen 1                                                                      |
| **M4** | **Conversation:** mock services; `useChat`; `/chat/$chatId`; message list with the **structured summary bubble**, plain user bubbles and the assistant reply (streamed, markdown); "thinking" indicator; auto-scroll that stops when the user scrolls up; recent chats in the sidebar; title in the breadcrumb | Send → navigate → streamed reply works end to end on the mock                         |
| **M5** | **Map panel:** split layout; expand/collapse; zoom; markers from the conversation; lazy-loaded                                                                                                                                                                                                                 | Matches screens 8 and 10; the chat route stays light without the map                  |
| **M6** | **Sidebar icon rail:** collapse becomes an icon-only rail (design screen 9), with tooltips on icons and the same animation. This replaces the current "hide completely" behaviour.                                                                                                                             | Matches screen 9; keyboard and screen-reader names intact                             |
| **M7** | **States and polish:** stream error / rate limit / offline (Banner + retry); empty and loading states; the `review-animations` skill pass; one Playwright test of the whole flow on the mock                                                                                                                   | Error states visible in stories; the e2e test passes                                  |

M1 has to come first. After it, M2 and M4 can run in parallel; M3 needs M2; M5 needs M4.

---

## 5. Accessibility notes

- **Combobox:** the ARIA combobox pattern.
  - Arrow keys move through options and Enter picks one.
  - The number of results is announced.
  - The option's icon type (airport / city) is also in text for screen readers.
- **Passengers popover:**
  - Steppers announce the new count ("2 adults").
  - Each child's age select is labelled "Child 1 age", "Child 2 age"…
  - The field's summary text ("1 adult, 3 children") is its accessible value.
- **Swap button:** labelled "Swap origin and destination". After swapping, the new values are announced.
- **Streaming reply:**
  - The message list is a `role="log"`.
  - The reply is announced **once, when it finishes**, not word by word.
  - The "thinking" state is announced politely ("TravelOps is thinking").
- **Auto-scroll** respects reduced motion (jump instead of smooth scroll) and never yanks the view while the user is reading earlier messages.
- **Map:**
  - Keyboard-operable zoom buttons with labels.
  - Markers have text equivalents in the chat (the map is never the only place information appears).
  - Expand / collapse is a labelled toggle with `aria-pressed`.

---

## 6. Mobile (proposed, no designs yet)

- **Search bar:**
  - The fields stack vertically in a card.
  - The passengers / guests panel and the date picker open as **bottom sheets** (Drawer) instead of popovers.
  - Autocomplete lists drop down under the field, within the screen.
- **Conversation:**
  - Full-width chat; the map opens from a "Map" button as a full-screen sheet with a close button.
  - The prompt input stays above the iOS keyboard (the viewport setup from phase 1 already handles the keyboard).
- **Mode toggles:** stay as a horizontal row and scroll sideways if needed.

To be confirmed or replaced when mobile designs exist.

---

## 7. Working in parallel Claude sessions

Other sections (bookings, expenses, …) may be built in other sessions at the same time. To avoid sessions overwriting each other:

1. **Commit first.** Every session starts from a committed `main`.
2. **One branch (ideally one git worktree) per section:** `chat-ui`, `bookings-ui`, … Merge to `main` often, in small pieces.
3. **Stay in your feature folder.** Most work lives in `src/features/<section>/`, so conflicts are rare.
4. **Shared hotspots: small, separate commits, merged quickly:**
   - `src/app/routes.tsx`: add your routes as one block, don't reorder others.
   - `src/app/layout/app-sidebar.tsx`
   - `src/shared/ui/*`, `src/shared/styles/tokens.css`
   - `package.json` / `pnpm-lock.yaml`: add dependencies in their own commit and merge it to `main` quickly. Lockfile conflicts are the most painful kind.
   - `CLAUDE.md`, the docs, and the icons gallery story.
5. **Don't duplicate shared components.** If a section needs something in section 3, use the chat branch's version once merged, or coordinate rather than building a second one.
6. **Each section gets its own plan doc** (`docs/phase-2-<section>-plan.md`) so sessions don't edit the same plan file.

---

## 8. Decisions (2026-11-01)

1. **Map:** MapLibre GL + OpenFreeMap (no key).
2. **Sidebar collapse:** switch to the design's **icon rail** (M6). This replaces "hide fully + logo in the header".
3. **Assistant replies and result cards:** designs exist, in the flight booking part of the chat, still to be shared. Build M4's reply UI as a simple placeholder and restyle it when they arrive.
4. **Date picker:** no design. Follow the existing patterns: popover on the search bar, our tokens, list and focus styles like the Select, two months on desktop, a bottom sheet with one month on mobile.
5. **Cabin class:** not answered yet. Default to **Economy**, shown in the summary bubble only.
6. **"Child 1 age" chip:** ignore for now.
7. **Share chat / `···` menu:** later. Not built in this phase.
8. **Mobile:** go with the proposal in section 6 for now.

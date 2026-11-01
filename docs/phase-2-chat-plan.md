# Phase 2 — Chat UI plan

**Scope:** the chat section's UI, frontend only. There is no backend work in this phase. Every server call goes through a typed service with a **mock implementation**, so the UI works end to end now and switches to the real API later without touching screens.

**Designs:** `uiscreenshot/chat/`, grouped by flow (51 screenshots, 2026-11-01). Mobile isn't designed; see [Mobile](#mobile-proposed-no-designs-yet).

```
uiscreenshot/chat/
  01-new-chat-and-search/        13  (section 1a, screens 1–7)
  02-conversation-and-map/        3  (section 1a, screens 8–10)
  03-flight-booking/
    01-in-chat/                   9  (section 1b, screens 11–14)
    02-results-and-fares/         8  (screens 15–19)
    03-passengers/                7  (screens 20–22)
    04-seats-and-extras/          7  (screens 23–25)
    05-itinerary/                 1  (screen 26)
    06-payment-result/            3  (screens 27–28)
```

`uiscreenshot/` is git-ignored, so **sessions in a git worktree don't have it**. Point them at `/Users/ifeoluwa/personal/travelOps/uiscreenshot/`.

Read `CLAUDE.md` first. Its rules (simplicity, accessibility, tokens, animation) apply to everything here.

---

## 1. What the designs show

### 1a. New chat, search bar and conversation

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

### 1b. Flight booking (`03-flight-booking/`)

The assistant is called **Sparky** ("Hello — I'm Sparky, your travel assistant").

**In the chat** (`01-in-chat/`)

| #   | Screen / state                                                                                                                                                                                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11  | **User summary bubble** gains a time ("11:56 PM") and two icon actions below it: **edit** (pencil) and **copy** (tooltip "Copy text").                                                                                                                                                                  |
| 12  | **Thinking:** a small round sparkle avatar plus a word that cycles "Thinking…" → "Juggling…" → "Crafting…". The sparkle SVG has been supplied and its stars animate (built: `ThinkingIndicator`).                                                                                                       |
| 13  | **Assistant text reply:** plain paragraphs, no bubble.                                                                                                                                                                                                                                                  |
| 14  | **Clarifying question card**, which replaces the prompt input: "What airport would you like to depart from?", a search field, an option list (Lagos, Abuja, Port Harcourt, Kano, I'm flexible ›), paging "‹ 1 ›", **Dismiss** and **Next**. Typing turns the list into airport results (✈, name, city). |

**Results** (`02-results-and-fares/`)

| #   | Screen / state                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 15  | **Results inside the chat column:**<br>• the assistant's summary text<br>• an inline search bar<br>• filter buttons (Any stops, Airlines, Any time, Economy)<br>• "4 of 200 results"<br>• compact **round-trip cards** (two legs; airline logo, times, duration, stops, "+1", price, "Round trip", →)<br>• "See more flights"<br>The list scrolls under the pinned prompt.                                                                                                                                                                                                                                                                                              |
| 16  | **Full-width results** (map hidden, sidebar as a rail):<br>• trip summary line ("Lagos to Greece · Round trip · Jun 24 - Jul 8 · 1 adult, 4 children, 2 infants")<br>• a **Hide/Show search** switch<br>• the search bar<br>• "**Departing flight** for Fri, Jun 26"<br>• filters: Any stops, Airlines, Any time, Economy, **Within policy**, Filter, Sort<br>• **flight cards:** airline logo, flight-number chips, times, duration line, "1 stop · 2h 15m stop in DOH", "See flight details", a **policy icon** (green = in policy, orange = out of policy), price, "Round trip", **Select ›**<br>• "4 of 200 results"<br>• pagination (1 2 … 10 11, Previous / Next) |
| 17  | **Select opens fare options** under the card: a sideways carousel of fare cards. Each has a name ("Premium Light", "Economy (X)"), price "roundtrip", a policy icon, a list of included / not-included items (✓ / ⊘), and a **Select** button.                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 18  | **Flight details dialog:**<br>• a timeline of segments: airport, time, date, duration, "Overnight flight" chip<br>• the airline / aircraft / cabin chips<br>• amenity chips (power, Wi-Fi)<br>• a "Long layover" badge between segments<br>The **out-of-policy icon** opens "Issue a conditional offer" with the reason ("The flight is too expensive. The maximum budget is GBP 450 per passenger.").                                                                                                                                                                                                                                                                  |
| 19  | **Return flight:** the chosen departing flight is pinned as a summary card with "Edit departing flight"; then "**Return flight** for Fri, Jul 20" and the same list.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

**Checkout.** This is a **separate full-page layout**: the logo on the left, a **progress bar** (Search ✓ · Departing flight ✓ · Return flight ✓ · Passengers · Itinerary · Payment), ✕ on the right, and no sidebar. Headings use a **condensed display font** (Bebas Neue).

| #   | Screen / state                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 20  | **Passengers** (`03-passengers/`):<br>• "‹ Flight selection" back link<br>• a dismissible info note ("Make sure your details exactly match…")<br>• an **accordion per passenger**: Title select (Mr…), first / last name, date of birth for children and infants, an infant warning ("must travel on the accompanying adult's lap"), and **Confirm**<br>• confirmed passengers collapse to an **avatar with initials**, name, type, ✓ and edit |
| 21  | **Contact details** (email, phone, postal address), a **terms checkbox** with links, and **Proceed** (disabled until everything is valid).                                                                                                                                                                                                                                                                                                     |
| 22  | **Overview side card:** both flights, "See flight details" (opens a **right-side sheet** with both journeys), "9 × Passenger £9,312", "**Increased by £0.32**" in red with a trend icon, total, "See price breakdown", and **Edit**.                                                                                                                                                                                                           |
| 23  | **Loading interstitials:** the meditating traveller illustration plus a line ("Pulling up passengers options." / "Checking your baggage conditions." / "We're verifying your payment…") and a spinner. The illustration has been supplied.                                                                                                                                                                                                     |
| 24  | **Seats and extras** (`04-seats-and-extras/`):<br>• Seats: per passenger, removable chips "Flight 1 · 9B · £56 ×", **Edit seats**, an infant note<br>• Loyalty points: **Add loyalty** dialog with a program Select and a number field; once added, Edit / Delete<br>• Carry-on baggage and checked baggage notes per leg<br>• Proceed                                                                                                         |
| 25  | **Add loyalty dialog** (Select + input, Cancel / Save).                                                                                                                                                                                                                                                                                                                                                                                        |
| 26  | **Review your trip itinerary** (`05-itinerary/`):<br>• trip name and dates, traveller chips<br>• **day-by-day timeline** ("WEDNESDAY, JULY 8") with flight cards and layovers<br>• **upsell cards** ("Rent a train now, decide later → Search trains", "Add a place to stay in Athens → Search stay")<br>• **Price breakdown** card with **Continue to checkout**                                                                              |
| 27  | **Payment failed** (`06-payment-result/`): card-reader illustration, "PURCHASE FAILED", reason, "Next Step", **Contact support** / **Retry payment**.                                                                                                                                                                                                                                                                                          |
| 28  | **Purchase successful:** trophy illustration, booking ID, tickets, date, "Next Step", **Back to home** / **View booking**.                                                                                                                                                                                                                                                                                                                     |

**Not designed** (built on existing patterns, then adjusted when designs arrive):

- **The payment form isn't ours.** It's the **Paystack** widget (decision 11). We design only "verifying", "failed" and "successful".
- **Seat selection** ("Edit seats") and the **price breakdown**.
- **The illustrations** for payment failed (card reader) and success (trophy) aren't supplied as SVGs yet.
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

src/features/flights/      results, fare options, flight details: used inside the chat AND full width
  api/            flights-service.ts + mock (search, fares, details, policy)
  components/     flight-card, round-trip-card, fare-options, flight-details, flight-filters, results-list, …
  index.ts

src/features/checkout/     the full-page booking flow after a flight is chosen
  api/            checkout-service.ts + mock (passengers, seats, loyalty, itinerary, payment)
  components/     checkout-layout, progress-steps, overview-card, passenger-form, loading-state, …
  pages/          passengers, extras (seats, loyalty, baggage), itinerary, payment-result
  index.ts
```

**Why three features:**

- **Flight results** appear in two places, the chat column and the full-width view, so they're their own feature that chat imports.
- **Checkout** is a separate page flow with its own layout.
- **Splitting them** keeps each folder small, and lets them be built in parallel later (section 7).

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
- **`FlightsService` (mock):** returns generated round-trip offers with fares, segments, layovers, amenities and a policy result (in / out of policy, with a reason). Filters, sort and paging run in the mock, like the real API would.
- **`CheckoutService` (mock):**
  - a draft booking holding the chosen flights, passengers, contact details, seats and loyalty
  - a price that can change ("Increased by £0.32")
  - payment that succeeds or fails on demand, so both result screens can be seen
- **TanStack Query** handles request/response data: place search and the chat list, with caching and loading/error states for free.
- **Streaming** goes through `useChat`, a small hook that holds the messages and appends chunks as they arrive. TanStack Query isn't built for streams, so it isn't used here.
- **Types:** Zod schemas define the search request and the shapes the mock returns, so the real API can be validated against the same schemas later.

### Routes (in `src/app/routes.tsx`)

| Path                              | Page                                                                                                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/chat`                           | New chat (screens 1–7)                                                                                                                                                 |
| `/chat/$chatId`                   | Conversation (screens 8–19). The chat title appears in the breadcrumb. Full-width results are a view of the same route (`?view=results&leg=departing`), so Back works. |
| `/checkout/$bookingId/passengers` | Screens 20–23. Checkout layout: no sidebar.                                                                                                                            |
| `/checkout/$bookingId/extras`     | Seats, loyalty, baggage (24–25)                                                                                                                                        |
| `/checkout/$bookingId/itinerary`  | Review (26)                                                                                                                                                            |
| `/checkout/$bookingId/payment`    | Opens the Paystack widget, then verifying → failed / successful (23, 27–28).                                                                                           |

- **Navigation:** submitting the search bar or the prompt creates a chat and navigates to `/chat/$chatId`. Choosing a fare creates a draft booking (mock) and opens checkout.
- **URL state:** the results view's filters, sort and page live in the URL search params, validated by a Zod schema in the route. A refresh keeps them, and they're shareable.

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

All of the above are built and on `main` (M1 ✅).

### 3b. Shared components for the flight booking flow

**Owned by the bookings session.** It's planning these, see `docs/phase-2-bookings-plan.md` section 3. Chat **uses** them once they're merged to `main`, and doesn't build its own:

- Dialog, AlertDialog, Switch, Tabs, Avatar, DropdownMenu
- the **Bebas Neue** `--font-display` token
- `MapPanel` (whichever session gets there first builds it in `shared/ui/`)

**Built by this (chat) session** in `shared/ui/`, because bookings doesn't need them yet:

| Component              | Built on                                                        | Used for                                     |
| ---------------------- | --------------------------------------------------------------- | -------------------------------------------- |
| **Sheet** (side panel) | Radix Dialog, sliding from the right; a bottom Drawer on phones | Flight details in checkout                   |
| **Accordion**          | Radix Accordion                                                 | Passenger forms                              |
| **Pagination**         | Plain links/buttons with `aria-current`                         | Results pages                                |
| **Chip**               | span or button; removable variant with an "×" button            | Flight numbers, seats, travellers, amenities |
| **ProgressSteps**      | An ordered list with `aria-current="step"`                      | Checkout progress bar                        |
| **Spinner**            | SVG with `role="status"`                                        | Loading interstitials                        |

If one of these turns out to be needed by bookings first, whoever needs it first builds it and tells the other session.

---

## 4. Milestones

Each milestone ends with: stories for any new components; a11y checks passing; `pnpm lint`, `typecheck`, `test` and `build` green; and a visual check against the screenshots at desktop width and 375px.

| #         | Milestone                                                                                                                                                                                                                                                                                                                                                                                                                     | Done when                                                                                      |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **M0** ✅ | **Baseline:** commit phase 1 to `main`, then work on a branch                                                                                                                                                                                                                                                                                                                                                                 | `git log` shows the baseline; the chat work is on `chat-ui`                                    |
| **M1** ✅ | **Shared components** (section 3). Built: Popover, Drawer, ResponsivePopover (popover on ≥640px, bottom sheet below), Select, Combobox, Stepper, ToggleGroup, Calendar, DateRangePicker                                                                                                                                                                                                                                       | Each has stories, including keyboard behaviour tests for Combobox, Select and Stepper          |
| **M2** ✅ | **Search bar:** ToggleGroup modes; Flights/Trains form (From ⇄ To, When, Passengers); Stays form (Where, When, Guests); passengers popover with child ages; Zod validation (e.g. each child needs an age, at least 1 adult, infants ≤ adults); swap button                                                                                                                                                                    | Matches screens 2–7; fully usable by keyboard; validation errors are announced                 |
| **M3**    | **New chat page:** hero, search bar, prompt input, suggestions, assembled at `/chat`; suggestion cards fill the prompt                                                                                                                                                                                                                                                                                                        | Matches screen 1                                                                               |
| **M4**    | **Conversation:** mock services; `useChat`; `/chat/$chatId`; message list with the **structured summary bubble** (time, edit, copy; screen 11), plain user bubbles and the assistant reply (streamed text, no bubble; 13); **ThinkingIndicator** (12, built ✅); **clarifying question card** replacing the input (14); auto-scroll that stops when the user scrolls up; recent chats in the sidebar; title in the breadcrumb | Send → navigate → thinking → streamed reply → clarifying question works end to end on the mock |
| **M5**    | **Map panel:** split layout; expand/collapse; zoom; markers from the conversation; lazy-loaded                                                                                                                                                                                                                                                                                                                                | Matches screens 8 and 10; the chat route stays light without the map                           |
| **M6**    | **Sidebar icon rail:** collapse becomes an icon-only rail (design screen 9), with tooltips on icons and the same animation. This replaces the current "hide completely" behaviour.                                                                                                                                                                                                                                            | Matches screen 9; keyboard and screen-reader names intact                                      |
| **M7**    | **States and polish:** stream error / rate limit / offline (Banner + retry); empty and loading states; the `review-animations` skill pass; one Playwright test of the whole flow on the mock                                                                                                                                                                                                                                  | Error states visible in stories; the e2e test passes                                           |

**Flight booking milestones** (section 1b):

| #       | Milestone                                                                                                                                                                                                                                                                      | Done when                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| **M8**  | **Flight results** (`features/flights`): FlightsService mock; round-trip card (in chat, 15); flight card with policy icon (16); filters, sort and pagination in the URL; full-width results view with Hide/Show search; return-flight step with the pinned departing card (19) | Matches 15, 16 and 19; filters and paging survive a refresh          |
| **M9**  | **Fares and details:** fare options carousel (17); flight details dialog and side sheet with the segment timeline, layover and amenity chips (18, 22); out-of-policy reason dialog                                                                                             | Matches 17 and 18; carousel works with keyboard and swipe            |
| **M10** | **Checkout shell + passengers:** checkout layout and ProgressSteps; loading interstitial (23); passenger accordion with Zod validation per passenger type; contact details; terms; Overview card with price change (20–22)                                                     | Proceed only enables when valid; errors are announced; matches 20–22 |
| **M11** | **Extras and itinerary:** seats chips, loyalty dialog, baggage notes (24–25); itinerary timeline with upsell cards and price breakdown (26)                                                                                                                                    | Matches 24–26                                                        |
| **M12** | **Payment:** "Continue to checkout" → `PaymentService.pay()` (mock now, Paystack popup later) → verifying → failed / successful (27–28), with retry.                                                                                                                           |                                                                      | Both results reachable on the mock; Retry works |

**Order:**

- M1 has to come first.
- After it, M2 and M4 can run in parallel; M3 needs M2; M5 needs M4.
- M8 needs M4 (results appear in the conversation). M9 needs M8.
- **M10–M12 (checkout) only need a booking to exist**, so they can run in parallel with M8–M9, in another session (section 7).

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
7. **Screenshots aren't in git.** `uiscreenshot/` is ignored, so a session in a worktree reads the designs from `/Users/ifeoluwa/personal/travelOps/uiscreenshot/`.

**Current sessions (2026-11-01):**

| Session  | Folder                           | Branch        | Plan                            |
| -------- | -------------------------------- | ------------- | ------------------------------- |
| Chat     | `travelOps/`                     | `chat-ui`     | this file                       |
| Bookings | `travelOps-bookings/` (worktree) | `bookings-ui` | `docs/phase-2-bookings-plan.md` |

**A good split if another session is added:** **checkout (M10–M12)** is self-contained, with its own feature folder, layout and routes. It can be its own session (`checkout-ui`) once M1 and the bookings session's Dialog are on `main`.

---

## 8. Decisions (2026-11-01)

1. **Map:** MapLibre GL + OpenFreeMap (no key).
2. **Sidebar collapse:** switch to the design's **icon rail** (M6). This replaces "hide fully + logo in the header".
3. **Assistant replies and result cards:** designed in `03-flight-booking/` (section 1b).
4. **Date picker:** no design. Follow the existing patterns: popover on the search bar, our tokens, list and focus styles like the Select, two months on desktop, a bottom sheet with one month on mobile.
5. **Cabin class:** not answered yet. Default to **Economy**, shown in the summary bubble only.
6. **"Child 1 age" chip:** ignore for now.
7. **Share chat / `···` menu:** later. Not built in this phase.
8. **Mobile:** go with the proposal in section 6 for now.
9. **Thinking animation:** the two stars drift and breathe out of step (1.8s), only while Sparky is thinking. With reduced motion it's an opacity pulse.
10. **Illustrations:** the meditating traveller (`src/shared/illustrations/`) uses `currentColor` and theme variables, so it works in dark mode.
11. **Payment is the Paystack widget** (Paystack's own popup), not a form we build.
    - The backend starts each transaction and verifies it afterwards, so the real integration waits for the backend.
    - This phase uses a `PaymentService` interface with a mock: `pay(bookingId)` resolves to success or failure on demand.
    - Later, the real version opens Paystack's popup with the reference the backend returns, then calls the backend to verify. Screens don't change.
    - **Never trust the popup's callback alone.** Only the backend's verification decides "successful".

## 9. Open questions (flight booking)

1. **Display font:** the checkout headings look like **Bebas Neue**, which the bookings session also picked. Confirm it's the right font, and that the "TRAVELOPS" wordmark is an image (logo file) rather than text.
2. **Missing designs:** seat selection ("Edit seats"), the price breakdown, and the illustrations for payment failed (card reader) and success (trophy) as SVGs. (Payment itself is the Paystack widget.)
3. **Policy:**
   - Is "Issue a conditional offer" the action for an out-of-policy flight (e.g. request approval)? The first dialog with that title shows flight details, which looks like a copy-paste.
   - What does the orange policy icon on a _fare_ mean?
4. **Checkout buttons are fully rounded (pill)**, while the rest of the app uses 8px corners. Is that intended for checkout only? If yes, add a `rounded-full` shape to the Button.
5. **Results in chat vs full width:** what switches between them, e.g. "See more flights" → full width?

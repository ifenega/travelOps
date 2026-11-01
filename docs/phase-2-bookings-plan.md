# Phase 2 — Bookings UI plan

**Scope:** the bookings section's UI, frontend only. This phase has no backend work. As in the chat plan, every server call goes through a typed service with a **mock implementation**, so the screens work end to end now and switch to the real API later without changes.

**Designs:** `uiscreenshot/bookings/` (11 screenshots, 2026-11-01). Mobile isn't designed; see [Mobile](#6-mobile-proposed-no-designs-yet).

**Where the work happens:** branch `bookings-ui`, in the worktree `../travelOps-bookings`. The chat work stays on `chat-ui` in `travelOps/`. See [section 7](#7-working-alongside-the-chat-session).

Read `CLAUDE.md` first. Its rules (simplicity, accessibility, tokens, animation) apply to everything here.

---

## 1. What the designs show

| #   | Screen / state | Screenshots |
| --- | --- | --- |
| 1   | **Bookings list, "My bookings" tab**: title, subtitle, tabs **My bookings 3 · Team bookings 3**, Search, an **All status** dropdown, and a grid of trip cards | 05.18.36, 05.19.13 |
| 2   | **Trip card**: destination photo, a `···` button over the photo, a title ("Flight to United States"), a status badge (**Draft** grey, **Pending** amber, **Booked** green), "Jul 8 - Aug 18 · £1,466.58", then ✈ 3 and 👥 12 | 05.18.36 |
| 3   | **Card `···` menu, "Manage booking"**: Edit booking ("Makes changes to your booking"), Share trip ("Share this trip with people"), Delete booking in red ("Remove booking from your list") | 05.18.36, 05.19.13 |
| 4   | **"Team bookings" tab**: the same grid | 05.18.43 |
| 5   | **"Upcoming / Past" tabs**: a search icon only, no status filter. The past cards are all **Paid**. | 05.19.59 |
| 6   | **Share trip dialog**: "Share this trip with people, team members etc." with two switches. **Get a link**: "Share trip dates and services, but hide traveller names and prices". **Send via email**: "Share the full trip details and travellers. We won't send any prices, confirmation numbers, or tickets." | 05.19.22 |
| 7   | **Get a link, on**: a trip picker ("Flight to United States · Roundtrip LOS - IST"), and a read-only link with a **Copy** button | 05.19.32 |
| 8   | **Send via email, on**: a "Select email" dropdown of team members (avatar or initials, name, email) | 05.19.40, 05.19.48 |
| 9   | **Trip page, Itinerary tab**: "Back to bookings", photo, **"United States trip"**, "Thu, May 1 - Thu, May 8", "Pittsburgh, PA", a `···` menu, tabs **Itinerary · Flights · Trains**, then a **map panel** on the right. Below the tabs is a timeline: a day heading in a tall condensed font ("THU, MAY 1"), stop dots ("Lagos, LOS"; "Doha, DOH · Layover in Doha: ~2h 35m"), and booking cards between the dots. | 05.20.13 |
| 10  | **Trip `···` menu, "Manage booking"**: Edit trip, Print itinerary, Add to calendar, Delete trip (red) | 05.20.13 |
| 11  | **Booking card** (a flight or train leg): ✈/🚆 icon, "LOS - DOH", **Booked** badge, a `···` menu; a blue strip "Booked on Pegasus Airlines" with ✕; depart time, city and airport ("Lagos, NG (EWR)"), aircraft and duration, "Confirmation PE24FB", the airline logo; arrive time and place | 05.20.13 |
| 12  | **Booking `···` menu**: Edit booking, Delete booking (red) | 05.20.20 |
| 13  | **Flights tab / Trains tab**: the same timeline with only that kind of booking | 05.20.20, 05.20.26 |

**Not designed** (built on existing patterns, then adjusted when designs arrive):

- **Where Upcoming / Past sit next to My / Team** (section 8, decision 1).
- **Confirm-delete dialogs, and empty, loading and error states.**
- **What happens after Send**, and how a shared link looks to the person who opens it.
- **A stays (hotel) card.** The trip page only shows flights and trains.
- **Mobile.** See section 6.

**Mistakes in the designs, fixed rather than copied:**

- **The subtitle** "Manage people in your workspace and their roles" belongs to the members page. Proposed: "Your trips and your team's trips, in one place." (section 9).
- **The tab counts** say 3 while 4 cards show. The counts will come from the data.
- **The booking card says "Lagos, NG (EWR)"** (EWR is Newark) and shows "Boeing 777" on a train. The mock data will be correct.
- **The share dialog's trip picker** shows a person icon in one screenshot and a plane in another. It will use the trip's transport icon.

---

## 2. Architecture

### Folder layout

```
src/features/bookings/
  api/          bookings-service.ts (interface), mock-bookings-service.ts, mock-data.ts
  components/   trip-card, trip-menu, trip-filters, share-trip-dialog, recipient-picker,
                delete-trip-dialog, itinerary, booking-card, …
  hooks/        use-trips.ts, use-trip.ts (TanStack Query)
  pages/        bookings-page.tsx, trip-page.tsx
  utils/        itinerary.ts (group legs by day, work out stops and layovers),
                calendar.ts (.ics file), format.ts (date range, price)
  types.ts      Trip, Booking, TripStatus, …
  index.ts      public API (only these are imported from outside)
```

### Words used in the code

The designs say "booking" for both a trip and a leg. To keep the code readable:

- **Trip:** one card on the list ("Flight to United States"), and the trip page.
- **Booking:** one leg inside a trip (the LOS - DOH flight, or the DOH - LON train).

Screen text still says what the design says.

### Data, without a backend

- **`BookingsService` interface:**
  - `listTrips({ owner: "mine" | "team", when: "upcoming" | "past", status?, query? })`
  - `getTrip(id)`
  - `deleteTrip(id)` and `deleteBooking(tripId, bookingId)`
  - `getShareLink(tripId)`, `setShareLinkEnabled(tripId, on)`
  - `shareByEmail(tripId, memberIds)`
  - `listTeamMembers()`
- **`mockBookingsService`:**
  - Keeps trips in memory, seeded from `mock-data.ts`, which copies the screenshots' trips.
  - Adds a short delay so loading states show.
  - Can be told to fail, so error states can be seen in stories.
- **TanStack Query** handles loading, errors and caching. Deleting a trip removes it from the list straight away and puts it back if the call fails. The chat plan uses TanStack Query too, so it's added once (section 7).
- **Types:** Zod schemas describe what the mock returns, so the real API can be checked against the same schemas later.
- **Photos:** four royalty-free destination photos (from Unsplash, compressed to WebP) go in `public/mock/`. Cards show a plain grey box if a photo is missing or fails to load.
- **Money and dates** use `Intl` (`£1,466.58`, `Jul 8 – Aug 18`), with the currency from the data.

### Routes (in `src/app/routes.tsx`)

| Path | Page | URL search params |
| --- | --- | --- |
| `/bookings` | Bookings list (screens 1–8) | `owner=mine\|team`, `when=upcoming\|past`, `status`, `q` |
| `/bookings/$tripId` | Trip page (screens 9–13) | `tab=itinerary\|flights\|trains` |

- **Filters and tabs live in the URL.** TanStack Router checks them with a Zod schema. Back and forward then work, and a filtered list can be shared. Defaults (`mine`, `upcoming`, all statuses) are left out of the URL.
- **Breadcrumbs:** "Home > Bookings", and "Home > Bookings > United States trip" on the trip page. Home has the sparkle icon and links to `/chat`, as in the chat pages. The design's `···` after the breadcrumb is left out, as it is in chat.
- **The sidebar's Bookings link stays highlighted** on the trip page.
- **Both routes stay behind the existing `bookings` flag.** No new flags.

### Actions in the `···` menus

| Action | What it does |
| --- | --- |
| **Edit booking / Edit trip** | Goes to `/chat?tripId=…` (plus `&bookingId=…` for one leg). The chat starts with that trip attached, and the LLM makes the change. The chat session adds the handling for these params; until then `/chat` simply opens. |
| **Share trip** | Opens the Share trip dialog (section 4). |
| **Delete booking / Delete trip** | Asks first, in a confirm dialog. Then removes it and shows a toast. |
| **Print itinerary** | `window.print()`, with a print stylesheet that hides the sidebar, map and menus and prints the timeline. |
| **Add to calendar** | Downloads a `.ics` file with one event per leg. This works with Apple, Google and Outlook calendars, and needs no account. |

### Map (trip page)

- **Same choice as chat:** MapLibre GL + OpenFreeMap, lazy-loaded.
- **Two features need it,** so `MapPanel` (the expand and zoom controls) goes in `src/shared/ui/`. If the chat session has already built it, bookings uses that one. Otherwise bookings builds it there and tells the chat session (section 7).
- **Bookings adds:** a marker for each stop and a line along the route, fitted to the trip.

---

## 3. New shared components

None of these exist yet. Chat will need some of them too (Dialog for "Share chat", DropdownMenu for the chat `···` menu). They go in `src/shared/ui/`, each with stories, and are **merged to `main` quickly** so the chat session doesn't build its own.

| Component | Built on | Used for |
| --- | --- | --- |
| **DropdownMenu** | Radix DropdownMenu | The `···` menus. It has a label ("Manage booking"), items with an icon and a description line, and a red `destructive` item. |
| **Dialog** | Radix Dialog | Share trip |
| **AlertDialog** | Radix AlertDialog | Confirm delete |
| **Switch** | Radix Switch | Get a link, Send via email |
| **Tabs** | Radix Tabs, styled like the existing ToggleGroup pills | My / Team bookings; Itinerary / Flights / Trains |
| **Avatar** | Radix Avatar | Team members: photo, with initials as the fallback ("TF") |

Bookings also needs:

- **Bebas Neue** (`@fontsource/bebas-neue`, self-hosted) for the day headings, as a `--font-display` token in `tokens.css`.
- **TanStack Query** (`@tanstack/react-query`), with the `QueryClientProvider` in `src/app/app.tsx`.

---

## 4. Screens in detail

### Bookings list

- **Header:** `<h1>` "Bookings" and the subtitle.
- **Controls:**
  - Row 1: **Tabs** "My bookings 3" · "Team bookings 3".
  - Row 2: an **Upcoming · Past** ToggleGroup on the left; **Search** and the **status Select** on the right.
  - On phones, row 2 wraps.
- **Status filter:** "All status", Draft, Pending, Booked. It shows only on **Upcoming**, as in the design, because past trips are all Paid.
- **Search:** an input with a search icon. It filters by trip title and place as you type. The mock filters in memory; the real API gets `q`.
- **Grid:** 1 column on phones, 2 from `sm`, 3 from `lg`, 4 from `xl`.
- **Trip card:**
  - The **title is a link to the trip page**, stretched to cover the card, so the whole card is clickable.
  - The `···` button sits above that link, so the two never nest.
  - Status badge colours: Draft `neutral`, Pending `warning`, Booked and Paid `success`.
  - **The ✈ count is the number of bookings (legs)** and the 👥 count the number of travellers. To be confirmed (section 9).
- **States:**
  - Loading: skeleton cards.
  - No trips: a short message and a "Plan a trip" button to `/chat`.
  - Nothing matches: "No trips match" and a "Clear filters" button.
  - Error: `<Banner variant="error">` with Retry.

### Share trip dialog

- **Trip picker:** a Select of the user's trips, preset to the trip it was opened from. Each option shows the transport icon, the title and "Roundtrip LOS - IST".
- **Get a link:**
  - Turning it on creates a link. The link shows in a read-only input with **Copy**.
  - Copy puts it on the clipboard and shows the toast "Link copied".
  - Turning it off turns the link off: the URL stops working.
- **Send via email:**
  - Turning it on shows the **recipient picker**: a combobox of team members (avatar, name, email). Picked people show as removable chips. A **Send** button is disabled until someone is picked.
  - Send shows the toast "Trip shared with 2 people", then clears the picker.
- **Recipient picker:** built inside the bookings feature with Downshift's `useCombobox` + `useMultipleSelection`, like the shared Combobox. It moves to `shared/` when a second feature needs it (Invite members probably will).

### Trip page

- **Layout:** two columns from `lg`: the trip on the left (scrolls on its own), the map on the right. Below `lg` it's one column (section 6).
- **Header:** "← Back to bookings" link, the photo, `<h1>` title, dates, place, and the trip `···` menu.
- **Tabs:** Itinerary, plus one tab for each kind of booking the trip has (**Flights**, **Trains**). A trip with no trains has no Trains tab.
- **Timeline:**
  - Built by `utils/itinerary.ts` from the legs. It groups legs by day, adds a stop before each leg, and labels a stop as a layover when the next leg leaves the same place. This has unit tests; it's the only real logic in the feature.
  - Day headings are in Bebas Neue. The page text is "Thu, May 1", made capitals by CSS, so screen readers don't spell out "THU".
- **Booking card:**
  - The header shows the transport icon, "LOS - DOH", the status badge and the `···` menu.
  - The **"Booked on Pegasus Airlines" strip has no ✕** (section 9).
  - Depart and arrive rows: time, place, aircraft or train, duration, and the confirmation code.
  - The airline logo, with a letter tile as a fallback.

---

## 5. Accessibility notes

- **Tabs:**
  - Each tab's name includes the count: "My bookings, 3 trips".
  - Arrow keys move between tabs (Radix).
- **After filtering or searching,** a polite live region announces the result: "4 trips" or "No trips match".
- **Trip card:**
  - The card is one link (the title) plus one button. There is no clickable `<div>`, and nothing interactive inside the link.
  - The `···` button is named for its trip: "Manage Flight to United States".
  - The photo is decorative (`alt=""`); the title says where.
  - The counts read "3 bookings, 12 travellers". The icons are `aria-hidden`.
  - Dates use `<time>`.
- **Menus:**
  - Radix DropdownMenu: arrow keys, Esc, and focus goes back to the `···` button.
  - The red items also say "Delete" in words, so they don't rely on colour.
- **Share dialog:**
  - It has a title and a description.
  - Each switch is named by its label ("Get a link") and described by its help text.
  - The link input is labelled "Share link".
  - Copy and Send confirm through the toast live region.
- **Recipient picker:**
  - It follows the combobox pattern, and the number of matches is announced.
  - Each chip has a remove button ("Remove Timilehin Folagbade"). Backspace in an empty input removes the last chip.
- **Delete:**
  - The AlertDialog opens with focus on **Cancel**.
  - After deleting from the list, focus moves to the next card, or to the heading if none is left.
  - After deleting from the trip page, it goes back to the list.
- **Trip page:**
  - One `<h1>` (the trip). Day headings are `<h2>`; booking cards are `<h3>`.
  - Card titles read "Flight from Lagos (LOS) to Doha (DOH)", while "LOS - DOH" is what shows on screen.
  - The timeline is an ordered list.
- **Map:**
  - It's extra. Everything on it is also in the timeline.
  - The zoom and expand buttons have labels, and expand has `aria-pressed`.
- **Contrast:** badge text uses the 700 shades (already in Badge). The blue strip uses info-700 text on info-50.

---

## 6. Mobile (proposed, no designs yet)

- **List:**
  - One column of cards.
  - The `···` button is always visible and at least 44px.
  - The controls wrap onto two lines, and Search takes the full width.
- **Menus:** stay as dropdowns. They're short enough for phones.
- **Share dialog:** full width with a margin. It scrolls inside if the keyboard covers it.
- **Trip page:**
  - One column, no map beside it.
  - A "Map" button in the header opens the map in a full-screen sheet (Drawer) with a close button, as in the chat plan.
- **Tabs:** scroll sideways if they don't fit.

To be confirmed or replaced when mobile designs exist.

---

## 7. Working alongside the chat session

- **Branches:**
  - `main` now includes the shared components from chat M1 (it was fast-forwarded to `164bee1`).
  - `bookings-ui` branches from there, in `../travelOps-bookings`. Run `pnpm install` there once.
- **Merge shared things to `main` quickly, in their own commits:** the dependency additions (TanStack Query, Bebas Neue, and later MapLibre), the section 3 components, and the `QueryClientProvider` in `app.tsx`.
- **Tell the chat session about:**
  - The new shared components, so it uses them for "Share chat" and the chat `···` menu.
  - **`/chat?tripId=&bookingId=`**, which Edit will use.
  - **`MapPanel`**: whichever session builds it first puts it in `shared/ui/`, and the other one uses it.
- **Hotspots:**
  - `routes.tsx`: one bookings block, replacing the placeholder route.
  - `tokens.css`: only the `--font-display` token.
  - The icons gallery story: new icons only.

---

## 8. Milestones

Each milestone ends with: stories for any new components; a11y checks passing; `pnpm lint`, `typecheck`, `test` and `build` green; and a visual check against the screenshots at desktop width and at 375px.

| # | Milestone | Done when |
| --- | --- | --- |
| **M0** ✅ | **Baseline:** `main` fast-forwarded; `bookings-ui` worktree created | `git worktree list` shows `travelOps-bookings` |
| **M1** | **Dependencies + shared components** (section 3): TanStack Query, Bebas Neue, DropdownMenu, Dialog, AlertDialog, Switch, Tabs, Avatar. Merged to `main`. | Each has stories, with keyboard tests for DropdownMenu and Dialog (Esc closes, focus returns) |
| **M2** | **Data:** types and Zod schemas, mock service, mock data copied from the screenshots, query hooks, `itinerary.ts` / `calendar.ts` / `format.ts` with unit tests | Unit tests pass; hooks return the mock trips |
| **M3** | **Bookings list:** header, tabs with counts, Upcoming / Past, search, status filter, card grid, URL params, loading / empty / no-match / error states | Matches screens 1, 2, 4 and 5; filters survive a refresh and the back button |
| **M4** | **Card actions:** `···` menu, Edit → chat, confirm delete with toast and focus handling | Matches screen 3; delete works by keyboard alone |
| **M5** | **Share trip dialog:** switches, trip picker, link + Copy, recipient picker, Send | Matches screens 6–8; fully usable with VoiceOver |
| **M6** | **Trip page:** header and menu, tabs, timeline with stops and layovers, booking cards and their menu, print stylesheet, Add to calendar | Matches screens 9–13 (without the map); the printout is readable; the `.ics` file opens in Apple Calendar |
| **M7** | **Map:** split layout, `MapPanel`, stop markers and route line, lazy-loaded; the mobile Map sheet | Matches screen 9; the list route doesn't load the map library |
| **M8** | **Mobile and polish:** the section 6 layouts on a real iPhone, the `review-animations` pass, one Playwright test (list → trip → share) on the mock | The e2e test passes; checked on an iPhone |

M1 comes first. After it, M2 and the M3 layout can run side by side. M4 and M5 need M3; M7 needs M6.

---

## 9. Decisions

**Decided (2026-11-01):**

1. **Tabs:** both sets, nested. My / Team bookings on top, and Upcoming / Past inside each.
2. **Edit booking / Edit trip:** opens a chat with the trip attached. The LLM makes the change, so there's no edit form.
3. **Day headings:** Bebas Neue, used only for those headings.
4. **Send via email:** pick several people (shown as chips), then press Send.

**Proposed, confirm or change:**

5. **Subtitle:** "Your trips and your team's trips, in one place."
6. **The ✈ count on cards** is the number of bookings (legs) in the trip.
7. **Delete trip** removes it from the user's list. It **does not cancel tickets**. The confirm dialog says so: "Delete this trip? This removes it from your list. It doesn't cancel anything you've booked." If delete should cancel bookings, that needs its own design.
8. **The ✕ on the "Booked on…" strip is left out.** Hiding the airline name has no clear use, and it's one more button for keyboard and screen-reader users.
9. **Team bookings cards** look the same as My bookings. A "booked by" line can come later if the design adds one.

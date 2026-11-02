# TravelOps

TravelOps is a web app for finding and booking flights with the help of an LLM. You ask for a trip in a chat, compare flights, and book and manage them in one place.

This repo is the frontend only. An existing backend calls the LLM.

## Where things stand

There's no backend connection yet. Every screen runs on in-memory mock services, so the whole app works end to end, but changes last only until you reload.

| Area     | Route                    | What's there                                                     |
| -------- | ------------------------ | ---------------------------------------------------------------- |
| Chat     | `/chat`, `/chat/$chatId` | Search bar (flights, trains, stays), conversation, map           |
| Flights  | inside a chat            | Results, filters, fare options, round trips, flight details      |
| Checkout | `/checkout/$bookingId`   | Passengers, extras, itinerary, payment                           |
| Bookings | `/bookings`              | Upcoming and past trips, trip page with map, share by link/email |
| Team     | `/members`               | Members and roles, invite, bulk import, export                   |

Expenses, Wallet, Policies, Reports, Support and Account are placeholder pages for now.

## Getting started

You need Node 24 and pnpm 10.

```sh
pnpm install
pnpm exec playwright install chromium   # browser for the tests; once per machine
pnpm dev
```

Open the URL Vite prints (usually http://localhost:5173). No API keys are needed; the map uses OpenFreeMap tiles.

To try it on a real phone, run `pnpm dev:phone` and open the LAN URL it prints. On an iPhone, debug with Safari Web Inspector on a Mac; desktop device emulation misses iOS bugs.

## Commands

| Command                | What it does                                                   |
| ---------------------- | -------------------------------------------------------------- |
| `pnpm dev`             | Dev server                                                     |
| `pnpm dev:phone`       | Dev server on your local network, for a real phone             |
| `pnpm build`           | Type-check, then production build into `dist/`                 |
| `pnpm typecheck`       | Type-check only                                                |
| `pnpm lint`            | Biome lint and format check                                    |
| `pnpm format`          | Biome auto-fix and format                                      |
| `pnpm test`            | Unit tests, plus every Storybook story as a render + a11y test |
| `pnpm test:e2e`        | Playwright journeys in `e2e/`, desktop and phone               |
| `pnpm storybook`       | Component viewer at http://localhost:6006                      |
| `pnpm storybook:phone` | Component viewer on your local network                         |

Before merging, run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`.

## Feature flags

Each section can be switched off with a flag. Defaults live in [src/shared/flags/flags.ts](src/shared/flags/flags.ts). To override them on your machine:

```sh
cp .env.example .env.local
```

Then uncomment the lines you need, for example `VITE_FLAG_DARK_MODE=true` to show the theme toggle. Restart `pnpm dev` after changing it. A route whose flag is off shows the 404 page.

Flags only hide UI. Anything that must truly be restricted has to be enforced by the backend as well.

## Project layout

```
src/
  app/        routes.tsx (every route), the dashboard layout, 404 and error pages
  features/   one folder per feature: chat, flights, checkout, bookings, team
  shared/     UI components, icons, flags, hooks, styles (tokens.css), helpers
e2e/          Playwright journeys
docs/         the plans for each phase and section
```

Imports flow one way: `app → features → shared`. Use the `@/` alias (`@/shared/ui/button`), not relative `../../` paths.

## Mock data and the real API

Screens only get data through each feature's service in `src/features/<feature>/api/`. Hooks and components never call `fetch` themselves.

- **Bookings and team** define the service as a type and point it at a mock. To connect the real API, write an implementation of that type and change the last line of the service file.
- **Chat, flights and checkout** still keep their mock inside the service file. Replace it there when the API is ready.

Mocks can be tuned while you work. Each one exports a controls object (`mockControls` in bookings and team, `mockFlightControls`, `mockCheckoutControls`) with a `delay`; the bookings and team ones also have `fail`. Stories use these to show loading and error states. The checkout mock fails the first payment attempt when the contact email contains `fail`, so you can see the payment error flow.

## Deploying

The app deploys as a static site on Vercel. [vercel.json](vercel.json) sends every path to `index.html`, so deep links like `/bookings/abc` load the app instead of a 404.

## Contributing

Read [CLAUDE.md](CLAUDE.md) before your first change. It covers the rules this codebase follows: styling with tokens only, accessibility (screen reader and keyboard first), animation, forms, testing, mobile, and the git workflow (one branch per section, fast-forward merges into `main`, never rewriting `main`).

The plans are in [docs/](docs/): [phase 1](docs/phase-1-plan.md) for the foundations, then one plan per section ([chat](docs/phase-2-chat-plan.md), [bookings](docs/phase-2-bookings-plan.md), [team](docs/phase-2-team-plan.md)).

# TravelOps — Phase 1 plan

**Phase 1 scope:** project setup → design tokens → icons → Storybook/testing → feature flags, routing and error pages → key components.
No product screens. Storybook is the screen for viewing every component and its variants.

## Product

TravelOps is a customer-facing web app, powered by an LLM, for people who want to find and book flights. An existing backend calls the LLM; this repo is frontend only.

Designs arrive section by section as screenshots (Figma reads are blocked: view-only access on a Starter plan). Where a design detail is missing, we use the closest vivida pattern and adjust later.

## Ground rules (apply to every change)

Before writing or reviewing anything, ask:

1. Am I overcomplicating this?
2. Is the code readable?
3. Is it too abstracted?
4. Is there an easier way?
5. Does it work with a screen reader and a keyboard?

Plus:

- Mobile web must have no layout bugs, especially in iOS Safari. Mobile users get the full experience.
- Animate with restraint, following [Emil Kowalski's guidance](https://emilkowal.ski/ui/you-dont-need-animations) (see the Animation policy section below).

## Stack

| Concern                  | Choice                                                                     |
| ------------------------ | -------------------------------------------------------------------------- |
| Build                    | Vite 8 + React 19 + TypeScript (strict)                                    |
| Package manager          | pnpm                                                                       |
| Styling                  | Tailwind CSS v4 (tokens in CSS)                                            |
| Components               | shadcn/ui (Radix), restyled to our tokens                                  |
| Toasts / mobile sheets   | Sonner / Vaul                                                              |
| Forms                    | React Hook Form + Zod                                                      |
| Routing                  | TanStack Router (routes defined in code, in one file)                      |
| Icons                    | @untitledui/icons (what the Figma uses) + custom SVGs for anything missing |
| Animation                | CSS first; Motion only if a component truly needs springs/gestures         |
| Lint + format            | Biome                                                                      |
| Component viewer + tests | Storybook + Vitest                                                         |
| Deferred to phase 2      | TanStack Query, Playwright, remote flag source                             |

## Folder structure

Based on the sign-translator CLAUDE.md and [NullVoxPopuli's general structure](https://nullvoxpopuli.com/2019-04-15-a-general-project-structure-that-works-in-any-ecosystem/).

```
travelOps/
  .claude/skills/      Emil Kowalski's skills (project-scoped)
  CLAUDE.md            conventions — read before working
  docs/                plans and decisions
  src/
    app/               routes.tsx, layout/ (sidebar + panel), pages/ (404, error, placeholders)
    features/          one folder per feature (empty in phase 1)
    shared/
      ui/              restyled shadcn components; each has a .stories.tsx beside it
      icons/           icon components; svg/ holds the source SVG files
      flags/           feature flag definitions + <Feature> gate
      styles/          tokens.css, globals.css
      lib/             cn() and tiny helpers only
```

Rules:

- Dependencies flow one way: `app → features → shared`. `shared/` never imports from `features/`.
- Code starts inside its feature and moves to `shared/` only when a second feature needs it.
- Import with the `@/` alias. No `../../`.
- Route files stay thin and hold no logic.
- Screens never use raw hex values or one-off styles. If a variant is missing, add it to the component itself.

## Steps

### Step 1 — Project setup

- Vite + React + TS (strict), `@/` alias, Biome, git.
- Mobile baseline (before any component):
  - viewport meta with `viewport-fit=cover` + `interactive-widget=resizes-content`
  - `theme-color` and `color-scheme` meta tags
  - `100dvh` for the app shell, never `100vh`
  - inputs ≥ 16px so iOS doesn't zoom on focus
  - `touch-action: manipulation` on controls
  - no tap highlight
  - `overscroll-behavior` set correctly
  - never `user-scalable=no`
- Install Emil's skills into `.claude/skills/`: emil-design-eng, animate, mobile-native, review-animations, break-ui, ask-sonner, animation-performance, pick-ui-library.
- CLAUDE.md with conventions, product brief, animation policy.

### Step 2 — Storybook + testing (minimal on purpose)

| What                              | Phase 1?                                        |
| --------------------------------- | ----------------------------------------------- |
| Every story renders (smoke test)  | Yes, automatic                                  |
| Accessibility checks (addon-a11y) | Yes, automatic                                  |
| Interaction tests                 | Only for components with behaviour (~5–6 total) |
| Unit tests                        | Only when a real helper exists                  |
| Playwright / visual regression    | Phase 2                                         |

One command, `pnpm test`, runs everything.

### Step 3 — Design tokens (the style guide) ✅

Lives in `src/shared/styles/tokens.css`; the "Foundations/Tokens" story shows it all.

- **Colours:** sampled from the Figma screenshots (converted from Display P3 to sRGB first).
  - Primary `#3274D5`, with a generated 25–900 scale. White text on it is 4.57:1, which passes WCAG AA; don't lighten it for text.
  - Gray: a neutral scale sampled from the Figma. Vivida's grays are bluish and too light for text, so they're not used.
  - Error, warning, success: Untitled UI values, the same as vivida's and the Figma's.
  - Info: only the two values the blue badge uses.
  - Tailwind's default palette is removed, so only our colours exist.
  - shadcn's semantic variables are mapped onto these scales.
- **Dark mode:**
  - Only the semantic layer changes.
  - The primary blue uses a lighter shade (400) for the focus ring on dark backgrounds.
- **Typography:**
  - Inter, self-hosted.
  - Tailwind's default size scale.
  - Headings at -0.02em letter-spacing.
  - Tabular numbers for prices, times and flight numbers.
- **Spacing and radius:** Tailwind defaults, which are the same as vivida's.
- **Shadows:** the xs–3xl scale named in the Figma, using Untitled UI values. Vivida only has three one-off button shadows, not a scale.
- **Contrast fixes (decided):** where design colour pairs failed WCAG AA, we use a deeper shade from the same family:
  - Destructive red: error-600 `#D92D20` instead of the coral `#EB5757`.
  - Primary hover: primary-700.
  - Text on soft/tinted backgrounds: the 700 shade.
- **Motion tokens:**
  - Easings: `--ease-out` `cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out` `cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer` `cubic-bezier(0.32, 0.72, 0, 1)`.
  - Durations: press 150ms, tooltip 125ms, dropdown 200ms, modal 250ms, drawer 500ms.
- **Done when:** a "Tokens" story shows every colour, type size, radius, shadow and easing, in light and dark.

### Step 4 — Icons ✅

- **Library:** the Figma uses Untitled UI line icons, so we use the official `@untitledui/icons` package. It replaces Lucide (including inside shadcn components), and vivida's copies of the same icons aren't needed.
- **Usage:** import icons directly, with no wrapper component: `import { XClose } from "@untitledui/icons"`. They inherit the text colour and are `aria-hidden` by default.
- **Licence:** commercial use is fine, but the set may not be redistributed. The "Foundations/Icons" story lists only the icons we use; add each new one there.
- **Missing icons:** a couple of small ones are drawn as components in `src/shared/icons/status-icons.tsx`, e.g. the solid check/alert circles in the banner.
- **User-edited SVGs** go in `src/shared/icons/svg/`, cleaned to use `currentColor`. They're imported as components via `vite-plugin-svgr` (`…svg?react`). The first one is `caret-down.svg`, used by the sidebar sections.

### Step 5 — Basic components (in progress)

**Done** (from the Figma screenshots), each with stories, a11y checks, a 320px worst-case story, and light/dark:

- **Button:** 6 Figma variants × 3 sizes, plus disabled.
  - A `ghost` variant and an `icon` size for icon-only controls.
  - Press feedback.
  - Tap area of at least 44px on touch screens.
- **Badge:** 6 variants.
- **Banner:**
  - 4 variants.
  - Screen readers hear the type ("Warning: …").
  - Errors use `role="alert"`; the others use `role="status"`.
  - Optional dismiss. This is also the "inline error block" for Step 6.
- **Tooltip:**
  - Simple and with a title.
  - It only animates on the delayed first open.
  - It doesn't open on touch, so use it only for hints that repeat a visible or labelled thing.
- **HelpTip:** the Figma's (?) help icon. It's a popover styled like the tooltip, so it opens on tap, click and keyboard. Phone users get the same help.

**Waiting for designs:** Input, Textarea, Label, Select, Checkbox, Radio, Switch, Avatar, Skeleton, Spinner, Separator.

**Designs received for Step 7 and later:**

- **Table** with its cell types: status bar, warning icon, checkbox, text, number, badge, conflict/resolved, amount + change, link, label, + button, chevron.
- **List item.**
- **Flight card:** a feature component for `features/flights`, not `shared/`.

### Step 6 — Feature flags, routing, dashboard layout and error pages ✅

**Routing:** TanStack Router, with routes defined in code. Every route is in `src/app/routes.tsx`, and links and redirects are type-checked. Pages are placeholders until their designs arrive.

**Dashboard layout (from the Figma):**

|            | Desktop (≥1024px)                                              | Mobile and tablet                                                                                      |
| ---------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Sidebar    | Gray column. Collapses with ⊟; the header gets an open button. | A sheet that slides in from the left (300ms iOS curve). Closes on tap outside, Esc, or picking a link. |
| Page panel | White, rounded, bordered                                       | Full screen, with safe-area padding                                                                    |
| Header     | Breadcrumbs plus page actions                                  | Menu button plus the current page name                                                                 |

**Accessibility:**

- Skip-to-content link.
- Focus moves to the new page's `<h1>` after navigation, including after tapping a link in the mobile sheet.
- Collapsing or opening the sidebar keeps keyboard focus on the matching button.
- The tab title updates on every page.

**Known placeholders:**

- The logo and avatar.
- The workspace switcher dropdown and the chat breadcrumb's ··· menu (no designs yet).
- Section labels use a darker gray than the Figma for contrast.

**Feature flags:**

- One typed file holds every flag and its default. A typo in a flag name is a TypeScript error.
- Local overrides go in `.env.local`.
- `<Feature flag="x">` hides or shows part of a page; the nav uses it.
- On a route, `beforeLoad: requireFlag("x")` makes a disabled route render the 404 page.
- Remote flag source is undecided. When it's chosen, only the flags file changes; call sites don't.
- Frontend flags only hide UI. Anything that must truly be restricted is enforced by the backend too.
- `darkMode` flag: off by default. When on, the theme toggle appears.

**Error pages and flows:**

| Type                                                | Accessibility                                  |
| --------------------------------------------------- | ---------------------------------------------- |
| 404 (also used for disabled routes)                 | focus moves to the heading; page title updates |
| Something went wrong (route error boundary + retry) | same; no technical error text shown to users   |
| Offline                                             | change announced to screen readers             |
| Inline error: `<Banner variant="error">` + retry    | `role="alert"`                                 |
| Form field errors (Zod)                             | `aria-invalid` + `aria-describedby`            |
| Toast errors for failed actions                     | Sonner's polite live region                    |

### Step 7 — Overlays, feedback and LLM components (in progress)

**Done** (in `src/features/chat/`, from the chat Figma):

- **PromptInput:**
  - Auto-grows up to 240px, then scrolls.
  - Enter sends, Shift+Enter adds a new line, and an empty box never sends. It's IME-safe.
  - Focus returns to the box after sending.
  - The send button uses `aria-disabled`, so its "Send a message" tooltip still works.
  - The ＋ and mic buttons only render when a handler is passed, so there are no dead buttons.
- **Suggestions ("Get started"):**
  - 4 cards: two columns on phones, four from 640px.
  - Dismissible.
  - Copy lightly corrected from the Figma ("Book an hotel(s)" → "Book a hotel", etc.).

**Animation fixes in the sidebar:**

- Desktop collapse/expand animates the width (250ms ease-in-out).
- Sections animate their height (200ms ease-out).
- Reduced motion: fades only, including the mobile sheet.

**Done** (in `src/shared/ui/`):

- **Table** (shadcn-based semantic `<table>`) plus the Figma cell types:
  - `TableStatusBar`, with an sr-only label.
  - `TableStatus`, a value with a coloured detail line.
  - `TableSortHead`, with `aria-sort`.
  - Small badges.
  - Scrolls sideways on phones.
  - No TanStack Table until real data needs it.
- **Checkbox:** includes the indeterminate state for "select all", and a 44px touch target.
- **ListItem:** default, selected (`aria-pressed`) and disabled. Works in scrolling lists.
- **Toast** (Sonner, headless on our tokens):
  - `toast()` plus `toast.success` / `.warning` / `.error`, with an optional description and action.
  - Errors stay 8s.
  - The type is read out ("Error: …").
  - Clears the iPhone home bar.
- **Input + Field:** the label, help and error are wired with `aria-invalid` / `aria-describedby`. Used with React Hook Form + Zod (`mode: "onTouched"`), and focus jumps to the first error.
- **Button:** a `secondary` variant and `xs` / `icon-xs` sizes, for dense places like table cells.

No design yet for Input/Field and Toast. They're built to match the existing look; adjust when the designs arrive.

**Waiting for the chat section:** chat messages, the "thinking" indicator, streaming text, LLM error states, and the Flights/Trains/Stays control.

**Waiting for designs:** Dialog/Drawer, Dropdown menu, Select, Tabs, Card, Empty state, Avatar, Skeleton.

The original Step 7 list, for reference:

- **Overlays and feedback:**
  - Dialog, which becomes a bottom-sheet Drawer on mobile
  - Dropdown menu, Popover, Tabs, Toast, Card, Table
  - Form field (RHF + Zod), Empty state
- **LLM components:**
  - Chat message (user / assistant)
  - Prompt input:
    - auto-grows
    - Enter sends, Shift+Enter adds a new line
    - `enterkeyhint="send"`
    - stays above the iOS keyboard
  - Streaming markdown text + code block
  - "Thinking" indicator
  - Suggestion chips
  - LLM error states (rate limited, stream cut off) built on the inline error block
- **Screen readers and streaming:** announce the _finished_ reply, not every streamed word.
- The final list is confirmed against each design screenshot. Build only what the designs use.

### Step 8 — Real iPhone check (deferred)

Parked on 2026-11-01 to move on to phase 2. Do it before launch: run `pnpm storybook:phone` and `pnpm dev:phone` and go through the list below on a real iPhone.

- Run the dev server on the LAN.
- Open Storybook in iPhone Safari, with Safari Web Inspector on the Mac.
- Test portrait, landscape and keyboard-open.
- Emulators don't reproduce iOS bugs.

## Definition of done (every component)

- [ ] Matches the design; every variant and state has a story (default, hover, focus, active, disabled, loading, error).
- [ ] Light and dark.
- [ ] Mobile:
  - [ ] inputs ≥ 16px
  - [ ] hover only on hover-capable devices
  - [ ] 44px tap targets
  - [ ] safe-area padding when the component sits at a screen edge
- [ ] Worst-case data story (long text, empty, 320px width, 200% zoom).
- [ ] Screen reader:
  - [ ] labelled controls
  - [ ] decorative icons hidden
  - [ ] logical focus order
  - [ ] visible focus ring
  - [ ] checked with VoiceOver
- [ ] Reduced motion keeps fades but drops movement.
- [ ] addon-a11y passes.
- [ ] Simplicity check passed (see Ground rules).

## Animation policy

| Animates                                          | Doesn't animate                                |
| ------------------------------------------------- | ---------------------------------------------- |
| Button press: scale 0.97, 150ms                   | Anything triggered from the keyboard           |
| Dropdowns / popovers: 200ms from the trigger      | Hover beyond a quick colour change             |
| Dialog: 250ms; mobile sheet: 500ms drawer easing  | Tab switches, tables, charts on load           |
| Toasts: enter and exit from the same side         | Spinners for things that finish in < 300ms     |
| Tooltip: delay on the first, instant for the next | Infinite loops on elements that stay on screen |
| New chat messages: gentle fade                    | Each streamed word                             |

Other rules:

- Animate only `transform` and `opacity`. Never `transition: all`. Never `scale(0)`.
- Never use ease-in on UI.
- Everything stays under 300ms except sheets and toasts.
- Run the `review-animations` skill after Step 7.

## Reference material

- **Vivida tokens and icons:** the local copy at `~/Downloads/vivida--staging.zip` (the GitHub repo is private or renamed). Take the values and icons, never the structure.
- **Emil Kowalski's skills:** https://github.com/emilkowalski/skills
- **Folder structure:** sign-translator `CLAUDE.md` + the NullVoxPopuli article.

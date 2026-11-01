# TravelOps

TravelOps is a customer-facing web app, powered by an LLM, for people who want to find and book flights. An existing backend calls the LLM; this repo is the frontend only.

Current plan: [docs/phase-1-plan.md](docs/phase-1-plan.md).

## Before every change, ask

1. Am I overcomplicating this?
2. Is it readable?
3. Is it too abstracted?
4. Is there an easier way?
5. Does it work with a screen reader and a keyboard?

Simple and obvious beats clever. Don't add an abstraction until the same code exists in three places.

## Stack

Vite + React 19 + TypeScript (strict) · Tailwind v4 · shadcn/ui (Radix) · React Hook Form + Zod · TanStack Router (code-based) · Storybook + Vitest · Biome · pnpm.

## Commands

| Command                | What it does                                                 |
| ---------------------- | ------------------------------------------------------------ |
| `pnpm dev`             | Dev server                                                   |
| `pnpm dev:phone`       | Dev server on the LAN, for testing on a real phone           |
| `pnpm build`           | Type-check + production build                                |
| `pnpm typecheck`       | Type-check only                                              |
| `pnpm lint`            | Biome lint + format check                                    |
| `pnpm format`          | Biome auto-fix + format                                      |
| `pnpm test`            | Every story as a test (renders + a11y), in headless Chromium |
| `pnpm storybook`       | Component viewer at localhost:6006                           |
| `pnpm storybook:phone` | Component viewer on the LAN, for a real phone                |

## Folder structure

```
src/
  app/
    routes.tsx  every route, in one file; route-level flags live here
    layout/     dashboard layout (sidebar + panel), the TravelOps sidebar contents, theme toggle
    pages/      404, error, and placeholder pages
  features/     one folder per feature: components/ hooks/ api/ utils/ types.ts index.ts
  shared/
    ui/         shadcn components restyled to our tokens, plus Page and Sidebar; stories beside each
    icons/      icons gallery story; svg/ holds custom SVGs the icon library lacks
    flags/      feature flag definitions + <Feature> gate
    hooks/      small shared hooks (e.g. useOnlineStatus)
    styles/     tokens.css, globals.css
    lib/        cn(), theme, focus helpers
```

- **Dependency direction:** `app → features → shared`. `shared/` never imports from `features/`, and features import each other only through their `index.ts`.
- **Where new code goes:** start inside the feature. Move it to `shared/` only when a second feature needs it.
- **Imports:** use the `@/` alias, never `../../`.
- **Routes:** `src/app/routes.tsx` is thin and holds no logic. Each route points at a page component, and TypeScript checks every `<Link to>` against it.
- **Pages:** every page renders inside `<Page title breadcrumbs actions>`. That gives it the tab title, the header, the offline notice and `<main>`.
  - Each page needs exactly one `<h1>`; focus moves there after navigation.
- **Feature folders:** create only the subfolders a feature actually needs.
- **Naming:** kebab-case file names (`prompt-input.tsx`), PascalCase components, hooks start with `use`.

## Styling rules

- **No raw values in screens.** No hex colours or one-off pixel values. Use tokens from `src/shared/styles/tokens.css`.
- **Missing variants:** if a component needs a variant it doesn't have, add the variant to the component. Never override styles from the outside.
- **Hover:** Tailwind v4's `hover:` only applies on devices that can hover, so it's safe. Never write raw `:hover` CSS outside `@media (hover: hover) and (pointer: fine)`.
- **Press feedback:** touch devices get it from `active:`.
- **Input font size:** inputs, textareas and selects stay at 16px or more on touch devices, or iOS zooms in. Use `text-base md:text-sm` if desktop needs smaller text.
- **Viewport height:** the app shell uses `100dvh` (`h-dvh`), never `100vh` / `h-screen`.
- **Edge-pinned UI:** fixed headers, bottom bars, sheets and toasts pad with `env(safe-area-inset-*)`.
- **Inner scroll areas:** sheets, chat lists and sidebars use `overscroll-contain`.

## Accessibility (screen readers first)

- **Labels:** every control has an accessible name. Icon-only buttons get `aria-label`.
- **Decorative icons:** `aria-hidden="true"`.
- **Focus:** keep the visible focus ring and a logical tab order. After a route change, focus moves to the page heading.
- **Errors:**
  - inline error blocks use `role="alert"`
  - form fields use `aria-invalid` + `aria-describedby`
  - toasts use Sonner's live region
- **Streaming chat:** announce the finished reply, not every streamed word.
- **Use semantic HTML before ARIA.** Radix primitives already handle focus trapping and dismissal; don't rebuild them.
- **Checking:** addon-a11y must pass. VoiceOver (Mac and iPhone) is the real check.

## Animation (restraint first)

Follow `.claude/skills/emil-design-eng` and `animate`.

- **Only animate with a reason:** orientation, feedback, or spatial continuity.
- **Never animate:**
  - anything triggered from the keyboard
  - high-frequency hovers
  - tab switches
  - tables or charts on load
  - each streamed word
- **Properties:**
  - only `transform` and `opacity`
  - never `transition: all`
  - never `scale(0)` (start at 0.95+)
  - never ease-in
- **Use the motion tokens in tokens.css.** Don't invent curves or durations.
- **Reduced motion:** keep fades, drop movement.

## Feature flags

- **Where they live:** all flags and their defaults are in `src/shared/flags/flags.ts`. Local overrides go in `.env.local` (see `.env.example`).
- **Gating a page section:** `<Feature flag="x">`.
- **Gating a route:** `beforeLoad: requireFlag("x")` in `routes.tsx`. A disabled route renders the 404 page.
- **Adding a flag:** add it to `flags.ts` and `.env.example`.
- **They only hide UI.** Anything that must truly be restricted is enforced by the backend too.
- **Remote source:** undecided. Only the flags module may change when it's chosen.
- **Dark mode:** behind the `darkMode` flag (off by default). It's for the team only, not users.

## Forms and feedback

- **Forms:** React Hook Form + Zod. The Zod schema is the single source of the rules and the TypeScript type (`z.infer`).
  - Use `mode: "onTouched"`.
  - Wrap each control in `<Field label error>{(control) => <Input {...control} {...register("x")} />}</Field>`.
- **Toasts:** use `toast` from `@/shared/ui/toast`, never import `sonner` directly. They're for quick feedback on actions.
  - Errors a user must act on in place go in a `<Banner variant="error">` instead.

## Testing (don't over-test)

- **Every component has stories.** Stories run as smoke tests plus a11y checks via Vitest.
- **Interaction tests:** only for components with real behaviour, such as the prompt input or a dialog closing on Esc.
- **Unit tests:** only for real logic in `lib/` or `features/*/utils`.
- **Playwright end-to-end tests:** start when real API flows exist (phase 2).

## Git (several Claude sessions work in parallel)

- **One branch per section:** `chat-ui`, `bookings-ui`, … Each session works in its own folder or git worktree.
- **Never reset, force-move or rewrite `main`.** Other sessions' commits live there; resetting it silently drops them.
- **To put your work on `main`:**
  1. Merge `main` into your branch first and fix any conflicts there.
  2. Run `pnpm lint`, `typecheck`, `test` and `build`.
  3. Then `git switch main && git merge --ff-only <your-branch>`. If the fast-forward is refused, `main` moved: go back to step 1.
- **Commit messages** have no "Co-Authored-By" or other attribution lines.
- **Screenshots aren't in git** (`uiscreenshot/` is ignored). Sessions in a worktree read them from `/Users/ifeoluwa/personal/travelOps/uiscreenshot/`.

## Mobile

- **Test on a real iPhone:** run `pnpm dev:phone`, open the LAN URL in Safari, and inspect with Safari Web Inspector on the Mac.
- **Emulation isn't enough:** device emulation does not reproduce iOS bugs.
- **Fixes:** see `.claude/skills/mobile-native`.

## Design references

- **Designs:** arrive section by section as screenshots.
- **Tokens:** `src/shared/styles/tokens.css` is the only place colours, fonts, shadows and easings are defined.
  - The colours were sampled from the Figma screenshots.
  - Spacing and radius are Tailwind defaults.
  - When the TravelOps colour guide arrives, update this file only.
- **Icons:** `@untitledui/icons`, which is the set the Figma uses.
  - Import icons directly (`import { XClose } from "@untitledui/icons"`).
  - Never use lucide-react, including in shadcn components; swap the icons when adding a component.
  - Add each new icon to the gallery in `src/shared/icons/icons.stories.tsx`.
  - Licence: no redistributing the icon set.
- **Icons the free set lacks:** small ones are drawn as components in `src/shared/icons/status-icons.tsx`, with the same API as Untitled icons.
- **User-edited SVGs:** go in `src/shared/icons/svg/`, using `currentColor`.
  - Replace hardcoded fill and stroke colours with `currentColor`.
  - Import them as components: `import CaretDown from "@/shared/icons/svg/caret-down.svg?react"`. They're `aria-hidden` by default.
  - Add each one to the icon gallery.
- **Contrast:** where the design fails WCAG AA, use a deeper shade of the same colour, e.g. error-600 not coral, and 700 text on tinted backgrounds.
- **Tooltips never open on touch.** For help a phone user needs, use `<HelpTip>`, which opens on tap.

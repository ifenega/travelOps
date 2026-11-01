// Every feature flag and its default, in one place.
//
// Override any flag on your machine in .env.local (see .env.example):
//   VITE_FLAG_DARK_MODE=true
//
// Flags only hide UI. Anything that must truly be restricted is enforced by the backend too.
// When a remote flag source is chosen, only this file changes; call sites stay the same.

/** Reads an override ("true" / "false") from the environment, otherwise uses the default. */
function flag(override: string | undefined, defaultValue: boolean) {
  if (override === "true") return true
  if (override === "false") return false
  return defaultValue
}

const env = import.meta.env

export const flags = {
  /** Theme toggle in the sidebar. Team-only for now. */
  darkMode: flag(env.VITE_FLAG_DARK_MODE, false),
  bookings: flag(env.VITE_FLAG_BOOKINGS, true),
  expenses: flag(env.VITE_FLAG_EXPENSES, true),
  wallet: flag(env.VITE_FLAG_WALLET, true),
  policies: flag(env.VITE_FLAG_POLICIES, true),
  reports: flag(env.VITE_FLAG_REPORTS, true),
}

export type FlagName = keyof typeof flags

export function isEnabled(name: FlagName) {
  return flags[name]
}

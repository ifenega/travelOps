// Light/dark theme. Dark mode is behind the darkMode flag and team-only for now.

export type Theme = "light" | "dark"

const storageKey = "travelops-theme"

export function getStoredTheme(): Theme {
  try {
    return localStorage.getItem(storageKey) === "dark" ? "dark" : "light"
  } catch {
    return "light" // Storage can be blocked (private mode); light is the safe default.
  }
}

/** Switches the theme class, and the browser chrome (status bar, form controls) to match. */
export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#141414" : "#ffffff")
  document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", theme)
}

export function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(storageKey, theme)
  } catch {
    // Not saved, but still applied for this visit.
  }
  applyTheme(theme)
}

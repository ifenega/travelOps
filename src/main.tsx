import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "@/app/app"
import { isEnabled } from "@/shared/flags/flags"
import { applyTheme, getStoredTheme } from "@/shared/lib/theme"
import "@/shared/styles/globals.css"

// Apply a saved dark theme before the first paint, so there's no flash of light mode.
if (isEnabled("darkMode")) applyTheme(getStoredTheme())

const root = document.getElementById("root")
if (!root) throw new Error("Missing #root element in index.html")

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

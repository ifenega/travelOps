import { Moon01, Sun } from "@untitledui/icons"
import { useState } from "react"
import { getStoredTheme, saveTheme } from "@/shared/lib/theme"
import { Button } from "@/shared/ui/button"

/** Light/dark switch. Only rendered when the darkMode flag is on. */
export function ThemeToggle() {
  const [theme, setTheme] = useState(getStoredTheme)
  const next = theme === "dark" ? "light" : "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Switch to ${next} mode`}
      onClick={() => {
        saveTheme(next)
        setTheme(next)
      }}
    >
      {theme === "dark" ? <Sun /> : <Moon01 />}
    </Button>
  )
}

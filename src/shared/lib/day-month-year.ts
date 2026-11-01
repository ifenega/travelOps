// Dates typed as DD/MM/YYYY (the Figma's date fields), to and from Date objects.

/** 2026-01-31 → "31/01/2026" (local date). */
export function formatDayMonthYear(date: Date) {
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${day}/${month}/${date.getFullYear()}`
}

/** "31/01/2026" → that local date, or null if it isn't a real DD/MM/YYYY date. */
export function parseDayMonthYear(text: string): Date | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim())
  if (!match) return null
  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(year, month - 1, day)
  // Rejects dates that roll over, like 31/02/2026.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }
  return date
}

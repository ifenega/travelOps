import { z } from "zod"

const emailSchema = z.email()

export function isValidEmail(text: string) {
  return emailSchema.safeParse(text).success
}

/** Pasted or typed text → separate emails. Commas, semicolons, spaces and new lines all separate. */
export function splitEmails(text: string) {
  return text
    .split(/[\s,;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

/** Adds new emails to a list, skipping ones already there (ignoring case). */
export function addEmails(list: string[], text: string) {
  const seen = new Set(list.map((email) => email.toLowerCase()))
  const added = splitEmails(text).filter((email) => {
    const key = email.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return [...list, ...added]
}

/** "timilehin.folagbade@example.com" → "tim***de@example.com", as in "Copy will be sent to …". */
export function maskEmail(email: string) {
  const [name = "", domain = ""] = email.split("@")
  if (name.length <= 5) return `${name.slice(0, 1)}***@${domain}`
  return `${name.slice(0, 3)}***${name.slice(-2)}@${domain}`
}

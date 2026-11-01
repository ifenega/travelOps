import { describe, expect, it } from "vitest"
import { addEmails, isValidEmail, maskEmail, splitEmails } from "./emails"

describe("emails", () => {
  it("splits pasted text on commas, semicolons, spaces and new lines", () => {
    expect(splitEmails("a@x.com, b@x.com;c@x.com\nd@x.com  e@x.com,")).toEqual([
      "a@x.com",
      "b@x.com",
      "c@x.com",
      "d@x.com",
      "e@x.com",
    ])
  })

  it("adds new emails without repeating ones already there", () => {
    expect(addEmails(["a@x.com"], "A@x.com, b@x.com, b@x.com")).toEqual(["a@x.com", "b@x.com"])
  })

  it("checks emails", () => {
    expect(isValidEmail("fred@gmail.com")).toBe(true)
    expect(isValidEmail("fred@gmail")).toBe(false)
  })

  it("masks the signed-in user's email like the design", () => {
    expect(maskEmail("timilehinfolagbade@gmail.com")).toBe("tim***de@gmail.com")
    expect(maskEmail("ada@x.com")).toBe("a***@x.com")
  })
})

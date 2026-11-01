import { describe, expect, it } from "vitest"
import { ageOn, passengerSchema } from "./passenger"

const flyDay = new Date(2026, 5, 26) // Jun 26, 2026

describe("ageOn", () => {
  it("counts a birthday on the day", () => {
    expect(ageOn("2016-06-26", flyDay)).toBe(10)
  })
  it("doesn't count a birthday later in the year", () => {
    expect(ageOn("2016-06-27", flyDay)).toBe(9)
    expect(ageOn("2016-12-01", flyDay)).toBe(9)
  })
})

describe("passengerSchema", () => {
  const details = { title: "Mr", firstName: "Ade", lastName: "Bello" }

  it("doesn't ask adults for a date of birth", () => {
    expect(passengerSchema("adult", flyDay).safeParse(details).success).toBe(true)
  })
  it("needs a child to be 2 to 17 on the day they fly", () => {
    const child = passengerSchema("child", flyDay)
    expect(child.safeParse({ ...details, dateOfBirth: "2015-08-10" }).success).toBe(true)
    expect(child.safeParse({ ...details, dateOfBirth: "2025-01-01" }).success).toBe(false)
    expect(child.safeParse({ ...details, dateOfBirth: "" }).success).toBe(false)
  })
  it("needs an infant to be under 2 on the day they fly", () => {
    const infant = passengerSchema("infant", flyDay)
    expect(infant.safeParse({ ...details, dateOfBirth: "2025-01-01" }).success).toBe(true)
    expect(infant.safeParse({ ...details, dateOfBirth: "2024-06-26" }).success).toBe(false)
  })
})

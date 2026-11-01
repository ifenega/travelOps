import { z } from "zod"
import type { PassengerType } from "../types"

// The rules for a passenger's details (design screen 20). One schema per passenger type, since
// children and infants need a date of birth that fits their type on the day they fly.

/** Whole years between a date of birth ("YYYY-MM-DD") and a day. */
export function ageOn(dateOfBirth: string, day: Date) {
  const [year, month, date] = dateOfBirth.split("-").map(Number)
  let age = day.getFullYear() - year
  const beforeBirthday =
    day.getMonth() + 1 < month || (day.getMonth() + 1 === month && day.getDate() < date)
  if (beforeBirthday) age -= 1
  return age
}

const ageRules: Record<
  Exclude<PassengerType, "adult">,
  { min: number; max: number; message: string }
> = {
  child: { min: 2, max: 17, message: "A child is 2 to 17 years old on the day they fly" },
  infant: { min: 0, max: 1, message: "An infant is under 2 years old on the day they fly" },
}

export function passengerSchema(type: PassengerType, travelDate: Date) {
  const base = {
    title: z.string().min(1, "Choose a title"),
    firstName: z.string().trim().min(1, "Enter the first name, as on their passport"),
    lastName: z.string().trim().min(1, "Enter the last name, as on their passport"),
  }
  if (type === "adult") return z.object({ ...base, dateOfBirth: z.string().optional() })

  const rule = ageRules[type]
  return z.object({
    ...base,
    dateOfBirth: z
      .string()
      .min(1, "Enter the date of birth")
      .refine((value) => {
        const age = ageOn(value, travelDate)
        return age >= rule.min && age <= rule.max
      }, rule.message),
  })
}

export const typeLabels: Record<PassengerType, string> = {
  adult: "Adult",
  child: "Child",
  infant: "Infant",
}

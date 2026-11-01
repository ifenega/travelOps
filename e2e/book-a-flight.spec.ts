import { expect, type Page, test } from "@playwright/test"

// The main journey: search from the chat, answer Sparky, pick flights and fares, fill in the
// passenger, and pay (the first payment fails on purpose, then Retry succeeds).

async function pickPlace(page: Page, field: "From" | "To", text: string, option: RegExp) {
  await page.getByRole("combobox", { name: field }).fill(text)
  await page.getByRole("option", { name: option }).click()
}

test("book a round trip from the chat", async ({ page }) => {
  await page.goto("/chat")

  // Search: Lagos (a city, so Sparky asks which airport) to Athens, next month.
  await page.getByRole("radio", { name: "Flights" }).click()
  await pickPlace(page, "From", "Lagos", /^Lagos/)
  await pickPlace(page, "To", "Athens", /Eleftherios/)
  await page.getByRole("button", { name: /^When/ }).click()
  const dates = page.getByRole("dialog", { name: "Travel dates" })
  await dates.getByRole("button", { name: /next month/i }).click()
  await dates
    .getByRole("button", { name: /\b10th\b/ })
    .first()
    .click()
  await dates
    .getByRole("button", { name: /\b15th\b/ })
    .first()
    .click()
  await dates.getByRole("button", { name: "Done" }).click()
  await page.getByRole("button", { name: /^Passengers/ }).click()
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Search flights" }).click()

  // Sparky asks for the airport.
  const question = page.getByRole("region", { name: "What airport would you like to depart from?" })
  await question.getByRole("button", { name: /^Lagos/ }).click()
  await question.getByRole("button", { name: "Next", exact: true }).click()

  // Results in the chat, then full width.
  await expect(page.getByRole("region", { name: "Flight results" })).toBeVisible()
  await page.getByRole("button", { name: "See more flights" }).click()
  await expect(page.getByRole("heading", { level: 1, name: /Departing flight for/ })).toBeVisible()

  // Departing: first flight, first fare.
  await page
    .getByRole("button", { name: /^Select .* flight$/ })
    .first()
    .click()
  await page
    .getByRole("list", { name: "Fare options" })
    .getByRole("button", { name: /^Select/ })
    .first()
    .click()

  // Return: the departing flight is pinned above.
  await expect(page.getByRole("heading", { level: 1, name: /Return flight for/ })).toBeVisible()
  await expect(page.getByRole("region", { name: "Your departing flight" })).toBeVisible()
  await page
    .getByRole("button", { name: /^Select .* flight$/ })
    .first()
    .click()
  await page
    .getByRole("list", { name: "Fare options" })
    .getByRole("button", { name: /^Select/ })
    .first()
    .click()

  // Passengers: proceeding too early says what's missing.
  await expect(page.getByRole("heading", { level: 1, name: "Passengers" })).toBeVisible()
  await page.getByRole("button", { name: "Proceed" }).click()
  await expect(page.getByRole("alert").filter({ hasText: "Before you continue" })).toBeVisible()

  await page.getByRole("combobox", { name: "Title" }).click()
  await page.getByRole("option", { name: "Ms" }).click()
  await page.getByLabel("First name").fill("Ifeoluwa")
  await page.getByLabel("Last name").fill("Olorunnega")
  await page.getByRole("button", { name: "Confirm" }).click()
  await expect(page.getByRole("button", { name: /Ifeoluwa Olorunnega/ })).toBeVisible()

  // "fail" in the email makes the mock's first payment fail.
  await page.getByLabel("Email address").fill("fail@example.com")
  await page.getByLabel("Phone number").fill("+234 803 000 0000")
  await page.getByLabel("Postal address").fill("12 Gregory Street, London")
  const terms = page.getByRole("checkbox", { name: /I accept/ })
  await terms.click()
  await expect(terms).toBeChecked()
  await page.getByRole("button", { name: "Proceed" }).click()

  // Seats and extras, then the itinerary.
  await expect(page.getByRole("heading", { level: 1, name: "Seats" })).toBeVisible()
  await page.getByRole("button", { name: "Proceed" }).click()
  await expect(
    page.getByRole("heading", { level: 1, name: "Review your trip itinerary" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Continue to checkout" }).click()

  // Payment: fails, then Retry succeeds.
  await expect(page.getByRole("heading", { level: 1, name: "Purchase failed" })).toBeVisible()
  await page.getByRole("button", { name: "Retry payment" }).click()
  await expect(page.getByRole("heading", { level: 1, name: "Purchase successful" })).toBeVisible()
  await expect(page.getByText(/^ORD \d{6}$/)).toBeVisible()
})

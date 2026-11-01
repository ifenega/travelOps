import { expect, test } from "@playwright/test"

// Managing trips after booking: find a trip, open it, share it with the team, then delete one
// from the list. Runs on the mock bookings service, desktop and phone.

test("find, open, share and delete trips", async ({ page }) => {
  await page.goto("/bookings")

  // Search narrows the list.
  await page.getByRole("searchbox", { name: "Search trips" }).fill("paris")
  await expect(page.getByRole("link", { name: "Weekend in Paris" })).toBeVisible()
  await expect(page.getByRole("link", { name: "United States trip" })).toHaveCount(0)
  await page.getByRole("button", { name: "Clear search" }).click()

  // Open a trip: its timeline, and a tab per kind of leg.
  await page.getByRole("link", { name: "United States trip" }).click()
  await expect(page.getByRole("heading", { level: 1, name: "United States trip" })).toBeVisible()
  await expect(page.getByText("Layover in Doha: ~2h 35m")).toBeVisible()
  await page.getByRole("tab", { name: "Trains" }).click()
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Train from New York (NYP) to Philadelphia (PHL)",
    }),
  ).toBeVisible()
  await page.getByRole("link", { name: "Back to bookings" }).click()

  // Share: send it to two team members by email.
  await page.getByRole("button", { name: "Manage United States trip" }).click()
  await page.getByRole("menuitem", { name: "Share trip" }).click()
  const share = page.getByRole("dialog", { name: "Share trip" })
  await share.getByRole("switch", { name: "Send via email" }).click()
  await share.getByRole("combobox", { name: "Send to" }).click()
  // Team members load first; then Enter picks the highlighted one and the list stays open.
  await expect(share.getByRole("option").first()).toBeVisible()
  await page.keyboard.press("Enter")
  await expect(share.getByRole("button", { name: /^Remove / })).toHaveCount(1)
  await page.keyboard.press("Enter")
  await expect(share.getByRole("button", { name: /^Remove / })).toHaveCount(2)
  await page.keyboard.press("Escape")
  await expect(share).toBeVisible()
  await share.getByRole("button", { name: "Send" }).click()
  await expect(page.getByText("Trip shared with 2 people")).toBeVisible()
  await share.getByRole("button", { name: "Close" }).click()

  // Delete: asks first, then the card goes.
  await page.getByRole("button", { name: "Manage Train to London" }).click()
  await page.getByRole("menuitem", { name: "Delete booking" }).click()
  await page
    .getByRole("alertdialog", { name: "Delete Train to London?" })
    .getByRole("button", { name: "Delete" })
    .click()
  await expect(page.getByText("Train to London deleted")).toBeVisible()
  await expect(page.getByRole("link", { name: "Train to London" })).toHaveCount(0)
})

import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, waitFor, within } from "storybook/test"
import { SearchBar } from "./search-bar"

const meta = {
  title: "Chat/SearchBar",
  component: SearchBar,
  args: { onSearch: fn() },
  parameters: { layout: "padded" },
  globals: { viewport: { value: "desktop" } },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-3xl pb-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchBar>

export default meta
type Story = StoryObj<typeof meta>

/** Mirrors the Figma: nothing selected until a mode is picked. */
export const Default: Story = {}

/** Phones: the fields stack in a card with a full-width Search button. */
export const Phone: Story = {
  globals: { viewport: { value: "mobile2" } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Flights" }))
  },
}

/** Behaviour: searching with nothing filled in names the first problem and moves focus to it. */
export const Validation: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Flights" }))
    await userEvent.click(canvas.getByRole("button", { name: "Search flights" }))

    const alert = await canvas.findByRole("alert")
    await expect(alert).toHaveTextContent("Choose where you're leaving from")
    const from = canvas.getByRole("combobox", { name: "From" })
    await expect(from).toHaveFocus()
    await expect(from).toHaveAttribute("aria-invalid", "true")
    await expect(from).toHaveAccessibleDescription(/leaving from/)
  },
}

/** Behaviour: a full flight search by keyboard and mouse, including a child who needs an age. */
export const SearchingFlights: Story = {
  play: async ({ canvas, userEvent, args, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole("radio", { name: "Flights" }))

    // From / To: type, then pick the airport (the city of the same name is listed first).
    await userEvent.type(canvas.getByRole("combobox", { name: "From" }), "Lagos")
    await userEvent.click(await canvas.findByRole("option", { name: /Murtala Muhammed/ }))
    await userEvent.type(await canvas.findByRole("combobox", { name: "To" }), "Athens")
    await userEvent.click(await canvas.findByRole("option", { name: /Eleftherios Venizelos/ }))

    // Swap, then swap back.
    await userEvent.click(canvas.getByRole("button", { name: "Swap from and to" }))
    await expect(canvas.getByRole("combobox", { name: "From" })).toHaveValue(
      "Athens Eleftherios Venizelos (ATH)",
    )
    await userEvent.click(canvas.getByRole("button", { name: "Swap from and to" }))

    // When: next month, the 10th to the 15th.
    await userEvent.click(canvas.getByRole("button", { name: /^When/ }))
    const dates = within(await page.findByRole("dialog", { name: "Travel dates" }))
    await userEvent.click(dates.getByRole("button", { name: /next month/i }))
    await userEvent.click(dates.getAllByRole("button", { name: /\b10th\b/ })[0])
    await userEvent.click(dates.getAllByRole("button", { name: /\b15th\b/ })[0])
    await userEvent.click(dates.getByRole("button", { name: "Done" }))
    // While a popover is open the page behind it is hidden from screen readers, so wait for it.
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull())

    // Passengers: add a child but don't give an age yet.
    await userEvent.click(canvas.getByRole("button", { name: /^Passengers/ }))
    const passengers = within(await page.findByRole("dialog", { name: "Passengers" }))
    await userEvent.click(passengers.getByRole("button", { name: "Add child" }))
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull())

    await userEvent.click(canvas.getByRole("button", { name: "Search flights" }))
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Choose an age for each child")
    await expect(args.onSearch).not.toHaveBeenCalled()

    // Give the child an age, then search.
    await userEvent.click(canvas.getByRole("button", { name: /^Passengers/ }))
    const again = within(await page.findByRole("dialog", { name: "Passengers" }))
    await userEvent.click(again.getByRole("combobox", { name: "Child 1 age" }))
    await userEvent.click(await page.findByRole("option", { name: "7 years old" }))
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(canvas.queryByRole("alert")).toBeNull())

    await userEvent.click(canvas.getByRole("button", { name: "Search flights" }))
    await expect(args.onSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "flights",
        origin: expect.objectContaining({ id: "LOS" }),
        destination: expect.objectContaining({ id: "ATH" }),
        travellers: { adults: 1, childAges: [7], infants: 0, pets: 0 },
      }),
    )
  },
}

/** Stays: Where · When · Guests. */
export const Stays: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Stays" }))
    await expect(canvas.getByRole("combobox", { name: "Where" })).toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: /^Guests/ })).toBeInTheDocument()
  },
}

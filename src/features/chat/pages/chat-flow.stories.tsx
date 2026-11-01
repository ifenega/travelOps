import type { Meta, StoryObj } from "@storybook/react-vite"
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router"
import { useState } from "react"
import { expect, waitFor, within } from "storybook/test"
import { createAppRouter } from "@/app/routes"

// The chat as a whole, through the real app routes and the mock chat service.

function ChatApp() {
  const [router] = useState(() =>
    createAppRouter(createMemoryHistory({ initialEntries: ["/chat"] })),
  )
  return <RouterProvider router={router} />
}

const meta = {
  title: "Chat/Flow",
  render: () => <ChatApp />,
  parameters: { layout: "fullscreen" },
  globals: { viewport: { value: "desktop" } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Start on the new chat page. Send a message or search to open a conversation. */
export const NewChat: Story = {}

const slow = { timeout: 8000 }

/** Behaviour: send → the conversation opens → Sparky thinks → the reply streams in; ↑ recalls. */
export const SendingAMessage: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      await canvas.findByRole("textbox", { name: "Message" }),
      "Weekend in Athens{Enter}",
    )

    await canvas.findByRole("heading", { level: 1, name: "Weekend in Athens" })
    await expect(await canvas.findByText("Sparky is thinking")).toBeInTheDocument()
    await waitFor(
      () => expect(canvas.getByText(/Happy to help with "Weekend in Athens"/)).toBeInTheDocument(),
      slow,
    )
    // The recent chats list in the sidebar picks it up.
    await expect(canvas.getByRole("link", { name: "Weekend in Athens" })).toBeInTheDocument()

    const input = canvas.getByRole("textbox", { name: "Message" })
    await userEvent.type(input, "And a hotel{Enter}")
    await waitFor(() => expect(canvas.getAllByText(/Happy to help/)).toHaveLength(2), slow)
    await userEvent.click(input)
    await userEvent.keyboard("{ArrowUp}")
    await expect(input).toHaveValue("And a hotel")
  },
}

/** Behaviour: a search from a city gets Sparky's airport question; answering continues the chat. */
export const AnsweringAQuestion: Story = {
  play: async ({ canvas, userEvent, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(await canvas.findByRole("radio", { name: "Flights" }))
    await userEvent.type(canvas.getByRole("combobox", { name: "From" }), "Lagos")
    await userEvent.click(await canvas.findByRole("option", { name: /^Lagos/ }))
    await userEvent.type(canvas.getByRole("combobox", { name: "To" }), "Athens")
    await userEvent.click(await canvas.findByRole("option", { name: /Eleftherios/ }))
    await userEvent.click(canvas.getByRole("button", { name: /^When/ }))
    const dates = within(await page.findByRole("dialog", { name: "Travel dates" }))
    await userEvent.click(dates.getByRole("button", { name: /next month/i }))
    await userEvent.click(dates.getAllByRole("button", { name: /\b10th\b/ })[0])
    await userEvent.click(dates.getAllByRole("button", { name: /\b15th\b/ })[0])
    await userEvent.click(dates.getByRole("button", { name: "Done" }))
    await userEvent.click(canvas.getByRole("button", { name: /^Passengers/ }))
    await userEvent.keyboard("{Escape}")
    await userEvent.click(canvas.getByRole("button", { name: "Search flights" }))

    // The summary bubble, then Sparky's question in place of the prompt.
    await canvas.findByRole("heading", { level: 1, name: "Round trip flight from Lagos to Athens" })
    await expect(canvas.getByText("Who's flying?")).toBeInTheDocument()
    const question = await waitFor(
      () => canvas.getByRole("region", { name: "What airport would you like to depart from?" }),
      slow,
    )
    await expect(canvas.queryByRole("textbox", { name: "Message" })).toBeNull()

    const ask = within(question)
    await userEvent.click(ask.getByRole("button", { name: /Abuja/ }))
    await userEvent.click(ask.getByRole("button", { name: "Next" }))
    await waitFor(() =>
      expect(canvas.getByRole("textbox", { name: "Message" })).toBeInTheDocument(),
    )
    await expect(canvas.getByText("Abuja")).toBeInTheDocument()
  },
}

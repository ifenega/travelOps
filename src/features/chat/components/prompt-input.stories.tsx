import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import { PromptInput } from "./prompt-input"

const meta = {
  title: "Chat/PromptInput",
  component: PromptInput,
  args: { onSubmit: fn(), onAttach: fn(), onVoiceInput: fn() },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-180">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PromptInput>

export default meta
type Story = StoryObj<typeof meta>

/** Mirrors the Figma. Hover the send button for its tooltip. */
export const Default: Story = {}

/** Until attachments and voice input work, those buttons are simply left out. */
export const SendOnly: Story = { args: { onAttach: undefined, onVoiceInput: undefined } }

/** Behaviour: Enter sends the trimmed text and clears; Shift+Enter is a new line; empty never sends. */
export const Sending: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const input = canvas.getByRole("textbox", { name: "Message" })
    const send = canvas.getByRole("button", { name: "Send message" })

    await expect(send).toHaveAttribute("aria-disabled", "true")
    await userEvent.click(input)
    await userEvent.keyboard("{Enter}")
    await expect(args.onSubmit).not.toHaveBeenCalled()

    await userEvent.type(input, "  Flights to Athens{Shift>}{Enter}{/Shift}in May  ")
    await expect(input).toHaveValue("  Flights to Athens\nin May  ")
    await expect(send).toHaveAttribute("aria-disabled", "false")

    await userEvent.keyboard("{Enter}")
    await expect(args.onSubmit).toHaveBeenCalledWith("Flights to Athens\nin May")
    await expect(input).toHaveValue("")
    await expect(input).toHaveFocus()
  },
}

/** Behaviour: ↑ / ↓ step through earlier prompts; past the newest, the draft comes back. */
export const History: Story = {
  args: { history: ["Flights to Athens in May", "Hotels near the Acropolis"] },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Message" })
    await userEvent.type(input, "draft")
    await userEvent.keyboard("{ArrowUp}")
    await expect(input).toHaveValue("Hotels near the Acropolis")
    await userEvent.keyboard("{ArrowUp}")
    await expect(input).toHaveValue("Flights to Athens in May")
    await userEvent.keyboard("{ArrowUp}") // already the oldest: stays
    await expect(input).toHaveValue("Flights to Athens in May")
    await userEvent.keyboard("{ArrowDown}{ArrowDown}")
    await expect(input).toHaveValue("draft")
  },
}

/** Long messages grow the box up to a limit, then scroll inside it. */
export const LongMessage: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Message" })
    await userEvent.type(
      input,
      "I need a return flight from Lagos to Athens for four people, leaving on the 12th of May and coming back on the 26th. Two adults and two children aged 7 and 10. We'd prefer one stop at most, a morning departure, and seats together. Please also check whether we need visas for a layover in Istanbul, and what the baggage allowance is on Turkish Airlines for economy.",
    )
  },
}

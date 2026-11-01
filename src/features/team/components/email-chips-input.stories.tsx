import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { expect } from "storybook/test"
import { Field } from "@/shared/ui/field"
import { EmailChipsInput } from "./email-chips-input"

function Emails({ initial = [] }: { initial?: string[] }) {
  const [emails, setEmails] = useState(initial)
  return (
    <div className="flex max-w-md flex-col gap-3">
      <Field label="Email">
        {(c) => <EmailChipsInput {...c} value={emails} onChange={setEmails} />}
      </Field>
      <p className="text-muted-foreground text-sm">Emails: {emails.join(" | ") || "none"}</p>
    </div>
  )
}

const meta = {
  title: "Team/EmailChipsInput",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = { render: () => <Emails /> }

/** The design's three chips, plus one that isn't a valid email (red, and said in words). */
export const WithChips: Story = {
  render: () => <Emails initial={["timilehin@gmail.com", "fred@gmail.com", "usera@gmail"]} />,
}

/** Behaviour: commas, spaces and Enter make chips; repeats are skipped; Backspace removes the last. */
export const Typing: Story = {
  render: () => <Emails />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Email" })
    await userEvent.type(input, "a@x.com, b@x.com A@x.com c@x.com{Enter}")
    await expect(canvas.getByText("Emails: a@x.com | b@x.com | c@x.com")).toBeInTheDocument()

    await userEvent.keyboard("{Backspace}")
    await expect(canvas.getByText("Emails: a@x.com | b@x.com")).toBeInTheDocument()

    await userEvent.click(canvas.getByRole("button", { name: "Remove a@x.com" }))
    await expect(canvas.getByText("Emails: b@x.com")).toBeInTheDocument()
  },
}

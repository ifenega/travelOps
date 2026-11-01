import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { expect, waitFor } from "storybook/test"
import { seedTeamMembers } from "../api/mock-data"
import type { TeamMember } from "../types"
import { RecipientPicker } from "./recipient-picker"

function Picker({ initial = [] }: { initial?: TeamMember[] }) {
  const [selected, setSelected] = useState(initial)
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <RecipientPicker members={seedTeamMembers} selected={selected} onChange={setSelected} />
      <p className="text-muted-foreground text-sm">
        Sending to: {selected.map((m) => m.name).join(", ") || "no one"}
      </p>
    </div>
  )
}

const meta = {
  title: "Bookings/RecipientPicker",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = { render: () => <Picker /> }

export const TwoPicked: Story = {
  render: () => <Picker initial={seedTeamMembers.slice(0, 2)} />,
}

/** Behaviour: type to filter, Enter picks, the list stays open for the next person, Backspace removes. */
export const Keyboard: Story = {
  render: () => <Picker />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Send to" })
    await userEvent.click(input)
    await userEvent.type(input, "ada")
    await userEvent.keyboard("{Enter}")
    await expect(canvas.getByText("Sending to: Ada Nwosu")).toBeInTheDocument()
    await expect(input).toHaveValue("")

    // Ada is no longer offered.
    await expect(canvas.queryByRole("option", { name: /Ada Nwosu/ })).toBeNull()
    await userEvent.keyboard("{Enter}")
    await expect(canvas.getByText("Sending to: Ada Nwosu, Timilehin Folagbade")).toBeInTheDocument()

    await userEvent.keyboard("{Escape}{Backspace}")
    await waitFor(() => expect(canvas.getByText("Sending to: Ada Nwosu")).toBeInTheDocument())
  },
}

/** Behaviour: each chip's ✕ removes that person. */
export const RemoveChip: Story = {
  render: () => <Picker initial={seedTeamMembers.slice(0, 2)} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Remove Timilehin Folagbade" }))
    await expect(canvas.getByText("Sending to: Ifeoluwa Olorunnegan")).toBeInTheDocument()
  },
}

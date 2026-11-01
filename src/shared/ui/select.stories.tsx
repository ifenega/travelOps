import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { expect, waitFor } from "storybook/test"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

const ages = Array.from({ length: 16 }, (_, index) => String(index + 2)) // 2–17

function ChildAge() {
  const [age, setAge] = useState("")
  return (
    <div className="flex flex-col gap-3">
      <Select value={age} onValueChange={setAge}>
        <SelectTrigger aria-label="Child 1 age" className="w-40">
          <SelectValue placeholder="Select age" />
        </SelectTrigger>
        <SelectContent aria-label="Child 1 age">
          {ages.map((value) => (
            <SelectItem key={value} value={value}>
              {value} years old
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-muted-foreground text-sm">Age: {age || "not chosen"}</p>
    </div>
  )
}

const meta = {
  title: "Components/Select",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** The Figma's child age picker. */
export const ChildAgeExample: Story = { render: () => <ChildAge /> }

/** Behaviour: works fully by keyboard. */
export const Keyboard: Story = {
  render: () => <ChildAge />,
  play: async ({ canvas, userEvent, canvasElement }) => {
    const trigger = canvas.getByRole("combobox", { name: "Child 1 age" })
    trigger.focus()
    await userEvent.keyboard("{Enter}")
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"))
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}")
    await waitFor(() => expect(canvas.getByText("Age: 4")).toBeInTheDocument())
    await expect(trigger).toHaveTextContent("4 years old")
    // Let the list finish closing before the a11y check runs.
    await waitFor(() =>
      expect(canvasElement.ownerDocument.querySelector('[role="listbox"]')).toBeNull(),
    )
    await expect(trigger).toHaveFocus()
  },
}

import type { Meta, StoryObj } from "@storybook/react-vite"
import { Checkbox } from "./checkbox"

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-sm">
      {(
        [
          ["Unchecked", false, false],
          ["Checked", true, false],
          ["Some selected", "indeterminate", false],
          ["Disabled", false, true],
          ["Disabled and checked", true, true],
        ] as const
      ).map(([label, checked, disabled]) => {
        const id = `checkbox-${label.replaceAll(" ", "-").toLowerCase()}`
        return (
          <div key={label} className="flex items-center gap-2">
            <Checkbox id={id} defaultChecked={checked} disabled={disabled} />
            <label htmlFor={id}>{label}</label>
          </div>
        )
      })}
    </div>
  ),
}

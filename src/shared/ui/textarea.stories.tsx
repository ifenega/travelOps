import type { Meta, StoryObj } from "@storybook/react-vite"
import { Field } from "./field"
import { Textarea } from "./textarea"

const meta = {
  title: "Components/Textarea",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Message: Story = {
  render: () => (
    <Field label="Message" className="max-w-sm">
      {(control) => <Textarea {...control} placeholder="Add a note to your invite" />}
    </Field>
  ),
}

export const WithError: Story = {
  render: () => (
    <Field label="Role description" error="Keep it under 200 characters" className="max-w-sm">
      {(control) => <Textarea {...control} defaultValue="This role allows users to…" />}
    </Field>
  ),
}

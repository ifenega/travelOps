import type { Meta, StoryObj } from "@storybook/react-vite"
import { Avatar } from "./avatar"

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

/** No photo: initials. */
export const Initials: Story = { args: { name: "Timilehin Folagbade" } }

/** A broken photo falls back to initials too. */
export const BrokenPhoto: Story = {
  args: { name: "Ifeoluwa Olorunnegan", src: "/does-not-exist.jpg" },
}

/** Always shown next to the person's name, which is what screen readers read. */
export const WithName: Story = {
  args: { name: "Timilehin Folagbade" },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Avatar {...args} />
      <div className="text-sm">
        <p>Timilehin Folagbade</p>
        <p className="text-muted-foreground text-xs">timilehin@example.com</p>
      </div>
    </div>
  ),
}

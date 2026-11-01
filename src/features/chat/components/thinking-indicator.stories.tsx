import type { Meta, StoryObj } from "@storybook/react-vite"
import { ThinkingIndicator } from "./thinking-indicator"

const meta = {
  title: "Chat/ThinkingIndicator",
  component: ThinkingIndicator,
} satisfies Meta<typeof ThinkingIndicator>

export default meta
type Story = StoryObj<typeof meta>

/** The stars drift while Sparky works; the word changes every 2 seconds. */
export const Default: Story = {}

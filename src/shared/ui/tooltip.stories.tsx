import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "./button"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

const meta = {
  title: "Components/Tooltip",
  component: TooltipContent,
} satisfies Meta<typeof TooltipContent>

export default meta
type Story = StoryObj<typeof meta>

/** Hover or focus the button. Move to the next button quickly and it opens instantly, without animating. */
export const Default: Story = {
  render: () => (
    <div className="flex gap-4 p-16">
      {["Departure", "Return", "Passengers"].map((name) => (
        <Tooltip key={name}>
          <TooltipTrigger asChild>
            <Button variant="outline">{name}</Button>
          </TooltipTrigger>
          <TooltipContent>This is a tooltip</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
}

/** Mirrors the Figma frame: both sizes, every side. Shown open. */
export const AllPlacements: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-32 py-24">
      {(["top", "bottom", "left", "right"] as const).flatMap((side) => [
        <Tooltip key={side} open>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              {side}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side}>This is a tooltip</TooltipContent>
        </Tooltip>,
        <Tooltip key={`${side}-title`} open>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              {side} with title
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side} title="This is a tooltip">
            Tooltips describe or identify an element. They help the user understand its meaning or
            function.
          </TooltipContent>
        </Tooltip>,
      ])}
    </div>
  ),
}

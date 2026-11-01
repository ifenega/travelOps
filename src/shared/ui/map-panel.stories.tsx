import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { MapPanel, type MapPoint } from "./map-panel"

const lagosToNewYork: MapPoint[] = [
  { lng: 3.3212, lat: 6.5774, label: "Lagos (LOS)" },
  { lng: 51.6081, lat: 25.2731, label: "Doha (DOH)" },
  { lng: -73.7781, lat: 40.6413, label: "New York (JFK)" },
]

const meta = {
  title: "Components/MapPanel",
  component: MapPanel,
  parameters: { layout: "fullscreen" },
  args: { points: lagosToNewYork },
  decorators: [
    (Story) => (
      <div className="h-dvh">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MapPanel>

export default meta
type Story = StoryObj<typeof meta>

/** Tiles load from OpenFreeMap, so this needs a network connection. */
export const Route: Story = { args: { className: "size-full" } }

/** With the expand button, as on the trip page. */
export const Expandable: Story = {
  render: (args) => {
    const [expanded, setExpanded] = useState(false)
    return (
      <MapPanel
        {...args}
        className="size-full"
        expanded={expanded}
        onExpandedChange={setExpanded}
      />
    )
  },
}

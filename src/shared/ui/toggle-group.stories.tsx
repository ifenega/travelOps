import type { Meta, StoryObj } from "@storybook/react-vite"
import { Building02, Plane, Train } from "@untitledui/icons"
import { useState } from "react"
import { expect } from "storybook/test"
import { ToggleGroup, ToggleGroupItem } from "./toggle-group"

function TravelModes() {
  const [mode, setMode] = useState("")
  return (
    <div className="flex flex-col items-center gap-3">
      <ToggleGroup type="single" value={mode} onValueChange={setMode} aria-label="Search for">
        <ToggleGroupItem value="flights">
          Flights <Plane aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="trains">
          Trains <Train aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="stays">
          Stays <Building02 aria-hidden="true" />
        </ToggleGroupItem>
      </ToggleGroup>
      <p className="text-muted-foreground text-sm">Mode: {mode || "none"}</p>
    </div>
  )
}

const meta = {
  title: "Components/ToggleGroup",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** The Figma's "Flights · Trains · Stays". Starts with none selected. */
export const TravelModesExample: Story = { render: () => <TravelModes /> }

/** Behaviour: picking one selects it; picking it again clears it. */
export const Toggling: Story = {
  render: () => <TravelModes />,
  play: async ({ canvas, userEvent }) => {
    const flights = canvas.getByRole("radio", { name: "Flights" })
    await userEvent.click(flights)
    await expect(flights).toBeChecked()
    await expect(canvas.getByText("Mode: flights")).toBeInTheDocument()

    await userEvent.click(flights)
    await expect(flights).not.toBeChecked()
    await expect(canvas.getByText("Mode: none")).toBeInTheDocument()
  },
}

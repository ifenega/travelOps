import type { Meta, StoryObj } from "@storybook/react-vite"
import { MarkerPin01, Plane } from "@untitledui/icons"
import { useState } from "react"
import { expect, waitFor } from "storybook/test"
import { Combobox } from "./combobox"

type Place = { id: string; name: string; region: string; kind: "airport" | "city" }

// The Figma's examples.
const places: Place[] = [
  {
    id: "HAU",
    name: "Haugesund Airport, Karmøy (HAU)",
    region: "Rogaland, Norway",
    kind: "airport",
  },
  { id: "haridwar", name: "Haridwar", region: "Uttarakhand, India", kind: "city" },
  { id: "hamburg", name: "Hamburg", region: "Germany", kind: "city" },
  { id: "hannover", name: "Hannover", region: "Germany", kind: "city" },
  { id: "hammond", name: "Hammond", region: "Indiana, USA", kind: "city" },
  {
    id: "LOS",
    name: "Murtala Muhammed Airport, Lagos (LOS)",
    region: "Lagos, Nigeria",
    kind: "airport",
  },
]

function PlaceOption({ place }: { place: Place }) {
  const Icon = place.kind === "airport" ? Plane : MarkerPin01
  return (
    <div className="flex items-start gap-2.5">
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col">
        <span>
          {place.name}
          <span className="sr-only"> ({place.kind})</span>
        </span>
        <span className="text-muted-foreground text-xs">{place.region}</span>
      </div>
    </div>
  )
}

function PlaceSearch() {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Place | null>(null)
  const matches = query.trim()
    ? places.filter((place) => place.name.toLowerCase().includes(query.trim().toLowerCase()))
    : []

  return (
    <div className="flex max-w-xs flex-col gap-4">
      <Combobox
        label="From"
        items={matches}
        itemToString={(place) => place?.name ?? ""}
        itemToKey={(place) => place.id}
        renderItem={(place) => <PlaceOption place={place} />}
        selectedItem={selected}
        onSelectedItemChange={setSelected}
        onInputValueChange={setQuery}
        placeholder="Departure city…"
        emptyMessage="No airports or cities match"
        className="flex flex-col gap-1 rounded-lg border px-3 py-2"
        labelClassName="text-muted-foreground text-xs"
      />
      <p className="text-muted-foreground text-sm">Selected: {selected?.name ?? "nothing yet"}</p>
    </div>
  )
}

const meta = {
  title: "Components/Combobox",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Type "Ha" to see the Figma's list. Airports get a plane icon, cities a pin. */
export const Places: Story = { render: () => <PlaceSearch /> }

/** Behaviour: typing filters and announces the count; arrow keys + Enter pick; no match is announced. */
export const Keyboard: Story = {
  render: () => <PlaceSearch />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "From" })
    await userEvent.type(input, "Ham")

    // Hamburg, Hammond, and "Muhammed" in the Lagos airport name.
    const options = await canvas.findAllByRole("option")
    await expect(options).toHaveLength(3)
    await expect(canvas.getByText("3 results available")).toBeInTheDocument()

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}")
    await expect(input).toHaveValue("Hammond")
    await expect(canvas.getByText("Selected: Hammond")).toBeInTheDocument()

    await userEvent.clear(input)
    await userEvent.type(input, "Zzz")
    await waitFor(() =>
      expect(canvas.getAllByText("No airports or cities match").length).toBeGreaterThan(0),
    )
  },
}

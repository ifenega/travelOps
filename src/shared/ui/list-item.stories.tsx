import type { Meta, StoryObj } from "@storybook/react-vite"
import { UserCircle } from "@untitledui/icons"
import { useState } from "react"
import { ListItem } from "./list-item"

const meta = {
  title: "Components/ListItem",
  component: ListItem,
  args: { icon: UserCircle, title: "List item", description: "List item" },
  decorators: [
    (Story) => (
      <div className="w-60">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ListItem>

export default meta
type Story = StoryObj<typeof meta>

/** Mirrors the Figma: default, selected, disabled. */
export const States: Story = {
  render: (args) => (
    <ul className="flex flex-col gap-1">
      <li>
        <ListItem {...args} />
      </li>
      <li>
        <ListItem {...args} selected />
      </li>
      <li>
        <ListItem {...args} disabled />
      </li>
    </ul>
  ),
}

const travellers = [
  { name: "Ada Okafor", email: "ada@example.com" },
  { name: "Tunde Bello", email: "tunde@example.com" },
  { name: "Chiamaka Eze", email: "chiamaka@example.com" },
  { name: "Ibrahim Musa", email: "ibrahim@example.com" },
  { name: "Grace Adeyemi", email: "grace@example.com" },
  { name: "Emeka Nwosu", email: "emeka@example.com" },
]

function TravellerPicker() {
  const [selected, setSelected] = useState(travellers[0].email)
  return (
    <ul
      aria-label="Travellers"
      className="flex max-h-56 flex-col gap-0.5 overflow-y-auto overscroll-contain rounded-lg border bg-popover p-1 shadow-lg"
    >
      {travellers.map((traveller) => (
        <li key={traveller.email}>
          <ListItem
            icon={UserCircle}
            title={traveller.name}
            description={traveller.email}
            selected={selected === traveller.email}
            onClick={() => setSelected(traveller.email)}
          />
        </li>
      ))}
    </ul>
  )
}

/** Mirrors the Figma's floating, scrolling list. */
export const InAScrollingList: Story = { render: () => <TravellerPicker /> }

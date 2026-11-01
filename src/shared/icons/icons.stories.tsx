import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  LinkExternal01,
  Plane,
  Plus,
  SearchLg,
  Send01,
  Stars01,
  XClose,
} from "@untitledui/icons"
import { type ComponentType, useState } from "react"
import { AlertCircleSolid, CheckCircleSolid } from "./status-icons"
import CaretDown from "./svg/caret-down.svg?react"

/*
 * Icons come from @untitledui/icons (the set the Figma uses). Import them directly:
 *   import { XClose } from "@untitledui/icons"
 *   <XClose className="size-5" />
 * They inherit the text colour and are aria-hidden by default. Icon-only buttons need an aria-label.
 *
 * This gallery lists only the icons TravelOps uses. Add new ones here when a component starts using them.
 * (The Untitled UI licence doesn't allow redistributing the full set, so don't publish a full catalogue.)
 */
const icons: Record<string, ComponentType<{ className?: string }>> = {
  AlertCircle,
  AlertCircleSolid,
  AlertTriangle,
  ArrowRight,
  CaretDown,
  Check,
  CheckCircle,
  CheckCircleSolid,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  LinkExternal01,
  Plane,
  Plus,
  SearchLg,
  Send01,
  Stars01,
  XClose,
}

function IconGallery() {
  const [query, setQuery] = useState("")
  const matches = Object.entries(icons).filter(([name]) =>
    name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6">
      <label className="flex max-w-sm flex-col gap-2 font-medium text-sm">
        Search icons
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="rounded-lg border px-3 py-2 font-normal"
          autoCapitalize="none"
          autoCorrect="off"
          enterKeyHint="search"
        />
      </label>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {matches.map(([name, Icon]) => (
          <li key={name} className="flex flex-col items-center gap-2 rounded-lg border p-4">
            <Icon className="size-6" />
            <span className="text-muted-foreground text-xs">{name}</span>
          </li>
        ))}
      </ul>
      {matches.length === 0 && <p className="text-muted-foreground text-sm">No icons match.</p>}
    </div>
  )
}

const meta: Meta = { title: "Foundations/Icons", parameters: { layout: "padded" } }
export default meta

export const Gallery: StoryObj = { render: () => <IconGallery /> }

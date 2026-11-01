import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

// The style guide: every token in tokens.css, in light and dark (toolbar switch).
const meta: Meta = { title: "Foundations/Tokens", parameters: { layout: "padded" } }
export default meta

const steps = ["25", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900"]

const palette: Record<string, string[]> = {
  primary: steps,
  gray: [...steps, "950"],
  error: steps,
  warning: steps,
  success: steps,
  info: ["100", "700"],
}

const semantic = [
  "background",
  "foreground",
  "muted",
  "muted-foreground",
  "card",
  "popover",
  "primary",
  "primary-foreground",
  "secondary",
  "accent",
  "destructive",
  "border",
  "ring",
]

function readToken(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// Palette tokens are CSS variables named --color-*; semantic ones are --background, --primary, etc.
function Swatch({ token, semantic = false }: { token: string; semantic?: boolean }) {
  const variable = semantic ? `--${token}` : `--color-${token}`
  return (
    <div className="flex flex-col gap-1">
      <div className="h-12 rounded-md border" style={{ background: `var(${variable})` }} />
      <span className="font-medium text-xs">{token}</span>
      {!semantic && (
        <span className="text-muted-foreground text-xs uppercase tabular-nums">
          {readToken(variable)}
        </span>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-semibold text-lg">{title}</h2>
      {children}
    </section>
  )
}

export const Colors: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-10">
      <Section title="Semantic (changes in dark mode)">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-7">
          {semantic.map((token) => (
            <Swatch key={token} token={token} semantic />
          ))}
        </div>
      </Section>
      {Object.entries(palette).map(([name, shades]) => (
        <Section key={name} title={name}>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6 lg:grid-cols-12">
            {shades.map((shade) => (
              <Swatch key={shade} token={`${name}-${shade}`} />
            ))}
          </div>
        </Section>
      ))}
    </div>
  ),
}

const sizes = [
  { className: "text-xs", label: "xs · 12/16" },
  { className: "text-sm", label: "sm · 14/20" },
  { className: "text-base", label: "base · 16/24" },
  { className: "text-lg", label: "lg · 18/28" },
  { className: "text-xl", label: "xl · 20/28" },
  { className: "text-2xl", label: "2xl · 24/32" },
  { className: "text-3xl", label: "3xl · 30/36" },
  { className: "text-4xl", label: "4xl · 36/40" },
]

const weights = [
  { className: "font-normal", label: "Regular 400" },
  { className: "font-medium", label: "Medium 500" },
  { className: "font-semibold", label: "Semibold 600" },
  { className: "font-bold", label: "Bold 700" },
]

export const Typography: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-10">
      <Section title="Sizes (Inter)">
        {sizes.map(({ className, label }) => (
          <div key={className} className="flex items-baseline gap-6">
            <span className="w-28 shrink-0 text-muted-foreground text-xs">{label}</span>
            <span className={className}>Lagos to Athens, 11h 50m</span>
          </div>
        ))}
      </Section>
      <Section title="Weights">
        {weights.map(({ className, label }) => (
          <p key={className} className={`text-lg ${className}`}>
            {label}: Round trip $13,400
          </p>
        ))}
      </Section>
      <Section title="Tabular numbers (prices, times, flight numbers)">
        <p className="text-lg tabular-nums">11:50 PM · 1:40 PM · $13,400 · $4,566.00</p>
      </Section>
    </div>
  ),
}

const shadows = [
  "shadow-xs",
  "shadow-sm",
  "shadow-md",
  "shadow-lg",
  "shadow-xl",
  "shadow-2xl",
  "shadow-3xl",
]

export const Shadows: StoryObj = {
  render: () => (
    <div className="grid grid-cols-2 gap-10 p-6 sm:grid-cols-4 lg:grid-cols-7">
      {shadows.map((shadow) => (
        <div key={shadow} className="flex flex-col gap-3">
          <span className="text-sm">{shadow.replace("shadow-", "")}</span>
          <div className={`h-28 rounded-lg bg-card ${shadow}`} />
        </div>
      ))}
    </div>
  ),
}

const radii = [
  { className: "rounded-sm", label: "sm · 4px" },
  { className: "rounded-md", label: "md · 6px" },
  { className: "rounded-lg", label: "lg · 8px" },
  { className: "rounded-xl", label: "xl · 12px" },
  { className: "rounded-full", label: "full" },
]

export const Radius: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-8">
      {radii.map(({ className, label }) => (
        <div key={className} className="flex flex-col gap-2">
          <div className={`size-20 border-2 border-primary bg-primary-50 ${className}`} />
          <span className="text-sm">{label}</span>
        </div>
      ))}
    </div>
  ),
}

const easings = [
  { className: "ease-out", label: "ease-out: enter and exit (default)" },
  { className: "ease-in-out", label: "ease-in-out: moving something on screen" },
  { className: "ease-drawer", label: "ease-drawer: iOS-like sheets" },
]

function MotionDemo() {
  const [moved, setMoved] = useState(false)
  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => setMoved((value) => !value)}
        className="self-start rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground"
      >
        Play easing
      </button>
      {easings.map(({ className, label }) => (
        <div key={className} className="flex flex-col gap-2">
          <span className="text-sm">{label}</span>
          <div className="h-3 w-full max-w-md rounded-full bg-muted">
            {/* Slides by its own width (track minus the dot), so it fits any screen. */}
            <div
              className={`w-[calc(100%-0.75rem)] transition-transform duration-500 motion-reduce:transition-none ${className} ${moved ? "translate-x-full" : ""}`}
            >
              <div className="size-3 rounded-full bg-primary" />
            </div>
          </div>
        </div>
      ))}
      <p className="max-w-prose text-muted-foreground text-sm">
        Shown at 500ms so the curves are easy to compare. Real UI: press 150 · tooltip 125 ·
        dropdown 200 · dialog 250 · drawer 500.
      </p>
    </div>
  )
}

export const Motion: StoryObj = { render: () => <MotionDemo /> }

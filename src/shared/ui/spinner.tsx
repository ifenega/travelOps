import { cn } from "@/shared/lib/utils"

const spokes = [0, 45, 90, 135, 180, 225, 270, 315]

/**
 * The loading spinner from the design (eight fading spokes). Decorative: put the words for
 * screen readers next to it, in a role="status" element.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("size-5 animate-spin text-foreground [animation-duration:1.2s]", className)}
    >
      {spokes.map((angle, index) => (
        <line
          key={angle}
          x1="12"
          y1="3"
          x2="12"
          y2="7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity={0.25 + (index / spokes.length) * 0.75}
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  )
}

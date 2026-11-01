import type { SVGProps } from "react"

// Solid status icons from the Figma banner. The free Untitled UI set only has line icons,
// so these are drawn here with the same API: size prop, currentColor fill, aria-hidden.

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

export function CheckCircleSolid({ size = 24, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="m7.5 12 3 3 6-6"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AlertCircleSolid({ size = 24, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M12 7.5v5M12 16.5h.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

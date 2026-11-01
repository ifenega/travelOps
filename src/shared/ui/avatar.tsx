import { Avatar as AvatarPrimitive } from "radix-ui"
import { cn } from "@/shared/lib/utils"

/** "Timilehin Folagbade" → "TF". */
function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""
  return (first + last).toUpperCase()
}

// A person's photo, or their initials when there's no photo (or it fails to load).
// Decorative: always show the person's name next to it, so it's hidden from screen readers.
function Avatar({ name, src, className }: { name: string; src?: string; className?: string }) {
  return (
    <AvatarPrimitive.Root
      aria-hidden="true"
      className={cn("inline-flex size-8 shrink-0 overflow-hidden rounded-full", className)}
    >
      {src && <AvatarPrimitive.Image src={src} alt="" className="size-full object-cover" />}
      <AvatarPrimitive.Fallback className="flex size-full items-center justify-center bg-info-100 font-medium text-info-700 text-xs">
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

export { Avatar }

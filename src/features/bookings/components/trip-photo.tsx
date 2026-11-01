import { useState } from "react"
import { cn } from "@/shared/lib/utils"

/**
 * The destination photo. Decorative: the trip's title already says where it is.
 * A missing or broken photo leaves a plain grey box, so the layout never jumps.
 */
export function TripPhoto({ src, className }: { src?: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={cn("overflow-hidden bg-muted", className)}>
      {src && !failed && (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      )}
    </div>
  )
}

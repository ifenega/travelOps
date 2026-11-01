import { useEffect, useState } from "react"
import AiSparkle from "@/shared/icons/svg/ai-sparkle.svg?react"

// Shown while Sparky (the assistant) works on a reply: the sparkle's two stars drift, and the word
// cycles like the Figma ("Thinking…", "Juggling…", "Crafting…").
// Screen readers hear "Sparky is thinking" once, not every word change.

const words = ["Thinking", "Juggling", "Crafting"]

export function ThinkingIndicator() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % words.length), 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div role="status" className="flex items-center gap-3 text-muted-foreground text-sm">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted">
        <AiSparkle className="size-5 [&_g]:origin-center [&_g]:[transform-box:fill-box] [&_.sparkle-large]:animate-sparkle-large [&_.sparkle-small]:animate-sparkle-small" />
      </span>
      <span key={index} aria-hidden="true" className="animate-fade-in">
        {words[index]}…
      </span>
      <span className="sr-only">Sparky is thinking</span>
    </div>
  )
}

import { useEffect, useRef } from "react"

/**
 * Keeps a scrolling area pinned to the newest content while it grows (e.g. a streaming reply),
 * but only if the user was already at the bottom: scrolling up to read stops the following.
 */
export function useStickToBottom(getScroller: () => HTMLElement | null, content: unknown) {
  const pinned = useRef(true)

  useEffect(() => {
    const scroller = getScroller()
    if (!scroller) return
    const onScroll = () => {
      pinned.current = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 80
    }
    scroller.addEventListener("scroll", onScroll, { passive: true })
    return () => scroller.removeEventListener("scroll", onScroll)
  }, [getScroller])

  // biome-ignore lint/correctness/useExhaustiveDependencies: runs whenever the content changes
  useEffect(() => {
    const scroller = getScroller()
    if (!scroller || !pinned.current) return
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: instant ? "auto" : "smooth" })
  }, [content, getScroller])
}

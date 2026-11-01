/** Moves focus to the page's <h1> (or <main>) so screen readers announce the new page. */
export function focusPageHeading() {
  const target =
    document.querySelector<HTMLElement>("main h1") ?? document.querySelector<HTMLElement>("main")
  if (!target) return
  target.setAttribute("tabindex", "-1")
  target.focus({ preventScroll: true })
}

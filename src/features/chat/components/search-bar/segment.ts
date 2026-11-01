// The look of one field in the search bar: a small grey label over the value, like the Figma.

export const segmentClassName =
  "flex min-w-0 flex-1 flex-col justify-center gap-0.5 rounded-lg px-3 py-2 text-left outline-ring transition-colors duration-150 hover:bg-foreground/[0.03] focus-visible:outline-2 focus-visible:-outline-offset-2 has-[input:focus]:outline-2 has-[input:focus]:-outline-offset-2"

export const segmentLabelClassName = "text-muted-foreground text-xs"

/** 16px on touch screens (stops iOS zooming into inputs), 14px with a mouse. */
export const segmentValueClassName = "w-full truncate text-base pointer-fine:text-sm"

export const segmentPlaceholderClassName = "text-gray-600"

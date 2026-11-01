import { ChevronDown } from "@untitledui/icons"
import { Select as SelectPrimitive } from "radix-ui"
import type * as React from "react"
import { cn } from "@/shared/lib/utils"
import { popoverSurfaceClassName } from "./popover"

// Based on shadcn/ui's Select, restyled to the Figma (e.g. the child age picker: "2 years old ⌄").
//
//   <Select value={age} onValueChange={setAge}>
//     <SelectTrigger aria-label="Child 1 age"><SelectValue placeholder="Select age" /></SelectTrigger>
//     <SelectContent aria-label="Child 1 age">{ages.map((a) => <SelectItem key={a} value={a}>{a} years old</SelectItem>)}</SelectContent>
//   </Select>
//
// Give SelectContent the same label as the trigger: Radix doesn't pass it on, and screen readers
// need a name for the open list. Use "" (not undefined) for "nothing chosen yet".

const Select = SelectPrimitive.Root
const SelectValue = SelectPrimitive.Value

function SelectTrigger({
  className,
  children,
  variant = "filled",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  /**
   * "filled" is the grey pill (child age); "outline" is white with a border, like an input;
   * "ghost" is plain text with a chevron, e.g. "Rows per page: 10 ⌄".
   */
  variant?: "filled" | "outline" | "ghost"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "inline-flex min-h-8 items-center justify-between gap-2 rounded-lg border px-3 text-left text-sm pointer-coarse:min-h-11",
        "transition-[background-color,border-color,box-shadow] duration-150 ease-out",
        variant === "filled" && "border-transparent bg-foreground/5 hover:bg-foreground/10",
        variant === "outline" && "border-border bg-background shadow-xs hover:bg-muted",
        variant === "ghost" && "border-transparent px-1.5 hover:bg-foreground/5",
        "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
        "data-[state=open]:border-primary-500 data-[state=open]:bg-background data-[state=open]:ring-4 data-[state=open]:ring-primary-600/15",
        "data-placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position="popper"
        sideOffset={4}
        collisionPadding={8}
        className={cn(
          popoverSurfaceClassName,
          "max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) origin-(--radix-select-content-transform-origin) animate-popover-in",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  className,
  children,
  description,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item> & {
  /** A quieter second line. It stays out of the trigger, which shows only the main text. */
  description?: string
}) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "flex cursor-default select-none flex-col items-start rounded-md px-2 py-1.5 text-sm outline-none pointer-coarse:min-h-11",
        "data-highlighted:bg-foreground/5 data-[state=checked]:font-medium data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      {description && (
        <span className="font-normal text-muted-foreground text-xs">{description}</span>
      )}
    </SelectPrimitive.Item>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }

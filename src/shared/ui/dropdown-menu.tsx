import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import type * as React from "react"
import { type ComponentType, useId } from "react"
import { cn } from "@/shared/lib/utils"
import { popoverSurfaceClassName } from "./popover"

// Based on shadcn/ui's DropdownMenu, restyled to the Figma's "Manage booking" menus:
// a small label, then items with an icon, a title and a description line.
//
//   <DropdownMenu>
//     <DropdownMenuTrigger asChild><Button aria-label="Manage trip">…</Button></DropdownMenuTrigger>
//     <DropdownMenuContent>
//       <DropdownMenuLabel>Manage booking</DropdownMenuLabel>
//       <DropdownMenuItem icon={Edit05} description="Makes changes to your booking" onSelect={edit}>
//         Edit booking
//       </DropdownMenuItem>
//     </DropdownMenuContent>
//   </DropdownMenu>
//
// Radix handles arrow keys, typeahead, Esc, and returning focus to the trigger.

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

function DropdownMenuContent({
  className,
  align = "end",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn(
          popoverSurfaceClassName,
          "min-w-56 max-w-[calc(100vw-1rem)] origin-(--radix-dropdown-menu-content-transform-origin) animate-popover-in p-1",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn("px-2 pt-1 pb-1.5 text-muted-foreground text-xs", className)}
      {...props}
    />
  )
}

type DropdownMenuItemProps = React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  icon?: ComponentType<{ className?: string }>
  /** A second, quieter line. Screen readers hear it as the item's description. */
  description?: string
  /** "destructive" is red, for Delete. The words still say what it does. */
  variant?: "default" | "destructive"
}

function DropdownMenuItem({
  icon: Icon,
  description,
  variant = "default",
  className,
  children,
  ...props
}: DropdownMenuItemProps) {
  const id = useId()
  const titleId = `${id}-title`
  const descriptionId = `${id}-description`

  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      // The title is the name, the description line is extra detail, so the name stays short.
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        "flex cursor-default select-none items-start gap-2.5 rounded-md px-2 py-1.5 text-sm outline-none pointer-coarse:min-h-11",
        "data-highlighted:bg-foreground/5 data-disabled:opacity-50",
        variant === "destructive" &&
          "data-highlighted:bg-error-50 dark:data-highlighted:bg-error-600/15",
        className,
      )}
      {...props}
    >
      {Icon && (
        <Icon
          aria-hidden="true"
          className={cn(
            "mt-0.5 size-4 shrink-0 text-muted-foreground",
            variant === "destructive" && "text-error-600",
          )}
        />
      )}
      <span className="min-w-0">
        <span id={titleId} className="block">
          {children}
        </span>
        {description && (
          <span id={descriptionId} className="block text-muted-foreground text-xs">
            {description}
          </span>
        )}
      </span>
    </DropdownMenuPrimitive.Item>
  )
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
}

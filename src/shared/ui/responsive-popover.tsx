import type * as React from "react"
import { useMediaQuery } from "@/shared/hooks/use-media-query"
import { Drawer, DrawerContent, DrawerTrigger } from "./drawer"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

type ResponsivePopoverProps = {
  /** The button that opens it. */
  trigger: React.ReactElement
  /** Accessible name; also the sheet's heading on phones. */
  title: string
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "start" | "center" | "end"
  contentClassName?: string
}

/** A popover on larger screens and a bottom sheet on phones (below 640px), with the same content. */
export function ResponsivePopover({
  trigger,
  title,
  children,
  open,
  onOpenChange,
  align,
  contentClassName,
}: ResponsivePopoverProps) {
  const isPhone = !useMediaQuery("(min-width: 40rem)")

  if (isPhone) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent title={title} className={contentClassName}>
          {children}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent aria-label={title} align={align} className={contentClassName}>
        {children}
      </PopoverContent>
    </Popover>
  )
}

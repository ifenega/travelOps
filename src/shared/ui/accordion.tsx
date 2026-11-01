import { ChevronDown } from "@untitledui/icons"
import { Accordion as AccordionPrimitive } from "radix-ui"
import type * as React from "react"
import { cn } from "@/shared/lib/utils"

// Based on shadcn/ui's Accordion, on our tokens, e.g. one section per passenger in checkout
// (design screen 20). Radix handles the heading + button markup, aria-expanded, and arrow keys
// between headers.
//
//   <Accordion type="single" collapsible value={open} onValueChange={setOpen}>
//     <AccordionItem value="p1">
//       <AccordionTrigger>Passenger 1</AccordionTrigger>
//       <AccordionContent>…</AccordionContent>
//     </AccordionItem>
//   </Accordion>

const Accordion = AccordionPrimitive.Root

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={cn("border-b", className)} {...props} />
}

function AccordionTrigger({
  children,
  icon,
  headingLevel: Heading = "h3",
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  /** Replaces the chevron, e.g. a "done" tick and an edit pencil. */
  icon?: React.ReactNode
  /** The header's heading level, to fit the page's outline. */
  headingLevel?: "h2" | "h3" | "h4"
}) {
  return (
    <AccordionPrimitive.Header asChild>
      <Heading className="flex">
        <AccordionPrimitive.Trigger
          className={cn(
            "group flex flex-1 items-center gap-3 py-3 text-left outline-none",
            "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
            className,
          )}
          {...props}
        >
          {children}
          {icon ?? (
            <ChevronDown
              aria-hidden="true"
              className="ml-auto size-5 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-data-[state=open]:rotate-180 motion-reduce:transition-none"
            />
          )}
        </AccordionPrimitive.Trigger>
      </Heading>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden data-[state=closed]:animate-collapsible-close data-[state=open]:animate-collapsible-open"
      {...props}
    >
      <div className={cn("pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }

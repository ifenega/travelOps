import { Copy01 } from "@untitledui/icons"
import { Button } from "@/shared/ui/button"
import { toast } from "@/shared/ui/toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip"

const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" })

/** Under a user's message: the time it was sent and a copy button (design screen 11). */
export function MessageMeta({ createdAt, copyText }: { createdAt: number; copyText: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(copyText)
      toast.success("Copied")
    } catch {
      toast.error("Couldn't copy. Select the text and copy it instead.")
    }
  }

  return (
    <div className="flex items-center justify-end gap-1 text-muted-foreground text-xs">
      <time dateTime={new Date(createdAt).toISOString()}>{time.format(createdAt)}</time>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-xs" aria-label="Copy text" onClick={copy}>
            <Copy01 />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy text</TooltipContent>
      </Tooltip>
    </div>
  )
}

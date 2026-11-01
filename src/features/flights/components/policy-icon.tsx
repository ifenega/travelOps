import { FileCheck02, FileX02, TrendUp01 } from "@untitledui/icons"
import { Dialog, DialogContent, DialogTrigger } from "@/shared/ui/dialog"
import type { Policy } from "../types"

/**
 * Green when the travel policy allows it. Orange when it doesn't: then it's a button that
 * explains why (design screen 18, "Issue a conditional offer").
 */
export function PolicyIcon({ policy }: { policy: Policy }) {
  if (policy.within) {
    return (
      <span className="grid size-7 place-items-center rounded-full bg-success-100 text-success-700 dark:bg-success-600/20 dark:text-success-300">
        <FileCheck02 aria-hidden="true" className="size-4" />
        <span className="sr-only">Within travel policy</span>
      </span>
    )
  }

  return (
    <Dialog>
      <DialogTrigger
        aria-label="Out of travel policy: see why"
        className="grid size-7 place-items-center rounded-full bg-warning-100 text-warning-700 hover:bg-warning-200 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 dark:bg-warning-600/20 dark:text-warning-300"
      >
        <FileX02 aria-hidden="true" className="size-4" />
      </DialogTrigger>
      <DialogContent title="Issue a conditional offer">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-error-100 text-error-600 dark:bg-error-600/20">
            <TrendUp01 aria-hidden="true" className="size-4" />
          </span>
          <div className="text-sm">
            <p className="font-medium">{policy.reason}</p>
            <p className="text-muted-foreground">{policy.detail}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

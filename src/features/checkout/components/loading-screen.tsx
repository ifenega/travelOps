import MeditatingTraveller from "@/shared/illustrations/meditating-traveller.svg?react"
import { Spinner } from "@/shared/ui/spinner"

/** "Pulling up passengers options." with the meditating traveller (design screen 23). */
export function LoadingScreen({ message }: { message: string }) {
  return (
    <div role="status" className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
      <MeditatingTraveller className="h-24 w-auto" />
      <p>{message}</p>
      <Spinner />
    </div>
  )
}

import type { ComponentType, ReactNode } from "react"

/** Centered icon, heading, message and actions, shared by the 404 and error pages. */
export function StatusPage({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  /** Action buttons. */
  children: ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-muted">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-xl">{title}</h1>
        <p className="max-w-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  )
}

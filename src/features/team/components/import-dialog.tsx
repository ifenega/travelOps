import { CheckCircle, Trash01, UploadCloud02 } from "@untitledui/icons"
import { useEffect, useId, useState } from "react"
import { cn } from "@/shared/lib/utils"
import { Button, buttonVariants } from "@/shared/ui/button"
import { Dialog, DialogClose, DialogContent } from "@/shared/ui/dialog"
import { useCancelImport, useImport, useStartImport } from "../hooks/use-team"
import type { ImportJob } from "../types"
import { downloadFile, importTemplateCsv } from "../utils/csv"

const maxBytes = 1024 * 1024
const accepted = [".csv", ".xls", ".xlsx"]

/** "200KB", "1.2MB" */
function fileSize(bytes: number) {
  return bytes < maxBytes
    ? `${Math.max(1, Math.round(bytes / 1024))}KB`
    : `${(bytes / maxBytes).toFixed(1)}MB`
}

/** Checks a picked file before upload; returns the problem in words, or null. */
function checkFile(file: File) {
  if (!accepted.some((ext) => file.name.toLowerCase().endsWith(ext))) {
    return "Choose a CSV or XLS file."
  }
  if (file.size > maxBytes) return "File size exceeds the allowed size."
  return null
}

export function ImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const job = useImport().data
  // The import this dialog is showing. A finished import shows only if the dialog watched it run,
  // so opening the dialog later starts fresh.
  const [watching, setWatching] = useState<string | null>(null)
  useEffect(() => {
    if (open && job?.status === "running") setWatching(job.id)
  }, [open, job])
  const showingProgress =
    job?.status === "running" || (job?.status === "done" && job.id === watching)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setWatching(null)
        onOpenChange(next)
      }}
    >
      <DialogContent
        title={showingProgress ? "Import progress" : "Import data"}
        description={
          showingProgress
            ? "Inspect the progress of your import here."
            : "Carry out bulk import of your team members"
        }
      >
        {open && (showingProgress && job ? <Progress job={job} /> : <ChooseFile />)}
      </DialogContent>
    </Dialog>
  )
}

function ChooseFile() {
  const id = useId()
  const [file, setFile] = useState<File | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const start = useStartImport()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (file) start.mutate(file)
      }}
      className="flex flex-col gap-4 text-sm"
    >
      <div className="flex flex-col gap-1">
        <p className="font-medium">Import file</p>
        <p id={`${id}-help`} className="text-muted-foreground">
          Data with your team members. CSV or XLS under 1MB
        </p>
        {problem && (
          <p role="alert" className="text-error-700">
            {problem}
          </p>
        )}

        {file ? (
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate">{file.name}</p>
              <p className="text-muted-foreground">{fileSize(file.size)}</p>
              <Button
                variant="destructive-soft"
                size="xs"
                className="mt-2"
                onClick={() => setFile(null)}
              >
                <Trash01 aria-hidden="true" />
                Delete
                <span className="sr-only"> {file.name}</span>
              </Button>
            </div>
            <CheckCircle aria-hidden="true" className="size-5 shrink-0 text-primary-600" />
          </div>
        ) : (
          <div className="mt-2">
            {/* The real file input, hidden but focusable; the label is what's seen and clicked. */}
            <input
              id={`${id}-file`}
              type="file"
              accept={accepted.join(",")}
              aria-describedby={`${id}-help`}
              className="peer sr-only"
              onChange={(event) => {
                const picked = event.target.files?.[0]
                event.target.value = ""
                if (!picked) return
                const issue = checkFile(picked)
                setProblem(issue)
                setFile(issue ? null : picked)
              }}
            />
            <label
              htmlFor={`${id}-file`}
              className={cn(
                buttonVariants({ variant: "soft", size: "sm" }),
                "cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-ring peer-focus-visible:outline-offset-2",
              )}
            >
              <UploadCloud02 aria-hidden="true" />
              Upload
              <span className="sr-only"> a file</span>
            </label>
          </div>
        )}
      </div>

      <p className="text-muted-foreground">
        Download the expected template for bulk uploads{" "}
        <button
          type="button"
          onClick={() => downloadFile("team-members-template.csv", importTemplateCsv(), "text/csv")}
          className="rounded-sm text-foreground underline underline-offset-2 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-ring"
        >
          here<span className="sr-only"> (team members template, CSV)</span>
        </button>
        .
      </p>

      <div className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={!file || start.isPending}>
          {start.isPending ? "Starting…" : "Import"}
        </Button>
      </div>
    </form>
  )
}

function Progress({ job }: { job: ImportJob }) {
  const cancel = useCancelImport()
  const finished = job.status === "done"

  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="font-medium">Import progress</p>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate">{job.fileName}</p>
          <p className="text-muted-foreground">{fileSize(job.fileSize)}</p>
        </div>
        <ProgressRing done={job.done} total={job.total} />
      </div>
      {finished ? (
        <div className="flex items-center justify-between gap-3">
          <p>
            All {job.total} {job.total === 1 ? "member" : "members"} imported.
          </p>
          <DialogClose asChild>
            <Button size="sm">Done</Button>
          </DialogClose>
        </div>
      ) : (
        <Button
          variant="destructive-soft"
          size="sm"
          className="self-start"
          disabled={cancel.isPending}
          onClick={() => cancel.mutate(job.id)}
        >
          Cancel import
        </Button>
      )}
    </div>
  )
}

/** The "1/10" ring. Screen readers hear "Import progress, 1 of 10 members imported". */
function ProgressRing({ done, total }: { done: number; total: number }) {
  const radius = 15
  const circumference = 2 * Math.PI * radius
  const fraction = total > 0 ? done / total : 0
  return (
    <div
      role="progressbar"
      aria-label="Import progress"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-valuetext={`${done} of ${total} members imported`}
      className="relative size-10 shrink-0"
    >
      <svg viewBox="0 0 36 36" className="-rotate-90 size-full" aria-hidden="true">
        <circle cx="18" cy="18" r={radius} fill="none" strokeWidth="3" className="stroke-muted" />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          className="stroke-success-600"
        />
      </svg>
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center text-xs tabular-nums"
      >
        <span className="font-medium">{done}</span>
        <span className="text-muted-foreground">/{total}</span>
      </span>
    </div>
  )
}

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { parseDayMonthYear } from "@/shared/lib/day-month-year"
import { Button } from "@/shared/ui/button"
import { DatePicker } from "@/shared/ui/date-picker"
import { Dialog, DialogClose, DialogContent } from "@/shared/ui/dialog"
import { Field } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { SwitchField } from "@/shared/ui/switch"
import { toast } from "@/shared/ui/toast"
import { useCurrentUserEmail, useExportMembers } from "../hooks/use-team"
import { downloadFile } from "../utils/csv"
import { isValidEmail, maskEmail } from "../utils/emails"

const exportSchema = z
  .object({
    from: z.string(),
    to: z.string(),
    format: z.string().refine((f) => f === "csv" || f === "xls", "Choose a format"),
    sendEmail: z.boolean(),
    email: z.string().trim(),
    copyToMe: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const from = values.from ? parseDayMonthYear(values.from) : undefined
    const to = values.to ? parseDayMonthYear(values.to) : undefined
    if (from === null)
      ctx.addIssue({ code: "custom", path: ["from"], message: "Enter a date as DD/MM/YYYY" })
    if (to === null)
      ctx.addIssue({ code: "custom", path: ["to"], message: "Enter a date as DD/MM/YYYY" })
    if (from && to && from > to) {
      ctx.addIssue({ code: "custom", path: ["to"], message: "Must be on or after Date from" })
    }
    if (values.sendEmail && !isValidEmail(values.email)) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Enter the email to send it to" })
    }
  })

// What the fields hold while filling in (format may be ""), and what a valid form gives back.
type ExportInput = z.input<typeof exportSchema>
type ExportOutput = z.output<typeof exportSchema>

export function ExportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Export data" description="Carry out bulk export of your team members">
        {open && <ExportForm onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function ExportForm({ onDone }: { onDone: () => void }) {
  const me = useCurrentUserEmail()
  const exportMembers = useExportMembers()
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExportInput, unknown, ExportOutput>({
    mode: "onTouched",
    resolver: zodResolver(exportSchema),
    defaultValues: { from: "", to: "", format: "", sendEmail: false, email: "", copyToMe: false },
  })
  const sendEmail = watch("sendEmail")

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        const file = await exportMembers.mutateAsync({
          from: parseDayMonthYear(values.from) ?? undefined,
          to: parseDayMonthYear(values.to) ?? undefined,
          format: values.format,
          emailTo: values.sendEmail ? values.email : undefined,
          copyToMe: values.copyToMe,
        })
        downloadFile(file.fileName, file.content, file.mimeType)
        const sentTo = [values.sendEmail && values.email, values.copyToMe && "you"].filter(Boolean)
        toast.success("Export downloaded", {
          description: sentTo.length > 0 ? `Also emailed to ${sentTo.join(" and ")}.` : undefined,
        })
        onDone()
      })}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date from" error={errors.from?.message}>
          {(c) => (
            <Controller
              control={control}
              name="from"
              render={({ field }) => (
                <DatePicker
                  {...c}
                  label="Date from"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          )}
        </Field>
        <Field label="Date to" error={errors.to?.message}>
          {(c) => (
            <Controller
              control={control}
              name="to"
              render={({ field }) => (
                <DatePicker
                  {...c}
                  label="Date to"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          )}
        </Field>
      </div>

      <Field label="Format" error={errors.format?.message}>
        {(c) => (
          <Controller
            control={control}
            name="format"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger {...c} variant="outline" className="w-full">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent aria-label="Format">
                  <SelectItem value="csv">CSV (comma-separated values)</SelectItem>
                  <SelectItem value="xls">XLS</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        )}
      </Field>

      <Controller
        control={control}
        name="sendEmail"
        render={({ field }) => (
          <SwitchField
            label="Send via email"
            description="Email the export to an external person."
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      {sendEmail && (
        <Field label="Email to send it to" error={errors.email?.message}>
          {(c) => (
            <Input
              {...c}
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              {...register("email")}
            />
          )}
        </Field>
      )}

      <Controller
        control={control}
        name="copyToMe"
        render={({ field }) => (
          <SwitchField
            label="Send a copy to me"
            description={
              me.data ? (
                <>
                  Copy will be sent to{" "}
                  <span className="text-primary-700 dark:text-primary-300">
                    {maskEmail(me.data)}
                  </span>
                </>
              ) : (
                "Copy will be sent to your email"
              )
            }
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />

      <div className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Exporting…" : "Export"}
        </Button>
      </div>
    </form>
  )
}

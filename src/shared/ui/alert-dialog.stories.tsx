import type { Meta, StoryObj } from "@storybook/react-vite"
import { useRef, useState } from "react"
import { expect, waitFor, within } from "storybook/test"
import { AlertDialog, AlertDialogContent } from "./alert-dialog"
import { Button } from "./button"

function ConfirmDelete() {
  const [open, setOpen] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  return (
    <div className="flex flex-col items-start gap-3">
      <Button ref={buttonRef} variant="destructive-outline" onClick={() => setOpen(true)}>
        Delete trip
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent
          title="Delete this trip?"
          description="This removes it from your list. It doesn't cancel anything you've booked."
          confirmLabel="Delete trip"
          onConfirm={() => setDeleted(true)}
          // No AlertDialogTrigger here (as when it opens from a menu), so say where focus goes back.
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            buttonRef.current?.focus()
          }}
        />
      </AlertDialog>
      <p className="text-muted-foreground text-sm">{deleted ? "Deleted" : "Not deleted"}</p>
    </div>
  )
}

const meta = {
  title: "Components/AlertDialog",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: () => <ConfirmDelete /> }

/** Behaviour: focus starts on Cancel, so pressing Enter by habit doesn't delete anything. */
export const FocusStartsOnCancel: Story = {
  render: () => <ConfirmDelete />,
  play: async ({ canvas, userEvent, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole("button", { name: "Delete trip" })
    await userEvent.click(trigger)

    const dialog = await body.findByRole("alertdialog", { name: "Delete this trip?" })
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus(),
    )

    await userEvent.keyboard("{Enter}")
    await waitFor(() => expect(body.queryByRole("alertdialog")).toBeNull())
    await expect(canvas.getByText("Not deleted")).toBeInTheDocument()
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

/** Behaviour: confirming runs the action and closes. */
export const Confirm: Story = {
  render: () => <ConfirmDelete />,
  play: async ({ canvas, userEvent, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole("button", { name: "Delete trip" }))
    const dialog = await body.findByRole("alertdialog")
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete trip" }))
    await waitFor(() => expect(body.queryByRole("alertdialog")).toBeNull())
    await expect(canvas.getByText("Deleted")).toBeInTheDocument()
  },
}

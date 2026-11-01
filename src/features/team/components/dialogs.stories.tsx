import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor, within } from "storybook/test"
import { seedMembers } from "../api/mock-data"
import { mockControls } from "../api/mock-team-service"
import { EditMemberDialog } from "./edit-member-dialog"
import { ExportDialog } from "./export-dialog"
import { ImportDialog } from "./import-dialog"
import { InviteDialog } from "./invite-dialog"

// The team's form dialogs, open, on the mock service.

const ifeoluwa = seedMembers[1]
if (!ifeoluwa) throw new Error("No mock member")

const noop = () => {}

const meta = {
  title: "Team/Dialogs",
  parameters: { layout: "fullscreen" },
  beforeEach: () => {
    mockControls.reset()
    mockControls.delay = 0
    mockControls.importStepDelay = 50
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const dialog = (canvasElement: HTMLElement, name: string) =>
  within(canvasElement.ownerDocument.body).findByRole("dialog", { name })

export const AddMembers: Story = { render: () => <InviteDialog open onOpenChange={noop} /> }

/** Behaviour: every problem shows at once on Send, including a bad email chip and no role. */
export const AddMembersValidation: Story = {
  render: () => <InviteDialog open onOpenChange={noop} />,
  play: async ({ canvasElement, userEvent }) => {
    const form = within(await dialog(canvasElement, "Add members"))
    await userEvent.type(await form.findByRole("textbox", { name: "Email" }), "bad@gmail,")
    await userEvent.click(form.getByRole("button", { name: "Send invite" }))
    await form.findByText("Fix or remove the emails marked in red")
    await expect(form.getByText("Choose a role")).toBeVisible()
  },
}

/** Behaviour: inviting someone already in the team says who. */
export const AddMembersAlreadyInTeam: Story = {
  render: () => <InviteDialog open onOpenChange={noop} />,
  play: async ({ canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body)
    const form = within(await dialog(canvasElement, "Add members"))
    await userEvent.type(
      await form.findByRole("textbox", { name: "Email" }),
      "ada.nwosu@example.com,",
    )
    await userEvent.click(form.getByRole("combobox", { name: "Role" }))
    await userEvent.click(await body.findByRole("option", { name: /Developer/ }))
    // The open list hides the rest of the dialog from screen readers until it has closed.
    await userEvent.click(await form.findByRole("button", { name: "Send invite" }))
    await form.findByText("Already in your team: ada.nwosu@example.com")
  },
}

export const EditMember: Story = {
  render: () => (
    <EditMemberDialog member={ifeoluwa} open onOpenChange={noop} onCloseAutoFocus={noop} />
  ),
  play: async ({ canvasElement }) => {
    const form = within(await dialog(canvasElement, "Edit member"))
    // Read-only, with the reason read out alongside it.
    const email = form.getByRole("textbox", { name: "Email address" })
    await expect(email).toHaveAttribute("readonly")
    await expect(email).toHaveAccessibleDescription("Members email address cannot be changed.")
  },
}

export const ImportData: Story = { render: () => <ImportDialog open onOpenChange={noop} /> }

/** Behaviour: a file over 1MB is refused, in words, before anything uploads. */
export const ImportTooBig: Story = {
  render: () => <ImportDialog open onOpenChange={noop} />,
  play: async ({ canvasElement, userEvent }) => {
    const form = within(await dialog(canvasElement, "Import data"))
    const big = new File(["x".repeat(1024 * 1024 + 1)], "team.csv", { type: "text/csv" })
    await userEvent.upload(form.getByLabelText("Upload a file"), big)
    await expect(form.getByRole("alert")).toHaveTextContent("File size exceeds the allowed size.")
    await expect(form.getByRole("button", { name: "Import" })).toBeDisabled()
  },
}

/** Behaviour: importing shows the progress ring counting up, then that it's done. */
export const ImportRuns: Story = {
  render: () => <ImportDialog open onOpenChange={noop} />,
  play: async ({ canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body)
    const csv = new File(
      ["First name,Last name,Email\nAda,Lovelace,ada.l@example.com\nAlan,Turing,alan@example.com"],
      "team.csv",
      { type: "text/csv" },
    )
    const form = within(await dialog(canvasElement, "Import data"))
    await userEvent.upload(form.getByLabelText("Upload a file"), csv)
    await userEvent.click(form.getByRole("button", { name: "Import" }))

    const progress = await body.findByRole("progressbar", { name: "Import progress" })
    await expect(progress).toHaveAttribute("aria-valuemax", "2")
    await waitFor(() => expect(body.getByText("All 2 members imported.")).toBeVisible(), {
      timeout: 3000,
    })
  },
}

export const ExportData: Story = { render: () => <ExportDialog open onOpenChange={noop} /> }

/** Behaviour: dates must be in order, a format is needed, and "Send via email" needs an email. */
export const ExportValidation: Story = {
  render: () => <ExportDialog open onOpenChange={noop} />,
  play: async ({ canvasElement, userEvent }) => {
    const form = within(await dialog(canvasElement, "Export data"))
    await userEvent.type(form.getByRole("textbox", { name: "Date from" }), "08/08/2026")
    await userEvent.type(form.getByRole("textbox", { name: "Date to" }), "01/01/2026")
    await userEvent.click(form.getByRole("switch", { name: "Send via email" }))
    await userEvent.click(form.getByRole("button", { name: "Export" }))

    await form.findByText("Must be on or after Date from")
    await expect(form.getByText("Choose a format")).toBeVisible()
    await expect(form.getByText("Enter the email to send it to")).toBeVisible()
  },
}

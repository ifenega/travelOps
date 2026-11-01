import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { expect, within } from "storybook/test"
import { seedRoles } from "../api/mock-data"
import { mockControls } from "../api/mock-team-service"
import type { Permissions } from "../types"
import { PermissionsGrid, RoleDialog } from "./role-dialog"

const finance = seedRoles.find((r) => r.id === "finance")
if (!finance) throw new Error("No mock finance role")

function Grid() {
  const [value, setValue] = useState<Permissions>(finance?.permissions as Permissions)
  return (
    <div className="max-w-md">
      <PermissionsGrid value={value} onChange={setValue} />
    </div>
  )
}

const meta = {
  title: "Team/RoleDialog",
  parameters: { layout: "fullscreen" },
  beforeEach: () => {
    mockControls.reset()
    mockControls.delay = 0
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const CreateRole: Story = {
  render: () => <RoleDialog open onOpenChange={() => {}} roles={seedRoles} />,
}

export const EditRole: Story = {
  render: () => <RoleDialog open onOpenChange={() => {}} role={finance} roles={seedRoles} />,
}

/** Behaviour: ticking Write ticks Read, and Read can't be unticked while Write is on. */
export const WriteIncludesRead: Story = {
  render: () => <Grid />,
  parameters: { layout: "padded" },
  play: async ({ canvas, userEvent }) => {
    const read = canvas.getByRole("checkbox", { name: "Invite members: Read" })
    await expect(read).not.toBeChecked()
    await userEvent.click(canvas.getByRole("checkbox", { name: "Invite members: Write" }))

    const readNow = canvas.getByRole("checkbox", {
      name: "Invite members: Read (included with Write)",
    })
    await expect(readNow).toBeChecked()
    await expect(readNow).toBeDisabled()

    await userEvent.click(canvas.getByRole("checkbox", { name: "Invite members: Write" }))
    await expect(canvas.getByRole("checkbox", { name: "Invite members: Read" })).toBeEnabled()
  },
}

/** Behaviour: a name is required, must be new, and the role needs access to something. */
export const Validation: Story = {
  render: () => <RoleDialog open onOpenChange={() => {}} roles={seedRoles} />,
  play: async ({ canvasElement, userEvent }) => {
    const dialog = within(canvasElement.ownerDocument.body).getByRole("dialog", {
      name: "Create role",
    })
    await userEvent.type(within(dialog).getByRole("textbox", { name: "Role" }), "developer")
    await userEvent.click(within(dialog).getByRole("button", { name: "Create role" }))
    await within(dialog).findByText("There's already a role with this name")
    await expect(
      within(dialog).getByText("Give the role access to at least one feature"),
    ).toBeVisible()
  },
}

import type { Meta, StoryObj } from "@storybook/react-vite"
import { seedPolicies } from "../api/mock-data"
import { MemberStatusBadge, PolicyBadge } from "./badges"

const meta = {
  title: "Team/Badges",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Statuses: Story = {
  render: () => (
    <div className="flex gap-2">
      <MemberStatusBadge status="active" />
      <MemberStatusBadge status="pending" />
      <MemberStatusBadge status="deactivated" />
    </div>
  ),
}

/** The default policy is grey, others blue. */
export const Policies: Story = {
  render: () => (
    <div className="flex gap-2">
      {seedPolicies.map((policy) => (
        <PolicyBadge key={policy.id} policy={policy} />
      ))}
    </div>
  ),
}

import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { expect } from "storybook/test"
import { Pagination } from "./pagination"

function Pager({ total = 96 }: { total?: number }) {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  return (
    <Pagination
      page={page}
      pageCount={Math.max(1, Math.ceil(total / size))}
      onPageChange={setPage}
      total={total}
      pageSize={size}
      onPageSizeChange={(next) => {
        setSize(next)
        setPage(1)
      }}
    />
  )
}

const meta = {
  title: "Components/Pagination",
  parameters: { layout: "padded" },
  globals: { viewport: { value: "desktop" } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** The Figma's table footer, ten pages. */
export const TenPages: Story = { render: () => <Pager /> }

export const OnePage: Story = { render: () => <Pager total={6} /> }

/** Phones show "Page 1 of 10" instead of page numbers. */
export const Phone: Story = {
  render: () => <Pager />,
  globals: { viewport: { value: "mobile2" } },
}

/** Behaviour: the current page is marked for screen readers, and Previous/Next stop at the ends. */
export const Moving: Story = {
  render: () => <Pager />,
  play: async ({ canvas, userEvent }) => {
    const previous = canvas.getByRole("button", { name: "Previous" })
    await expect(previous).toBeDisabled()
    await expect(canvas.getByRole("button", { name: "Page 1" })).toHaveAttribute(
      "aria-current",
      "page",
    )

    await userEvent.click(canvas.getByRole("button", { name: "Next" }))
    await expect(canvas.getByRole("button", { name: "Page 2" })).toHaveAttribute(
      "aria-current",
      "page",
    )
    await userEvent.click(canvas.getByRole("button", { name: "Page 10" }))
    await expect(canvas.getByRole("button", { name: "Next" })).toBeDisabled()
  },
}

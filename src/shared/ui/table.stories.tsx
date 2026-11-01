import type { Meta, StoryObj } from "@storybook/react-vite"
import { AlertTriangle, ChevronRight, LinkExternal01, Plus } from "@untitledui/icons"
import { useState } from "react"
import { expect } from "storybook/test"
import { Badge } from "./badge"
import { Button } from "./button"
import { Checkbox } from "./checkbox"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortHead,
  TableStatus,
  TableStatusBar,
} from "./table"

const meta = {
  title: "Components/Table",
  component: Table,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

// Sample data shaped like the Figma's cells, as a travel expense review.
const rows = [
  {
    id: "1",
    tone: "error",
    trip: "Lagos → Athens",
    amount: 1340000,
    type: "Flight",
    status: "Conflict",
    statusDetail: "Fare changed",
    total: "$4,566.00",
    change: "−$2.00",
    flagged: true,
  },
  {
    id: "2",
    tone: "success",
    trip: "Athens hotel, 4 nights",
    amount: 612000,
    type: "Stay",
    status: "Resolved",
    statusDetail: "Receipt matched",
    total: "$1,240.00",
    change: "+$0.00",
    flagged: false,
  },
  {
    id: "3",
    tone: "warning",
    trip: "Airport transfer",
    amount: 45000,
    type: "Ground",
    status: "Pending",
    statusDetail: "Awaiting receipt",
    total: "$92.00",
    change: "+$4.50",
    flagged: false,
  },
  {
    id: "4",
    tone: "info",
    trip: "Athens → Lagos",
    amount: 1295000,
    type: "Flight",
    status: "Booked",
    statusDetail: "Ticket issued",
    total: "$4,410.00",
    change: "+$0.00",
    flagged: false,
  },
] as const

const statusLabels = { error: "Conflict", success: "Resolved", warning: "Pending", info: "Booked" }

function ExpensesTable() {
  const [selected, setSelected] = useState<string[]>([])
  const [direction, setDirection] = useState<"ascending" | "descending">("descending")
  const sorted = [...rows].sort((a, b) =>
    direction === "ascending" ? a.amount - b.amount : b.amount - a.amount,
  )
  const allSelected = selected.length === rows.length
  const someSelected = selected.length > 0 && !allSelected

  return (
    <Table>
      <TableCaption>Expenses for the Athens trip</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-0 pr-0">
            <span className="sr-only">Status</span>
          </TableHead>
          <TableHead className="w-0 px-1">
            <span className="sr-only">Flag</span>
          </TableHead>
          <TableHead className="w-0">
            <Checkbox
              aria-label="Select all expenses"
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              onCheckedChange={() => setSelected(allSelected ? [] : rows.map((row) => row.id))}
            />
          </TableHead>
          <TableHead>Trip</TableHead>
          <TableSortHead
            direction={direction}
            onSort={() => setDirection(direction === "ascending" ? "descending" : "ascending")}
            className="text-right"
          >
            Amount (₦)
          </TableSortHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Receipt</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((row) => {
          const isSelected = selected.includes(row.id)
          return (
            <TableRow key={row.id} data-state={isSelected ? "selected" : undefined}>
              <TableCell className="pr-0">
                <TableStatusBar tone={row.tone} label={statusLabels[row.tone]} />
              </TableCell>
              <TableCell className="px-1">
                {row.flagged && (
                  <>
                    <AlertTriangle aria-hidden="true" className="size-4 text-error-600" />
                    <span className="sr-only">Needs attention</span>
                  </>
                )}
              </TableCell>
              <TableCell>
                <Checkbox
                  aria-label={`Select ${row.trip}`}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    setSelected(
                      checked ? [...selected, row.id] : selected.filter((id) => id !== row.id),
                    )
                  }
                />
              </TableCell>
              <TableCell className="text-muted-foreground">{row.trip}</TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {row.amount.toLocaleString("en-NG")}
              </TableCell>
              <TableCell>
                <Badge size="sm">{row.type}</Badge>
              </TableCell>
              <TableCell>
                <TableStatus tone={row.tone} title={row.status} detail={row.statusDetail} />
              </TableCell>
              <TableCell className="tabular-nums">
                <TableStatus tone={row.tone} title={row.total} detail={row.change} />
              </TableCell>
              <TableCell>
                <a
                  href="#receipt"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-sm text-primary-700 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  View
                  <LinkExternal01 aria-hidden="true" className="size-3.5" />
                  <span className="sr-only">receipt for {row.trip} (opens in a new tab)</span>
                </a>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button variant="secondary" size="xs">
                    Review
                  </Button>
                  <Button variant="secondary" size="icon-xs" aria-label={`Add note to ${row.trip}`}>
                    <Plus />
                  </Button>
                  <Button variant="ghost" size="icon-xs" aria-label={`Open ${row.trip}`}>
                    <ChevronRight />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

/** Mirrors the Figma table and its cell types. Scrolls sideways on phones. */
export const Default: Story = { render: () => <ExpensesTable /> }

/** Behaviour: select-all checks every row (and is "mixed" for some); sorting updates aria-sort. */
export const SelectingAndSorting: Story = {
  render: () => <ExpensesTable />,
  play: async ({ canvas, userEvent }) => {
    const selectAll = canvas.getByRole("checkbox", { name: "Select all expenses" })
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select Airport transfer" }))
    await expect(selectAll).toHaveAttribute("aria-checked", "mixed")

    await userEvent.click(selectAll)
    for (const box of canvas.getAllByRole("checkbox")) await expect(box).toBeChecked()

    const amountHeader = canvas.getByRole("columnheader", { name: /amount/i })
    await expect(amountHeader).toHaveAttribute("aria-sort", "descending")
    await userEvent.click(canvas.getByRole("button", { name: /amount/i }))
    await expect(amountHeader).toHaveAttribute("aria-sort", "ascending")
  },
}

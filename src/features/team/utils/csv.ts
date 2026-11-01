import type { Member, Policy, Role } from "../types"

/** Quotes a value when it holds a comma, quote or new line (RFC 4180). */
function cell(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function toCsv(rows: string[][]) {
  return rows.map((row) => row.map(cell).join(",")).join("\r\n")
}

export const templateColumns = ["First name", "Last name", "Email", "Role", "Policy"]

/** The "here" link in Import data: the columns the import expects, with one example row. */
export function importTemplateCsv() {
  return toCsv([
    templateColumns,
    ["Ada", "Nwosu", "ada@example.com", "Developer", "Minimum spend policy"],
  ])
}

export function membersCsv(members: Member[], roles: Role[], policies: Policy[]) {
  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? ""
  const policyName = (id: string) => policies.find((p) => p.id === id)?.name ?? ""
  return toCsv([
    [...templateColumns, "Status", "Date added"],
    ...members.map((m) => [
      m.firstName,
      m.lastName,
      m.email,
      roleName(m.roleId),
      policyName(m.policyId),
      m.status,
      m.dateAdded,
    ]),
  ])
}

/** Data rows in a CSV file: the non-empty lines after the header. */
export function countCsvRows(text: string) {
  return Math.max(0, text.split(/\r?\n/).filter((line) => line.trim() !== "").length - 1)
}

/** Saves text as a file in the browser's downloads. */
export function downloadFile(fileName: string, content: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${mimeType};charset=utf-8` }))
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

import { ChevronDown, DownloadCloud02, UploadCloud02 } from "@untitledui/icons"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { useImport } from "../hooks/use-team"

/** "Manage data ⌄": Import data (greyed out while an import runs) and Export data. */
export function ManageDataMenu({
  onImport,
  onExport,
}: {
  onImport: () => void
  onExport: () => void
}) {
  const importing = useImport().data?.status === "running"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Manage data
          <ChevronDown aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Manage data</DropdownMenuLabel>
        <DropdownMenuItem
          icon={UploadCloud02}
          description={importing ? "An import is already running" : "Batch import team members"}
          disabled={importing}
          onSelect={onImport}
        >
          Import data
        </DropdownMenuItem>
        <DropdownMenuItem
          icon={DownloadCloud02}
          description="Export your team members"
          onSelect={onExport}
        >
          Export data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

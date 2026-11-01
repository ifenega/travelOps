import { useNavigate, useSearch } from "@tanstack/react-router"
import { Plus, Stars02 } from "@untitledui/icons"
import { useState } from "react"
import { Button } from "@/shared/ui/button"
import { Page } from "@/shared/ui/page"
import { SearchInput } from "@/shared/ui/search-input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { ExportDialog } from "../components/export-dialog"
import { ImportDialog } from "../components/import-dialog"
import { InviteDialog } from "../components/invite-dialog"
import { ManageDataMenu } from "../components/manage-data-menu"
import { MembersPanel } from "../components/members-panel"
import { RoleDialog } from "../components/role-dialog"
import { RolesPanel } from "../components/roles-panel"
import { useAnnounceImportFinished, useMembers, useRoles } from "../hooks/use-team"
import type { TeamSearch } from "../search-params"

type OpenDialog = "invite" | "new-role" | "import" | "export" | null

export function TeamPage() {
  const search = useSearch({ from: "/members" })
  const navigate = useNavigate({ from: "/members" })
  const members = useMembers()
  const roles = useRoles()
  const [dialog, setDialog] = useState<OpenDialog>(null)
  useAnnounceImportFinished()

  function update(changes: Partial<TeamSearch>, { replace = false } = {}) {
    navigate({ search: (previous) => ({ ...previous, ...changes }), replace })
  }

  const tabs = [
    { value: "members", label: "All members", count: members.data?.length },
    { value: "roles", label: "Roles", count: roles.data?.length },
  ] as const

  const dialogProps = (name: OpenDialog) => ({
    open: dialog === name,
    onOpenChange: (open: boolean) => setDialog(open ? name : null),
  })

  return (
    <Page
      title="Team members"
      breadcrumbs={[
        { label: "Invite members", to: "/members", icon: Stars02 },
        { label: search.tab === "roles" ? "Roles" : "All members" },
      ]}
    >
      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <div>
          <h1 className="font-semibold text-3xl">Team members</h1>
          <p className="mt-1 text-muted-foreground">
            Manage people in your workspace and their roles
          </p>
        </div>

        <Tabs
          value={search.tab}
          // A new tab starts at its first page, unsearched and sorted by name.
          onValueChange={(tab) =>
            update({ tab: tab as TeamSearch["tab"], q: undefined, page: 1, sort: "name" })
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList aria-label="Show">
              {tabs.map(({ value, label, count }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  // "All members 14", read in full; see bookings for why it's spelled out.
                  aria-label={count === undefined ? undefined : `${label} ${count}`}
                >
                  {label}{" "}
                  {count !== undefined && <span className="text-muted-foreground">{count}</span>}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              {search.tab === "members" && (
                <>
                  {/* A line of its own on phones, so it isn't squeezed by the buttons. */}
                  <div className="flex w-full sm:w-auto">
                    <SearchInput
                      label="Search members"
                      value={search.q ?? ""}
                      onChange={(q) => update({ q: q || undefined, page: 1 }, { replace: true })}
                    />
                  </div>
                  <ManageDataMenu
                    onImport={() => setDialog("import")}
                    onExport={() => setDialog("export")}
                  />
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setDialog("new-role")}>
                New role
              </Button>
              <Button size="sm" onClick={() => setDialog("invite")}>
                Invite member
                <Plus aria-hidden="true" />
              </Button>
            </div>
          </div>

          <TabsContent value="members" className="mt-4">
            <MembersPanel search={search} onSearchChange={update} />
          </TabsContent>
          <TabsContent value="roles" className="mt-4">
            <RolesPanel search={search} onSearchChange={update} />
          </TabsContent>
        </Tabs>
      </div>

      <InviteDialog {...dialogProps("invite")} />
      <RoleDialog {...dialogProps("new-role")} roles={roles.data ?? []} />
      <ImportDialog {...dialogProps("import")} />
      <ExportDialog {...dialogProps("export")} />
    </Page>
  )
}

# Phase 2 — Team UI plan (members, roles, import, export)

**Scope:** the team section's UI, frontend only. There's no backend yet, so every server call goes through a typed service with a **mock implementation**, as in chat and bookings.

**Designs:** `uiscreenshot/members/` (10), `roles/` (8), `bulk-upload/` (6), `export/` (4), all from 2026-11-01. Sessions in a worktree read them from `/Users/ifeoluwa/personal/travelOps/uiscreenshot/`. Mobile isn't designed; see [section 6](#6-mobile-proposed-no-designs-yet).

**Where the work happens:** branch `team-ui`, in the worktree `../travelOps-team`.

Read `CLAUDE.md` first. Its rules (simplicity, accessibility, tokens, animation, git) apply to everything here.

---

## 1. What the designs show

One page, **Team members** ("Manage people in your workspace and their roles"), with two tabs: **All members** and **Roles**. The header row has Search, **Manage data ⌄**, **New role** and **Invite member +**.

| #   | Screen / state                                                                                                                                                                                                                                                                                                                                             | Screenshots                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 1   | **Members table:** Users ↑ (avatar or initial, name, email), Date added, Status (**Active** green, **Pending** amber, **Deactivated** red), Role (a dropdown, "Administrator ⌄"), Policy (a badge: **High spend policy** blue, **Minimum spend policy** grey), Actions (`···`). Footer: "6 results", "Rows per page: 10 ⌄", page numbers, Previous / Next. | members 07.31.29               |
| 2   | **Role dropdown in a row:** "Select role", each role with an icon and a description, then a red **Delete user** ("Revoke user's access")                                                                                                                                                                                                                   | members 07.30.43               |
| 3   | **Row `···` menu, "Select action":** Resend invite email, Edit user                                                                                                                                                                                                                                                                                        | members 07.30.49               |
| 4   | **Add members dialog:** Email (several, typed or pasted, become chips with ✕), Select policy (policy list with a "Default" tag), Role (role list with descriptions), Message, Cancel / Send invite. Then the toast "Invite sent successfully".                                                                                                             | members 07.30.56–07.31.29      |
| 5   | **Edit member dialog:** First / Last name, Email (read-only: "Members email address cannot be changed"), Select policy, Phone number, Gender, Country, Cancel / Save changes                                                                                                                                                                               | members 07.31.40               |
| 6   | **Delete member** (red, "This action is permanent and irreversible") and **Resend invite email** confirmations, each naming "Folagbade Timilehin • timilehin@gmail.com"                                                                                                                                                                                    | members 07.31.47, 07.31.56     |
| 7   | **Search:** typing filters the table; a ⓧ clears it                                                                                                                                                                                                                                                                                                        | members 07.32.06               |
| 8   | **Roles table:** Role ↑, Description (one line, cut off), Members, Status ("Active ⌄"), Action (✏️). The header row shows only New role and Invite member.                                                                                                                                                                                                 | roles 07.33.55                 |
| 9   | **Role status menu:** Active ("This role can be assigned to team members"), Delete role ("Roles with users assigned to them cannot be deleted")                                                                                                                                                                                                            | roles 07.33.43                 |
| 10  | **Create role / Edit role dialog:** Role name, Role description, and a permissions grid: Features (?) × Read / Write for Chat, Bookings, Expenses, Wallet, Policies, Reports, Invite members. Then the toast "Role created successfully".                                                                                                                  | roles 07.34.01–07.34.33        |
| 11  | **Delete role** confirmation                                                                                                                                                                                                                                                                                                                               | roles 07.34.39                 |
| 12  | **Manage data menu:** Import data ("Batch import team members"), Export data ("Export your team members"). Import is greyed out while an import is running.                                                                                                                                                                                                | bulk-upload 07.36.26, 07.36.57 |
| 13  | **Import data dialog:** "CSV or XLS under 1MB", Upload button, a template link ("here"). The error "File size exceeds the allowed size." A chosen file shows its name, size, a ✓ and Delete.                                                                                                                                                               | bulk-upload 07.36.34–07.36.49  |
| 14  | **Import progress dialog:** file name and size, a progress ring "1/10", Cancel import                                                                                                                                                                                                                                                                      | bulk-upload 07.37.04           |
| 15  | **Export data dialog:** Date from / Date to (DD/MM/YYYY with a calendar icon), Format (CSV / XLS), **Send via email** (switch, then an email field), **Send a copy to me** ("Copy will be sent to tim\*\*\*de@gmail.com")                                                                                                                                  | export 07.39.04–07.39.22       |

**Not designed** (built on existing patterns, then adjusted when designs arrive):

- Empty, loading and error states for both tables.
- What happens when an import finishes or fails partway (a summary of rows added and rows rejected).
- How a member becomes **Deactivated**, or is reactivated. No action for it is drawn, so status is display-only.
- Who may see this page. The UI doesn't gate it by role yet; the backend must (section 9).
- Mobile (section 6).

**Mistakes in the designs, fixed rather than copied:**

- **Typos:** "Can changed" → "Can change", "Save chnages" → "Save changes", "permisions" → "permissions".
- **Wrong list label:** the policy list is labelled "Select role"; it should say "Select policy".
- **Placeholder data:** the counts don't match ("All members 3" with 6 rows; "6 results" with 10 pages). Several rows repeat ("Policy maker" four times), and every role has the same description. The mock data will be consistent.
- **Wrong button:** "Create role" is the button on **Edit role** too. It becomes "Save changes".
- **Resend invite** says "This action cannot be undone", which doesn't fit resending an email. That line is dropped.

---

## 2. Architecture

### Folder layout

```
src/features/team/
  api/          team-service.ts (interface), mock-team-service.ts, mock-data.ts, errors.ts
  components/   members-table, member-row-menus, invite-dialog, email-chips-input,
                edit-member-dialog, roles-table, role-dialog, permissions-grid,
                import-dialog, export-dialog, …
  hooks/        use-team.ts (TanStack Query)
  pages/        team-page.tsx
  utils/        emails.ts (split and check pasted emails), paginate.ts, csv.ts (export + template)
  types.ts      Member, Role, Permission, Policy, ImportJob, …
  search-params.ts
  index.ts
```

### Data, without a backend

- **`TeamService` interface:**
  - Members: `listMembers()`, `inviteMembers({ emails, policyId, roleId, message })`, `updateMember(id, changes)`, `changeRole(memberId, roleId)`, `deleteMember(id)`, `resendInvite(id)`.
  - Roles: `listRoles()`, `createRole(role)`, `updateRole(id, role)`, `deleteRole(id)`. Deleting fails with a clear error if members still have the role.
  - `listPolicies()`. Policies get their own section later; for now the mock holds the two from the design.
  - **Import:** `startImport(file)` returns a job id; `getImport(id)` reports `{ done, total, status }`; `cancelImport(id)`.
  - **Export:** `exportMembers({ from, to, format, emailTo?, copyToMe })` returns the file to download.
- **`mockTeamService`:**
  - Keeps everything in memory, with the same `mockControls` (delay, fail, reset) as bookings.
  - **Import** counts the rows of a CSV and "imports" one row every few hundred ms, so the progress ring moves. It can't read XLS files, so it pretends they have 10 rows. The real backend will do the actual importing.
  - **Export** builds a real CSV of the members in the date range. XLS is offered as in the design, but the mock returns CSV until the backend exists (said in a comment, and in section 9).
- **Paging, sorting and search** happen in the browser over the mock's full list (`utils/paginate.ts`, unit-tested). If the real API pages on the server, only the hooks change.
- **TanStack Query** for all of it. Invite, edit, role change and delete update the table straight away and roll back if the call fails.

### Route (in `src/app/routes.tsx`)

| Path       | Page                        | URL search params                                 |
| ---------- | --------------------------- | ------------------------------------------------- |
| `/members` | Team members (screens 1–15) | `tab=members\|roles`, `q`, `page`, `size`, `sort` |

- **It replaces the placeholder** at `/members` (the sidebar's "Invite members").
- **Breadcrumbs:** "Invite members > All members" (or "> Roles"), as drawn.
- **Defaults stay out of the URL,** as on bookings.
- **A new `team` flag** (default on) gates the route and the sidebar link, like the other sections.

### How the pieces behave

| Action                     | What it does                                                                                                                                                                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Role dropdown in a row** | Picking a role asks first ("Change Ifeoluwa Olorunnegan's role to Developer?"), then saves and shows a toast. **Delete user** at the bottom opens the Delete member confirmation.                                                                                                                             |
| **Row `···`**              | **Resend invite email** asks first, then sends; it's only offered while the member is Pending. **Edit user** opens Edit member.                                                                                                                                                                               |
| **Invite member +**        | Opens Add members. Emails become chips on comma, Enter, space or paste; invalid ones show in red with an error. Policy defaults to the one marked Default. Send invite needs at least one valid email and a role.                                                                                             |
| **New role / ✏️**          | Opens Create role / Edit role. **Ticking Write ticks Read**, and Read can't be unticked while Write is on. A name is required and must be unique.                                                                                                                                                             |
| **Role status ⌄**          | "Active" (the current state) or "Delete role". Delete is disabled with its reason shown when the role has members; otherwise it asks first.                                                                                                                                                                   |
| **Manage data → Import**   | Checks the type (`.csv`, `.xls`, `.xlsx`) and size (≤ 1 MB) before upload. Import starts the job and switches the dialog to Import progress. Closing the dialog doesn't stop the import, and Import stays greyed out in the menu until it finishes. When it's done, a toast says how many members were added. |
| **"here" (template)**      | Downloads `team-members-template.csv` (First name, Last name, Email, Role, Policy).                                                                                                                                                                                                                           |
| **Manage data → Export**   | Date range (both optional; From must be before To), format (required). **Export always downloads the file.** "Send via email" adds an email field (required while on), and "Send a copy to me" emails the signed-in user too. A toast confirms what happened.                                                 |

---

## 3. New shared components

| Component              | Built on                                           | Used for                                                                                                                                                       |
| ---------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pagination**         | Plain buttons in a `<nav aria-label="Pagination">` | "6 results · Rows per page 10 ⌄ · 1 2 3 … 10 · Previous / Next". Expenses and reports will need it too.                                                        |
| **Textarea**           | Our Input's styles                                 | Message, Role description                                                                                                                                      |
| **DatePicker**         | The existing Calendar in a ResponsivePopover       | Export's Date from / Date to                                                                                                                                   |
| **Table header style** | Change to the shared Table                         | These designs use sentence-case headers ("Users ↑"), not the uppercase from phase 1. Nothing in the app uses Table yet, so the shared header changes to match. |

Feature-local until a second feature needs them: **EmailChipsInput** (free-typed emails; bookings' RecipientPicker picks from a list instead), **FileDrop / ImportProgress** (with a progress ring), and **PermissionsGrid**.

The **Country** field is a Select (typing a letter jumps to it), over names built with `Intl.DisplayNames` from a list of country codes, so no country names have to be maintained.

Moved to `shared/` during the build, because bookings needs them too: **SearchInput** (search with a ⓧ clear button; the bookings list uses it now) and **SwitchField** (a labelled switch row; bookings' Share trip uses it now). The shared **AlertDialog** gained the design's orange "!" and a rich description, and **Input** a read-only style.

---

## 4. Accessibility notes

- **Tables:**
  - Real `<table>` markup.
  - Sortable headers use `aria-sort` (the shared Table already does).
  - Every row's controls are named for the row: "Role for Ifeoluwa Olorunnegan: Finance analyst", "Actions for Ifeoluwa Olorunnegan", "Edit Finance analyst role".
- **Status and policy badges** always show the word, not only a colour.
- **Search:** labelled "Search members". The ⓧ is "Clear search". The number of results is announced politely after typing stops.
- **Pagination:**
  - "Page 2" buttons, and the current one has `aria-current="page"`.
  - Previous and Next are disabled at the ends.
  - "6 results" is announced when it changes.
- **Email chips:**
  - Each chip has a remove button ("Remove fred@gmail.com").
  - Invalid emails say so in text ("fred@gmail is not a valid email"), not only in red.
  - The field's errors use `aria-describedby`.
- **Permissions grid:**
  - A table with a caption. Each checkbox is named "Bookings: Write".
  - When Write turns Read on, Read is shown checked and disabled, with a note: "Included with Write".
- **Import progress:**
  - The ring is a `role="progressbar"` with `aria-valuenow`, `aria-valuemax` and the text "1 of 10 members imported".
  - Finishing is announced through the toast.
- **Confirm dialogs:** AlertDialog, so focus starts on Cancel. They name the person or role in the title or description.
- **Read-only email** in Edit member is a real read-only input with its note linked by `aria-describedby`, not a disabled input, so screen readers can still read it.

---

## 5. Forms

All forms use React Hook Form + Zod (CLAUDE.md), with `mode: "onTouched"` and `<Field>`:

- **Invite:** `emails` (1+ valid, deduplicated, not already members; checked on Send, not on blur, because an error appearing on blur pushes the Send button away mid-click), `policyId`, `roleId`, `message` (optional, ≤ 500 characters).
- **Edit member:** first and last name (required), policy, phone (optional, digits, spaces, + and dashes), gender (optional: Female, Male, Prefer not to say), country.
- **Role:** name (required, unique), description (optional), permissions (at least one Read).
- **Export:** format (required), dates (From ≤ To), email (required when Send via email is on).

---

## 6. Mobile (proposed, no designs yet)

- **Header:** the title, then a row with the tabs, then Search at full width. Manage data, New role and Invite member move into a single row of buttons that wraps.
- **Members:** below `md`, the table becomes **stacked rows**: avatar, name and email, the status badge, and a `···` menu with Change role, Edit user, Resend invite and Delete user. The policy shows as a line under the email.
- **Roles:** stacked rows with name, member count, status and ✏️; the description is shown in full under the name.
- **Dialogs:** full width with a margin. The permissions grid fits at 375px (three narrow columns).
- **Pagination:** Previous / Next with "Page 2 of 10" between them; no page numbers.

---

## 7. Milestones

Each milestone ends with: stories for new components; a11y checks passing; `pnpm lint`, `typecheck`, `test` and `build` green; and a visual check against the screenshots at desktop width and 375px.

| #         | Milestone                                                                                                                                                                                  | Done when                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| **M0** ✅ | **Baseline:** `team-ui` worktree from `main`                                                                                                                                               | `git worktree list` shows `travelOps-team`                       |
| **M1** ✅ | **Shared:** Pagination, Textarea, DatePicker, Table header restyle                                                                                                                         | Stories, with a keyboard test for Pagination                     |
| **M2** ✅ | **Data:** types and Zod schemas, mock service (members, roles, policies, import job, export), query hooks, `emails.ts` / `paginate.ts` / `csv.ts` with unit tests                          | Unit tests pass                                                  |
| **M3** ✅ | **Members tab:** tabs with counts, search with clear, sort, pagination, role dropdown with confirm, policy badges, `···` menu, states, stacked rows on phones                              | Matches screens 1–3 and 7                                        |
| **M4** ✅ | **Member dialogs:** Add members (email chips), Edit member, Delete member, Resend invite, with toasts                                                                                      | Matches screens 4–6; every form usable by keyboard and VoiceOver |
| **M5** ✅ | **Roles tab:** table, status menu, Create/Edit role with the permissions grid, Delete role                                                                                                 | Matches screens 8–11                                             |
| **M6** ✅ | **Manage data:** Import (checks, template, progress, cancel, finished toast, menu greyed out while running) and Export (dates, format, email, copy to me, download)                        | Matches screens 12–15                                            |
| **M7**    | **Polish:** ✅ animation review (press feedback on the role and status dropdowns and page numbers; tabs no longer animate); ✅ page-level stories for the whole flow; ⬜ real-iPhone check | Checked on an iPhone ⬜                                          |

M1 comes first. M3 and M5 can go side by side after M2; M4 needs M3; M6 needs M2 and M3.

---

## 8. Working alongside the other sessions

- **Hotspots:** `routes.tsx` (one team block replacing the `/members` placeholder), `flags.ts` / `.env.example` (the `team` flag), `app-sidebar.tsx` (wrap Invite members in the flag), `shared/ui/table.tsx` (header style).
- **To put work on `main`,** follow CLAUDE.md: merge `main` into `team-ui`, run every check, then fast-forward only.
- **Bookings' Share trip** has its own small mock list of team members. Once the team service exists, bookings can read members through `@/features/team` instead. That's a small follow-up, not part of this phase.

---

## 9. Decisions

**Decided (2026-11-01):**

1. **Export** always downloads the file; the switches also email it.
2. **Write includes Read** in role permissions.
3. **Changing a member's role in the table asks first,** then saves.
4. **On phones,** the tables become stacked rows.

**Proposed, confirm or change:**

5. **Status is display-only.** There's no deactivate/reactivate action until it's designed.
6. **Resend invite** is offered only for Pending members.
7. **Gender** is optional: Female, Male, Prefer not to say.
8. **The import template** has the columns First name, Last name, Email, Role, Policy.
9. **XLS:** accepted for import and offered for export, but the mock treats both as CSV until the backend handles them.
10. **No role-based hiding** in the UI yet. Who can open this page is enforced by the backend; a `team` flag can hide it meanwhile.

/** Thrown by deleteRole while members still have the role. */
export class RoleInUseError extends Error {
  constructor(roleName: string, memberCount: number) {
    super(
      `${roleName} can't be deleted while ${memberCount} ${memberCount === 1 ? "member has" : "members have"} it`,
    )
    this.name = "RoleInUseError"
  }
}

/** Thrown when inviting someone who's already a member. */
export class AlreadyMemberError extends Error {
  emails: string[]

  constructor(emails: string[]) {
    super(`Already in the team: ${emails.join(", ")}`)
    this.name = "AlreadyMemberError"
    this.emails = emails
  }
}

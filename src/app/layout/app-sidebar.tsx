import { Link } from "@tanstack/react-router"
import {
  BookClosed,
  FileShield02,
  HelpCircle,
  Map01,
  MessageChatCircle,
  MessageQuestionCircle,
  PieChart03,
  Plus,
  Settings01,
  User01,
  Wallet02,
} from "@untitledui/icons"
import { Feature } from "@/shared/flags/feature"
import { Button } from "@/shared/ui/button"
import { Logo } from "@/shared/ui/logo"
import { SidebarCloseButton, SidebarLink, SidebarSection } from "@/shared/ui/sidebar"
import { ThemeToggle } from "./theme-toggle"

// The TravelOps sidebar contents, from the Figma. Flagged items disappear when their flag is off
// (their routes show the 404 page too, see routes.tsx).
export function AppSidebar() {
  return (
    // The logo row and the account row stay put; only the nav scrolls on short screens.
    <div className="flex h-full flex-col gap-4 p-3">
      <div className="flex shrink-0 items-center justify-between">
        <Logo className="px-1" />
        <SidebarCloseButton />
      </div>

      <nav
        aria-label="Main"
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain py-2"
      >
        <div className="flex flex-col gap-0.5">
          <SidebarLink to="/chat" icon={MessageChatCircle}>
            Chat
          </SidebarLink>
          <Feature flag="bookings">
            <SidebarLink to="/bookings" icon={Map01}>
              Bookings
            </SidebarLink>
          </Feature>
          <Feature flag="expenses">
            <SidebarLink to="/expenses" icon={BookClosed}>
              Expenses
            </SidebarLink>
          </Feature>
        </div>

        <SidebarSection label="Workspace">
          <Feature flag="wallet">
            <SidebarLink to="/wallet" icon={Wallet02}>
              Wallet
            </SidebarLink>
          </Feature>
          <Feature flag="policies">
            <SidebarLink to="/policies" icon={FileShield02}>
              Policies
            </SidebarLink>
          </Feature>
          <Feature flag="reports">
            <SidebarLink to="/reports" icon={PieChart03}>
              Reports
            </SidebarLink>
          </Feature>
        </SidebarSection>

        <SidebarSection label="Recent chats">
          <p className="px-2 text-muted-foreground text-sm">Your recent chats will appear here.</p>
        </SidebarSection>

        <div className="mt-auto">
          <SidebarSection label="Try">
            <Feature flag="team">
              <SidebarLink to="/members" icon={Plus}>
                Invite members
              </SidebarLink>
            </Feature>
            <SidebarLink to="/support" icon={MessageQuestionCircle}>
              Chat with support
            </SidebarLink>
            <SidebarLink to="/account" icon={Settings01}>
              Manage your account
            </SidebarLink>
          </SidebarSection>
        </div>
      </nav>

      <div className="flex shrink-0 items-center justify-between">
        {/* Placeholder avatar until real user data exists. */}
        <Link
          to="/account"
          aria-label="Your account"
          className="grid size-8 place-items-center rounded-full bg-foreground/10 text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        >
          <User01 className="size-4" />
        </Link>
        <div className="flex items-center">
          <Feature flag="darkMode">
            <ThemeToggle />
          </Feature>
          <Button asChild variant="ghost" size="icon">
            <Link to="/support" aria-label="Help">
              <HelpCircle />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

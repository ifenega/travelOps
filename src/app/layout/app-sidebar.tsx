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
import { useChats } from "@/features/chat"
import { Feature } from "@/shared/flags/feature"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Logo } from "@/shared/ui/logo"
import {
  SidebarLink,
  SidebarSection,
  SidebarToggleButton,
  useSidebarRail,
} from "@/shared/ui/sidebar"
import { ThemeToggle } from "./theme-toggle"

// The TravelOps sidebar contents, from the Figma. Flagged items disappear when their flag is off
// (their routes show the 404 page too, see routes.tsx). Collapsed on desktop, it's an icon rail.
export function AppSidebar() {
  const rail = useSidebarRail()

  return (
    // The logo row and the account row stay put; only the nav scrolls on short screens.
    <div className="flex h-full flex-col gap-4 px-2 py-3 lg:px-3">
      <div
        className={cn("flex shrink-0 items-center", rail ? "justify-center" : "justify-between")}
      >
        {!rail && <Logo className="px-1" />}
        <SidebarToggleButton />
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

        <SidebarSection label="Recent chats">{!rail && <RecentChats />}</SidebarSection>

        <div className="mt-auto">
          <SidebarSection label="Try">
            <SidebarLink to="/members" icon={Plus}>
              Invite members
            </SidebarLink>
            <SidebarLink to="/support" icon={MessageQuestionCircle}>
              Chat with support
            </SidebarLink>
            <SidebarLink to="/account" icon={Settings01}>
              Manage your account
            </SidebarLink>
          </SidebarSection>
        </div>
      </nav>

      <div
        className={cn(
          "flex shrink-0 items-center",
          rail ? "flex-col-reverse gap-2" : "justify-between",
        )}
      >
        {/* Placeholder avatar until real user data exists. */}
        <Link
          to="/account"
          aria-label="Your account"
          className="grid size-8 place-items-center rounded-full bg-foreground/10 text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        >
          <User01 className="size-4" />
        </Link>
        <div className={cn("flex items-center", rail && "flex-col")}>
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

function RecentChats() {
  const chats = useChats().slice(0, 8)
  if (chats.length === 0) {
    return <p className="px-2 text-muted-foreground text-sm">Your recent chats will appear here.</p>
  }
  return (
    <ul className="flex flex-col gap-0.5">
      {chats.map((chat) => (
        <li key={chat.id}>
          <SidebarLink to="/chat/$chatId" params={{ chatId: chat.id }}>
            {chat.title}
          </SidebarLink>
        </li>
      ))}
    </ul>
  )
}

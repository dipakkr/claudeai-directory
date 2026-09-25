"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X, LogOut, User as UserIcon, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationBell from "@/components/layout/NotificationBell";
import { Logo } from "@/components/layout/Logo";
import { SignInButton, useSignIn } from "@/components/auth/SignInDialog";

// CLAUDE.md "Navigation": Skills, MCP, Agents, Submit. Search and Jobs are
// hidden from the header for now (⌘K still opens search). Everything else
// stays reachable from the footer.
const navLinks = [
  { href: "/launches", label: "Launches" },
  { href: "/skills", label: "Skills" },
  { href: "/mcp", label: "MCP" },
  { href: "/agents", label: "Agents" },
  { href: "/plugins", label: "Plugins" },
  { href: "/feed", label: "Feed" },
  { href: "/members", label: "Members" },
];

// Everything else worth finding, grouped under "More".
const moreGroups = [
  {
    label: "Learn",
    links: [
      { href: "/guides", label: "Guides" },
      { href: "/blog", label: "Blog" },
      { href: "/cheatsheet", label: "Claude Code cheatsheet" },
      { href: "/claude-code-commands", label: "Claude Code commands" },
      { href: "/anthropic-claude-release-timelines", label: "Release timeline" },
    ],
  },
  {
    label: "Tools",
    links: [
      { href: "/claude-md-generator", label: "CLAUDE.md generator" },
      { href: "/llm-api-pricing", label: "LLM API pricing" },
      { href: "/prompts", label: "Prompts" },
    ],
  },
  {
    label: "Community",
    links: [
      { href: "/community", label: "Forum" },
      { href: "/jobs", label: "Jobs" },
    ],
  },
];
const moreHrefs = moreGroups.flatMap((g) => g.links.map((l) => l.href));

const pill =
  "inline-flex h-8 items-center justify-center whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const showUserMenu = !isLoading && isAuthenticated && user;
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const closeMenu = () => setIsMenuOpen(false);
  const { openSignIn } = useSignIn();

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--cad-nav-bg)] backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-[1180px] items-center gap-4 px-4 md:px-8">
        <Logo />

        {/* Desktop: nav centred on the bar, actions right */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-2.5 py-1.5 text-sm transition-colors xl:px-3 ${
                isActive(link.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1.5 text-sm outline-none transition-colors xl:px-3 ${
                moreHrefs.some(isActive) ? "text-foreground" : "text-muted-foreground hover:text-foreground data-[state=open]:text-foreground"
              }`}
            >
              More
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              {moreGroups.map((group, i) => (
                <div key={group.label}>
                  {i > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel className="text-[11px] font-normal uppercase tracking-[0.06em] text-muted-foreground">
                    {group.label}
                  </DropdownMenuLabel>
                  {group.links.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link href={link.href} className={isActive(link.href) ? "text-foreground" : undefined}>
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="ml-auto hidden items-center lg:flex">
          <Link href="/launches/submit" className={`${pill} bg-foreground text-background hover:bg-foreground/85`}>
            Submit app
          </Link>

          {showUserMenu ? (
            <div className="ml-2 flex items-center gap-1.5">
              <NotificationBell />
              <UserMenu user={user} logout={logout} />
            </div>
          ) : (
            <SignInButton className={`${pill} ml-2 cursor-pointer border border-border bg-secondary text-foreground hover:bg-muted`}>
              Sign in
            </SignInButton>
          )}
        </div>

        {/* Mobile / tablet */}
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <Link href="/launches/submit" className={`${pill} hidden bg-foreground text-background sm:inline-flex`}>
            Submit app
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-border"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-16 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-border bg-background px-4 pb-6 pt-2 lg:hidden">
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`border-b border-border/60 py-3 text-[15px] ${
                  isActive(link.href) ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {moreGroups.map((group) => (
              <div key={group.label} className="border-b border-border/60 py-3">
                <p className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground/80">{group.label}</p>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className={`text-[14px] ${isActive(link.href) ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 border-b border-border/60 py-3 text-left text-[15px] text-muted-foreground"
            >
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="hidden h-4 w-4 dark:block" />
              Switch theme
            </button>
            <div className="mt-5 flex flex-col gap-2">
              <Link href="/launches/submit" onClick={closeMenu} className={`${pill} h-10 bg-foreground text-background`}>
                Submit app
              </Link>
              {showUserMenu ? (
                <>
                  <Link href="/dashboard" onClick={closeMenu} className={`${pill} h-10 border border-border`}>
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className={`${pill} h-10 text-muted-foreground`}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    openSignIn();
                  }}
                  className={`${pill} h-10 border border-border`}
                >
                  Sign in
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

function UserMenu({
  user,
  logout,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  logout: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <Avatar className="h-7 w-7">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name ?? user.username} />}
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {user.name?.[0]?.toUpperCase() ?? user.username[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.name ?? user.username}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <UserIcon className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Header;

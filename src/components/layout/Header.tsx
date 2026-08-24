"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User as UserIcon, Bookmark, ChevronDown, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationBell from "@/components/layout/NotificationBell";
import { SOCIAL_LINKS } from "@/lib/social";

const navLinks = [
  { href: "/community", label: "Community" },
  { href: "/connectors", label: "Connectors" },
  { href: "/mcp", label: "MCPs" },
  { href: "/skills", label: "Skills" },
];

const moreLinks = [
  { href: "/prompts", label: "Prompts" },
  { href: "/members", label: "Members" },
  { href: "/guides", label: "Guides" },
  { href: "/jobs", label: "Jobs" },
  { href: "/blog", label: "Blog" },
  { href: "/cheatsheet", label: "Claude Code Cheatsheet" },
  { href: "/llm-api-pricing", label: "LLM API Pricing" },
  { href: "/llm-api-pricing/cost-calculator", label: "Cost Calculator" },
  { href: "/anthropic-claude-release-timelines", label: "Anthropic Timeline" },
  { href: "/setup", label: "CLAUDE.md Generator" },
];

const discordUrl = SOCIAL_LINKS.discord;

function JoinCommunityMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="h-9 rounded-[9px] px-[18px] text-sm">
          Join
          <ChevronDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {discordUrl ? (
          <DropdownMenuItem asChild>
            <a href={discordUrl} target="_blank" rel="noreferrer">
              Join Discord community
            </a>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled>Discord link not set</DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/signup">Create free account</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/community">Open forum</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const showUserMenu = !isLoading && isAuthenticated && user;
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
          aria-label="claudeai.directory home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.svg" alt="" width={28} height={28} className="h-7 w-7" />
          <span
            className="text-[16.5px] font-semibold text-foreground"
            style={{ letterSpacing: 0 }}
          >
            claudeai<span className="text-primary">.directory</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-sm lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap border-b-2 px-1.5 py-1 text-muted-foreground hover:text-primary ${
                isActive(link.href) ? "border-primary text-foreground" : "border-transparent"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* More dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-1.5 py-1 text-sm text-muted-foreground outline-none hover:text-primary">
                More
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {moreLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild className="text-xs py-1.5">
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border border-border bg-card hover:border-[var(--cad-line-hover)] hover:bg-card"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </Button>
          {showUserMenu && <NotificationBell />}
          {showUserMenu ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Avatar className="h-7 w-7">
                    {user.avatar && <AvatarImage src={user.avatar} alt={user.name ?? user.username} />}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
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
                <DropdownMenuItem asChild>
                  <Link href="/saved">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Saved
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
              Sign In
            </Link>
          )}
          <JoinCommunityMenu />
        </div>

        {/* Tablet actions */}
        <div className="hidden items-center gap-2 md:flex lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border border-border bg-card"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </Button>
          <JoinCommunityMenu />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg border border-border bg-card"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg border border-border bg-card"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-14 border-b border-border bg-background p-4 shadow-sm lg:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground ${
                  isActive(link.href) ? "bg-muted text-foreground" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-1 border-border" />
            {moreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground ${
                  isActive(link.href) ? "bg-muted text-foreground" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-1 border-border" />
            <div className="px-3 pt-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--cad-faint)]">
              Join community
            </div>
            {discordUrl ? (
              <a
                href={discordUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Join Discord community
              </a>
            ) : (
              <span className="rounded-lg px-3 py-2 text-sm text-[var(--cad-faint)]">
                Discord link not set
              </span>
            )}
            <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              Create free account
            </Link>
            <Link href="/community" onClick={() => setIsMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              Open forum
            </Link>
            <hr className="my-1 border-border" />
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="hidden h-4 w-4 dark:block" />
              Toggle theme
            </button>
            <hr className="my-1 border-border" />
            {showUserMenu ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                  Dashboard
                </Link>
                <Link href="/saved" onClick={() => setIsMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                  Saved
                </Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-foreground">
                  Sign In
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User as UserIcon, Bookmark, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  { href: "/skills", label: "Skills" },
  { href: "/mcp", label: "MCPs" },
  { href: "/prompts", label: "Prompts" },
  { href: "/jobs", label: "Jobs" },
  { href: "/blog", label: "Blog" },
];

const moreLinks = [
  { href: "/guides", label: "Guides" },
  { href: "/llm-api-pricing", label: "LLM API Pricing" },
  { href: "/llm-api-pricing/cost-calculator", label: "Cost Calculator" },
  { href: "/anthropic-claude-release-timelines", label: "Anthropic Timeline" },
  { href: "/setup", label: "CLAUDE.md Generator" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:opacity-80 transition-opacity shrink-0"
        >
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">C</span>
          </div>
          <span className="inline">ClaudeAI Directory</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* More dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors outline-none">
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
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && user ? (
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
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-14 border-b border-border bg-background p-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
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
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-1 border-border" />
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                  Dashboard
                </Link>
                <Link href="/saved" onClick={() => setIsMenuOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                  Saved
                </Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="rounded-md px-3 py-2 text-sm text-foreground font-medium">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

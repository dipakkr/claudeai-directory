"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User as UserIcon, Bookmark, Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  { href: "/community", label: "Community" },
  { href: "/learn", label: "Learn" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:opacity-80 transition-opacity"
        >
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">C</span>
          </div>
          <span className="hidden sm:inline">Claude Directory</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="h-8 w-44 rounded-lg border border-border bg-card/50 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all focus:w-56"
            />
          </form>

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

        {/* Mobile: search + menu */}
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

      {/* Mobile Menu */}
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
            <hr className="my-2 border-border" />
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

"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications, useMarkNotificationsRead } from "@/hooks/use-notifications";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 2592000)}mo`;
}

// Strip the origin off stored absolute links so navigation stays client-side.
function toPath(link?: string): string {
  if (!link) return "#";
  return link.replace(/^https?:\/\/[^/]+/, "") || "#";
}

export default function NotificationBell() {
  const { data } = useNotifications(true);
  const markRead = useMarkNotificationsRead();
  const items = data?.notifications ?? [];
  const unread = data?.unread ?? 0;

  const handleOpenChange = (open: boolean) => {
    if (open && unread > 0) {
      markRead.mutate(undefined);
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {unread > 0 && (
            <button
              onClick={() => markRead.mutate(undefined)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-3 py-10 text-center">
              <Bell className="mx-auto mb-2 h-6 w-6 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">No notifications yet.</p>
            </div>
          ) : (
            items.map((n) => (
              <Link
                key={n.id}
                href={toPath(n.link)}
                className={`block border-b border-border/60 px-3 py-2.5 transition-colors hover:bg-accent/40 ${
                  n.read ? "" : "bg-accent/30"
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && (
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                  <div className={`min-w-0 flex-1 ${n.read ? "pl-3.5" : ""}`}>
                    <p className="text-xs font-medium leading-snug text-foreground line-clamp-2">
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">
                        {n.body}
                      </p>
                    )}
                    <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                      {timeAgo(n.created_at)} ago
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { useEffect, useState, useCallback, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, Wrench, Server, FileText, Briefcase, Rocket, BookOpen } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { useDebounce } from "@/hooks/use-debounce";

const typeIcons: Record<string, React.ReactNode> = {
  skill: <Wrench className="mr-2 h-4 w-4 text-muted-foreground" />,
  mcp_server: <Server className="mr-2 h-4 w-4 text-muted-foreground" />,
  prompt: <FileText className="mr-2 h-4 w-4 text-muted-foreground" />,
  job: <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />,
  showcase: <Rocket className="mr-2 h-4 w-4 text-muted-foreground" />,
  blog: <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />,
};

const typeLabels: Record<string, string> = {
  skill: "Skills",
  mcp_server: "MCP Servers",
  prompt: "Prompts",
  job: "Jobs",
  showcase: "Showcase",
  blog: "Articles",
};

const typeRoutes: Record<string, string> = {
  skill: "/skills",
  mcp_server: "/mcp",
  prompt: "/prompts",
  job: "/jobs",
  showcase: "/showcase",
  blog: "/blog",
};

const CommandMenuContext = createContext<{ open: () => void }>({ open: () => {} });

export function useCommandMenu() {
  return useContext(CommandMenuContext);
}

export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { data: results } = useSearch(debouncedQuery);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const openMenu = () => setOpen(true);
    document.addEventListener("keydown", down);
    document.addEventListener("open-command-menu", openMenu);
    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("open-command-menu", openMenu);
    };
  }, []);

  const grouped = (results ?? []).reduce<Record<string, typeof results>>((acc, r) => {
    const type = r._type;
    if (!acc[type]) acc[type] = [];
    acc[type]!.push(r);
    return acc;
  }, {});

  const handleSelect = useCallback(
    (result: { _type: string; id: string }) => {
      setOpen(false);
      setQuery("");
      const base = typeRoutes[result._type] ?? "/";
      router.push(`${base}/${result.id}`);
    },
    [router]
  );

  const openFn = useCallback(() => setOpen(true), []);

  return (
    <CommandMenuContext.Provider value={{ open: openFn }}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search skills, MCPs, prompts, jobs..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {debouncedQuery.length < 2
              ? "Type to search across all content..."
              : "No results found."}
          </CommandEmpty>
          {Object.entries(grouped).map(([type, items]) => (
            <CommandGroup key={type} heading={typeLabels[type] ?? type}>
              {items?.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.title ?? item.name ?? ""} ${item.description}`}
                  onSelect={() => handleSelect(item)}
                >
                  {typeIcons[type] ?? <Search className="mr-2 h-4 w-4 text-muted-foreground" />}
                  <div className="flex flex-col">
                    <span className="text-sm">{item.title ?? item.name}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {item.description}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </CommandMenuContext.Provider>
  );
}

export function CommandMenuTrigger() {
  const { open } = useCommandMenu();

  return (
    <button
      onClick={open}
      className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}

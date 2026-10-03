"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

import { TOPICS } from "@/lib/launch-options";

/**
 * One topic: shows the choice as a small tag, or a search box that filters the list as you type.
 * Keyboard: arrows to move, Enter to pick, Escape to close.
 */
export function TopicSelect({ value, onChange, id }: { value: string; onChange: (topic: string) => void; id?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? TOPICS.filter((t) => t.toLowerCase().includes(q)) : TOPICS;
  }, [query]);

  const pick = (topic: string) => {
    onChange(topic);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative">
      <div
        className="flex h-10 w-full cursor-text items-center gap-2 rounded-[8px] border border-transparent bg-foreground/[0.06] px-3 text-[14px] focus-within:border-[var(--cad-line-hover)]"
        onClick={() => input.current?.focus()}
      >
        {value && !open && (
          <span className="inline-flex items-center gap-1 rounded-[6px] bg-primary/15 px-2 py-0.5 text-[13px] text-primary">
            {value}
            <button
              type="button"
              aria-label={`Remove ${value}`}
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="rounded hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        <input
          ref={input}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={query}
          placeholder={value && !open ? "" : "Search topics, e.g. marketing"}
          onFocus={() => {
            setOpen(true);
            setActive(0);
          }}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, options.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (open && options[active]) pick(options[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            } else if (e.key === "Backspace" && !query && value) {
              onChange("");
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </div>

      {open && (
        <ul id={listId} role="listbox" className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-[8px] border border-border bg-card p-1 shadow-lg">
          {options.length ? (
            options.map((topic, i) => (
              <li
                key={topic}
                role="option"
                aria-selected={topic === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(topic);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center justify-between rounded-[6px] px-2.5 py-1.5 text-[13.5px] ${
                  i === active ? "bg-foreground/[0.07] text-foreground" : "text-muted-foreground"
                }`}
              >
                {topic}
                {topic === value && <Check className="h-3.5 w-3.5 text-primary" />}
              </li>
            ))
          ) : (
            <li className="px-2.5 py-1.5 text-[13px] text-muted-foreground">No topic matches. Pick &ldquo;Other&rdquo;.</li>
          )}
        </ul>
      )}
    </div>
  );
}

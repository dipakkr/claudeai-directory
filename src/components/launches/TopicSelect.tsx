"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

import { MAX_TOPICS, TOPICS } from "@/lib/launch-options";

/**
 * Topics (up to three): chosen ones as small tags, then a search box that filters the list.
 * Keyboard: arrows to move, Enter to add or remove, Backspace on an empty box removes the last tag.
 */
export function TopicSelect({ value, onChange, id }: { value: string[]; onChange: (topics: string[]) => void; id?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const full = value.length >= MAX_TOPICS;

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? TOPICS.filter((t) => t.toLowerCase().includes(q)) : TOPICS;
  }, [query]);

  const toggle = (topic: string) => {
    if (value.includes(topic)) onChange(value.filter((t) => t !== topic));
    else if (!full) onChange([...value, topic]);
    setQuery("");
  };

  return (
    <div className="relative">
      <div
        className="flex min-h-10 w-full cursor-text flex-wrap items-center gap-1.5 rounded-[8px] border border-transparent bg-foreground/[0.06] px-2 py-1.5 text-[14px] focus-within:border-[var(--cad-line-hover)]"
        onClick={() => input.current?.focus()}
      >
        {value.map((topic) => (
          <span key={topic} className="inline-flex items-center gap-1 rounded-[6px] bg-primary/15 px-2 py-0.5 text-[13px] text-primary">
            {topic}
            <button
              type="button"
              aria-label={`Remove ${topic}`}
              onClick={(e) => {
                e.stopPropagation();
                onChange(value.filter((t) => t !== topic));
              }}
              className="rounded hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={input}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={query}
          placeholder={value.length ? (full ? "" : "Add another") : "Search topics, e.g. marketing"}
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
              if (open && options[active]) toggle(options[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            } else if (e.key === "Backspace" && !query && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          className="min-w-[8rem] flex-1 bg-transparent px-1 text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        <ChevronDown className="mr-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </div>

      {open && (
        <ul id={listId} role="listbox" aria-multiselectable className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-[8px] border border-border bg-card p-1 shadow-lg">
          {full && <li className="px-2.5 py-1.5 text-[12px] text-muted-foreground">Up to {MAX_TOPICS} topics. Remove one to pick another.</li>}
          {options.length ? (
            options.map((topic, i) => {
              const picked = value.includes(topic);
              const disabled = full && !picked;
              return (
                <li
                  key={topic}
                  role="option"
                  aria-selected={picked}
                  aria-disabled={disabled}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!disabled) toggle(topic);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`flex items-center justify-between rounded-[6px] px-2.5 py-1.5 text-[13.5px] ${
                    disabled ? "cursor-default opacity-40" : "cursor-pointer"
                  } ${i === active && !disabled ? "bg-foreground/[0.07] text-foreground" : "text-muted-foreground"}`}
                >
                  {topic}
                  {picked && <Check className="h-3.5 w-3.5 text-primary" />}
                </li>
              );
            })
          ) : (
            <li className="px-2.5 py-1.5 text-[13px] text-muted-foreground">No topic matches. Pick &ldquo;Other&rdquo;.</li>
          )}
        </ul>
      )}
    </div>
  );
}

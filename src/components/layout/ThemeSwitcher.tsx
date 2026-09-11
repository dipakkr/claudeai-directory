"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

const options = [
  { value: "light", label: "Light theme", Icon: Sun },
  { value: "dark", label: "Dark theme", Icon: Moon },
  { value: "system", label: "System theme", Icon: Monitor },
] as const;

const noopSubscribe = () => () => {};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  // The stored theme is only known on the client; avoid a mismatched active state.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  return (
    <div role="radiogroup" aria-label="Color theme" className="flex items-center gap-0.5 rounded-full border border-border p-0.5">
      {options.map(({ value, label, Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => setTheme(value)}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}

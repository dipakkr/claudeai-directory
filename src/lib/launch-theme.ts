/**
 * Each launch's colour, used on its share card, its page header and its logo tile in lists.
 * Five looks from the directory's collection banners plus the site's coral, picked from the
 * slug so a launch always gets the same one.
 */
export interface LaunchTheme {
  name: "green" | "blue" | "warm" | "purple" | "coral";
  top: string;
  bottom: string;
  accent: string;
}

export const LAUNCH_THEMES: LaunchTheme[] = [
  { name: "green", top: "#1d2b25", bottom: "#34594a", accent: "#8FD3B0" },
  { name: "blue", top: "#1c2433", bottom: "#2f4a6b", accent: "#93B8E8" },
  { name: "warm", top: "#2b2119", bottom: "#5a3d2a", accent: "#E9B48A" },
  { name: "purple", top: "#241d2e", bottom: "#46365e", accent: "#C3A9EE" },
  { name: "coral", top: "#14120B", bottom: "#3a2318", accent: "#D97757" },
];

export function launchTheme(slug: string): LaunchTheme {
  const hash = [...slug].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  return LAUNCH_THEMES[hash % LAUNCH_THEMES.length];
}

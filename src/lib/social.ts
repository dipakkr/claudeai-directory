/**
 * Public community + social destinations.
 *
 * Kept in source rather than env vars: these are public URLs, and every
 * environment should point at the same places. NEXT_PUBLIC_DISCORD_URL still
 * wins if it is set, so a deploy can override without a code change.
 */
export const SOCIAL_LINKS = {
    discord: process.env.NEXT_PUBLIC_DISCORD_URL || "https://discord.gg/a4JbsYz7W",
    linkedin: "https://www.linkedin.com/company/claude-ai-community",
    // facebook: add the page URL here to switch the footer link on.
    facebook: "",
} as const;

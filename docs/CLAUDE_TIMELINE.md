# Claude release timeline maintenance

Route: `/anthropic-claude-release-timelines`.
Data: `src/app/anthropic-claude-release-timelines/timeline-data.ts`.

The timeline is curated, not automatically synchronized. `LAST_UPDATED` is the
last completed source review, not a model release date. Use the announcement's
actual date for every entry. Do not add a release merely because today is newer.

Review these official feeds together:

- Announcements: https://www.anthropic.com/news
- Claude app: https://support.claude.com/en/articles/12138966-release-notes
- Platform: https://platform.claude.com/docs/en/release-notes/overview
- Claude Code: https://code.claude.com/docs/en/changelog
- Current models: https://platform.claude.com/docs/en/models/overview

Keep stable entry IDs, dated source links, beta/preview eligibility and access
restrictions. Mark only the current public model in each family as `current`.
Use `channel: "api"` or `channel: "code"` for developer updates. The page derives
filters, counts, latest dates, structured data and social artwork from the data.
Summarize meaningful changes; link to the full changelog for individual fixes.

November 12, 2026 review: added 34 entries, including Haiku 5.5, Fable/Mythos 5.2,
October–November app and platform changes, and five November Claude Code releases.
Latest verified model date is November 9; latest Claude Code date is November 10.
No November 12 release was found in the reviewed official feeds.

Before publishing: targeted ESLint, production build, unique IDs and valid date
checks, four current public model families, and browser checks of all filters.

# Homepage sponsor grid

Restored independently from the unfinished homepage redesign on November 13, 2026.
Ten cells: ToolJunction first, up to nine eligible campaigns, then booking buttons.
Five columns on desktop; two columns below 768px. Uses existing campaign data and
impression/click tracking. Retired Pipedream, duplicates and expired campaigns are
excluded. Homepage booking buttons open the shared $59/week Stripe checkout, with one to
four weeks available. Paid campaigns appear in the homepage grid and sponsor
sidebars after payment verification and admin approval. The existing sidebar
slot identifier is retained for payment/webhook and admin compatibility.
Homepage impressions and clicks use the same immutable campaign ID as sidebar
delivery and roll up into that campaign’s private report. An impression requires
at least 50% visibility for one second in a visible browser tab.

Brand assets retrieved from the sponsors' own websites on November 13, 2026:

- Contactzilla: https://contactzilla.com/logo.svg → public/brands/contactzilla-logo.svg
- InviziPoll: https://invizipoll.com/invizipoll-logo.svg → public/brands/invizipoll-logo.svg
- ToolJunction: existing public/brands/tooljunction-logo.png retained.

Contactzilla supplies a black monochrome wordmark; CSS inverts it on the dark theme.
InviziPoll's supplied shield keeps its original colours. Campaign-provided logo URLs
are preferred; known sponsor assets are served locally when those URLs are empty.

The audience panel supports 7, 14 and 30 days, defaulting to 7. Each selection
requests its own cached statistics and country distribution. View full stats
preserves the selected range. Domain Rating is owner-supplied and independent
of the selected traffic window (44/100 as of November 13, 2026).

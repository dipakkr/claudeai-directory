# Homepage sponsor grid

Restored independently from the unfinished homepage redesign on November 13, 2026.
Ten cells: ToolJunction first, up to nine eligible campaigns, then booking buttons.
Five columns on desktop; two columns below 768px. Uses existing campaign data and
impression/click tracking. Retired Pipedream, duplicates and expired campaigns are
excluded. Homepage booking buttons open the shared $69/week Stripe checkout, with discounted packages of
$129 for two weeks, $179 for three weeks and $219 for four weeks (28 days).
Four weeks saves $57 compared with four separate $69 bookings. The server
calculates the package total, and Stripe charges one line item for the full
duration. The UI verifies the selected price against the public checkout config. Paid campaigns appear in the homepage grid and sponsor
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

The audience panel supports rolling 24 hours plus 7, 14 and 30 days, defaulting to 7.
24h shares the homepage pulse query and refreshes each minute. It shows actual
rolling visitor/pageview totals, without a fabricated previous-window delta or
country distribution. Its full-stats link opens the live traffic dashboard;
country breakdowns remain available for the longer ranges. Each selection
requests its own cached statistics and country distribution. View full stats
preserves the selected range. Domain Rating is owner-supplied and independent
of the selected traffic window (44/100 as of November 13, 2026).

The audience country list shows the actual top five by traffic plus up to two
additional EU countries from the selected range, in one continuous list without
a separate EU heading. Already displayed countries are excluded; percentages
are never renormalized or hardcoded.

SILO's official mark is copied unchanged from https://siloslabs.com/favicon.svg
into public/brands/silos-logo.svg. The embedded SVG supports light/dark colors;
scoped CSS matches its color scheme to the site's theme across sponsor placements.

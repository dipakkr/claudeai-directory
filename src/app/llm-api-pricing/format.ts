export function formatPrice(value: number | null | undefined) {
  if (value == null) return "-";
  if (value === 0) return "$0";
  if (value < 0.1) return `$${value.toFixed(3)}`;
  return `$${value.toFixed(2)}`;
}

export function formatTokens(value: number | null | undefined) {
  if (!value) return "-";
  if (value >= 1_000_000) return `${+(value / 1_000_000).toFixed(2)}M`;
  return `${Math.round(value / 1000)}K`;
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "-";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

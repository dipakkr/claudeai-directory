type UtmParams = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
};

const DEFAULT_UTM_SOURCE = "claudeai_directory";

function normalizeParam(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

export function isExternalHttpHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function withUtmParams(href: string, params: UtmParams = {}): string {
  if (!isExternalHttpHref(href)) {
    return href;
  }

  try {
    const url = new URL(href);
    const utm = {
      utm_source: params.source ?? DEFAULT_UTM_SOURCE,
      utm_medium: params.medium,
      utm_campaign: params.campaign,
      utm_content: params.content,
      utm_term: params.term,
    };

    Object.entries(utm).forEach(([key, value]) => {
      if (value && !url.searchParams.has(key)) {
        url.searchParams.set(key, normalizeParam(value));
      }
    });

    return url.toString();
  } catch {
    return href;
  }
}

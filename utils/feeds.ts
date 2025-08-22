// utils/feeds.ts

export function getExtraFeedUrls(): string[] {
  const raw = process.env.EXTRA_RSS_FEEDS || "";
  return raw
    .split(/[\n,]/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}


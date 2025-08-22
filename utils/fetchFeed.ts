// utils/fetchFeed.ts
import Parser from "rss-parser";
import { stableId } from "./id";
import type { RSSItem as LiveItem } from "./fetchRSS";

type AnyItem = LiveItem & { [k: string]: any };

const parser = new Parser<AnyItem>({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail"],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

function firstImgFromHtml(html?: string): string | undefined {
  if (!html) return undefined;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1];
}

function pickImage(item: AnyItem): string | undefined {
  if (item?.enclosure?.url) return item.enclosure.url;
  const mc = item.mediaContent;
  if (Array.isArray(mc)) {
    for (const v of mc) {
      const url = v?.url || v?.$?.url;
      if (url) return url;
    }
  } else if (mc) {
    const url = mc?.url || mc?.$?.url;
    if (url) return url;
  }
  const mt = item.mediaThumbnail;
  const thumbUrl = mt?.url || mt?.$?.url;
  if (thumbUrl) return thumbUrl;
  const enc = firstImgFromHtml(item.contentEncoded);
  if (enc) return enc;
  return undefined;
}

export async function fetchFeed(url: string): Promise<LiveItem[]> {
  const feed = await parser.parseURL(url);
  const items: AnyItem[] = Array.isArray((feed as any)?.items)
    ? ((feed as any).items as AnyItem[])
    : [];
  return items.map((entry: AnyItem, i: number): LiveItem => ({
    id: stableId((entry as any).guid, entry.link ?? "", i),
    title: entry.title ?? "",
    link: entry.link ?? "",
    pubDate: entry.pubDate ?? "",
    contentSnippet: entry.contentSnippet ?? "",
    enclosure: (() => {
      const imageUrl = pickImage(entry);
      return imageUrl ? { url: imageUrl } : undefined;
    })(),
  }));
}

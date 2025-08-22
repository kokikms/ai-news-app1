// utils/fetchRSS.ts
import Parser from "rss-parser";
import { stableId } from "./id";

export type RSSItem = {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  enclosure?: { url: string };
};

const parser = new Parser<RSSItem>();

export async function fetchRSS(keyword: string): Promise<RSSItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    keyword
  )}&hl=ja&gl=JP&ceid=JP:ja`;
  const feed = await parser.parseURL(url);
  return feed.items.map((item, i) => ({
    id: stableId((item as any).guid, item.link, i),
    title: item.title || "",
    link: item.link || "",
    pubDate: item.pubDate || "",
    contentSnippet: item.contentSnippet || "",
    enclosure: item.enclosure,
  }));
}

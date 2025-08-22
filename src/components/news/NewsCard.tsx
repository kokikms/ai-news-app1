// components/news/NewsCard.tsx
"use client";
import type { RSSItem } from "../../../utils/fetchNews";

export default function NewsCard({ item }: { item: RSSItem }) {
  const title =
    // モック用(summary) > RSS用(title) > RSS要約(contentSnippet)
    ("summary" in item ? item.summary : undefined) ||
    ("title" in item ? item.title : undefined) ||
    ("contentSnippet" in item ? item.contentSnippet : "");

  const url = ("link" in item ? (item as any).link : (item as any).sourceUrl) as
    | string
    | undefined;

  return url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 border rounded hover:shadow-sm transition"
      style={{ minHeight: 0, lineHeight: 1.2 }}
    >
      <div className="text-sm text-gray-500 mb-1">{(item as any).pubDate}</div>
      <h2 className="text-base font-medium">{title}</h2>
    </a>
  ) : (
    <div
      className="block p-4 border rounded opacity-70"
      style={{ minHeight: 0, lineHeight: 1.2 }}
    >
      <div className="text-sm text-gray-500 mb-1">{(item as any).pubDate}</div>
      <h2 className="text-base font-medium">{title}</h2>
    </div>
  );
}

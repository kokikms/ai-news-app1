// components/news/NewsCard.tsx
"use client";
import Link from "next/link";
import type { RSSItem } from "../../../utils/fetchNews";

export default function NewsCard({ item }: { item: RSSItem }) {
  const title =
    // モック用(summary) > RSS用(title) > RSS要約(contentSnippet)
    ("summary" in item ? item.summary : undefined) ||
    ("title" in item ? item.title : undefined) ||
    ("contentSnippet" in item ? item.contentSnippet : "");

  return (
    <Link
      href={`/news/${encodeURIComponent(item.id)}`}
      className="block p-4 border rounded hover:shadow-sm transition"
      style={{ minHeight: 0, lineHeight: 1.2 }}
    >
      <div className="text-sm text-gray-500 mb-1">{(item as any).pubDate}</div>
      <h2 className="text-base font-medium">{title}</h2>
    </Link>
  );
}

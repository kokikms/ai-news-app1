// components/news/NewsCard.tsx
"use client";
import Link from "next/link";

type Article = {
  id: string;
  summary: string;
  pubDate?: string;
};

export default function NewsCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/news/${encodeURIComponent(article.id)}`}
      className="block p-4 border rounded hover:shadow-sm transition"
      style={{ minHeight: 0, lineHeight: 1.2 }}
    >
      <div className="text-sm text-gray-500 mb-1">{article.pubDate}</div>
      <h2 className="text-base font-medium">{article.summary}</h2>
    </Link>
  );
}

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
      className="block p-4 border rounded hover:shadow"
    >
      <div className="text-sm text-gray-500">
        {article.pubDate || "2025-08-21"}
      </div>
      <h2 className="font-semibold">{article.summary}</h2>
    </Link>
  );
}

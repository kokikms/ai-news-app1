// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import NewsCard from "../components/news/NewsCard";
import { RSSItem } from "../../utils/fetchNews";
import { DEFAULT_NEWS_QUERY } from "../../utils/queries";

export default function Home() {
  const [items, setItems] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<string>("");
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    const url = query
      ? `/api/news?keyword=${encodeURIComponent(query)}`
      : "/api/news"; // 未指定時はAPI側のデフォルトクエリ
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setItems(data as RSSItem[]);
        } else {
          console.warn("/api/news returned non-array:", data);
          setItems([]);
        }
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [query]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(input.trim());
  };
  const onClear = () => {
    setInput("");
    setQuery("");
  };

  if (loading && items.length === 0) return <p>読み込み中…</p>;

  return (
    <main className="p-4">
      <form onSubmit={onSubmit} className="mb-2 flex items-center gap-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={DEFAULT_NEWS_QUERY}
          className="flex-1 h-9 text-sm border rounded-md px-2 py-1"
        />
        <button
          type="submit"
          className="h-9 px-3 text-sm bg-blue-600 text-white rounded-md disabled:opacity-60"
          disabled={loading}
        >
          検索
        </button>
        <button
          type="button"
          onClick={onClear}
          className="h-9 px-2 text-sm border rounded-md"
          disabled={loading}
        >
          クリア
        </button>
      </form>

      {query && (
        <div className="text-xs text-gray-600 mb-2">
          検索: <span className="font-medium">{query}</span>
        </div>
      )}

      {items.length === 0 && !loading && (
        <p>記事が見つかりませんでした。</p>
      )}

      <div className="grid gap-4">
        {items.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}

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
  const [strict, setStrict] = useState<boolean>(false);
  const [sort, setSort] = useState<"date" | "relevance">("date"); // デフォルトを新着順に変更

  const fetchNews = () => {
    const params = new URLSearchParams();
    if (query) params.set("keyword", query);
    if (strict) params.set("strict", "true");
    if (sort) params.set("sort", sort);
    // タイムスタンプを追加してキャッシュを回避
    params.set("_t", Date.now().toString());
    const url = `/api/news${params.toString() ? `?${params.toString()}` : ""}`; // 未指定時はAPI側のデフォルトクエリ
    setLoading(true);
    fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
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
  };

  useEffect(() => {
    fetchNews();
  }, [query, strict, sort]);

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
      <form onSubmit={onSubmit} className="mb-2 flex items-center gap-2 flex-wrap">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={DEFAULT_NEWS_QUERY}
          className="flex-1 min-w-[220px] h-9 text-sm border rounded-md px-2 py-1"
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
        <label className="flex items-center gap-1 text-xs text-gray-700">
          <input
            type="checkbox"
            checked={strict}
            onChange={(e) => setStrict(e.target.checked)}
          />
          厳密一致
        </label>
        <label className="flex items-center gap-1 text-xs text-gray-700">
          並び:
          <select
            className="h-8 text-xs border rounded px-1"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
          >
            <option value="date">新着</option>
            <option value="relevance">関連</option>
          </select>
        </label>
      </form>

      {query && (
        <div className="text-xs text-gray-600 mb-2">
          検索: <span className="font-medium">{query}</span>
        </div>
      )}

      {sort === "date" && (
        <div className="text-xs text-blue-600 mb-2">
          📅 最新の記事から表示中
        </div>
      )}

      {sort === "relevance" && (
        <div className="text-xs text-green-600 mb-2">
          🎯 キーワードとの関連度順で表示中
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

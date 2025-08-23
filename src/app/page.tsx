// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import NewsCard from "../components/news/NewsCard";
import PopularNewsSection from "../components/news/PopularNewsSection";
import { RSSItem } from "../../utils/fetchNews";
import { DEFAULT_NEWS_QUERY } from "../../utils/queries";

type TabType = "japanese" | "english" | "popular";

export default function Home() {
  const [items, setItems] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [strict, setStrict] = useState<boolean>(false);
  const [sort, setSort] = useState<"date" | "relevance" | "popularity">("date"); // デフォルトを新着順に変更
  const [activeTab, setActiveTab] = useState<TabType>("japanese");

  const fetchNews = () => {
    const params = new URLSearchParams();
    if (query) params.set("keyword", query);
    if (strict) params.set("strict", "true");
    
    // 人気記事タブの場合は人気順ソートを強制
    if (activeTab === "popular") {
      params.set("sort", "popularity");
    } else {
      if (sort) params.set("sort", sort);
    }
    
    // 人気記事タブの場合は言語を指定しない（日本語・英語混合）
    if (activeTab !== "popular") {
      params.set("lang", activeTab);
    }
    
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
  }, [query, strict, sort, activeTab]);

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
      {/* タブ切り替え */}
      <div className="flex mb-4 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("japanese")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "japanese"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          🇯🇵 日本語
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("english")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "english"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          🇺🇸 English
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("popular")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "popular"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          🔥 人気記事
        </button>
      </div>

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
            disabled={activeTab === "popular"}
          >
            <option value="date">新着</option>
            <option value="popularity">人気順</option>
            <option value="relevance">関連</option>
          </select>
        </label>
      </form>

      {query && (
        <div className="text-xs text-gray-600 mb-2">
          検索: <span className="font-medium">{query}</span>
        </div>
      )}

      {activeTab === "popular" && (
        <div className="text-xs text-orange-600 mb-2">
          🔥 人気記事を表示中（日本語・英語分離表示）
        </div>
      )}

      {activeTab !== "popular" && sort === "date" && (
        <div className="text-xs text-blue-600 mb-2">
          📅 最新の記事から表示中 ({activeTab === "japanese" ? "日本語" : "English"})
        </div>
      )}

      {activeTab !== "popular" && sort === "popularity" && (
        <div className="text-xs text-orange-600 mb-2">
          🔥 人気順で表示中 ({activeTab === "japanese" ? "日本語" : "English"})
        </div>
      )}

      {activeTab !== "popular" && sort === "relevance" && (
        <div className="text-xs text-green-600 mb-2">
          🎯 キーワードとの関連度順で表示中 ({activeTab === "japanese" ? "日本語" : "English"})
        </div>
      )}

      {items.length === 0 && !loading && (
        <p>記事が見つかりませんでした。</p>
      )}

      {activeTab === "popular" ? (
        <PopularNewsSection items={items} />
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}

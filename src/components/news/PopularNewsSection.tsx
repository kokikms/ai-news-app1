// components/news/PopularNewsSection.tsx
"use client";
import { useState } from "react";
import NewsCard from "./NewsCard";
import { RSSItem } from "../../../utils/fetchNews";

interface PopularNewsSectionProps {
  items: RSSItem[];
}

type PopularTabType = "japanese" | "english";

export default function PopularNewsSection({ items }: PopularNewsSectionProps) {
  const [activeTab, setActiveTab] = useState<PopularTabType>("japanese");

  // 日本語と英語の記事を分離
  const japaneseItems = items.filter(item => {
    const text = `${(item as any).title || ""} ${(item as any).contentSnippet || ""}`;
    return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
  });

  const englishItems = items.filter(item => {
    const text = `${(item as any).title || ""} ${(item as any).contentSnippet || ""}`;
    return !/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
  });

  return (
    <div className="space-y-6">
      {/* タブ切り替え */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("japanese")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "japanese"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          🇯🇵 日本語人気記事 ({japaneseItems.length}件)
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
          🇺🇸 English Popular ({englishItems.length}件)
        </button>
      </div>

      {/* タブコンテンツ */}
      {activeTab === "japanese" && (
        <div>
          {japaneseItems.length > 0 ? (
            <div className="grid gap-4">
              {japaneseItems.slice(0, 10).map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">日本語の人気記事がありません</p>
          )}
        </div>
      )}

      {activeTab === "english" && (
        <div>
          {englishItems.length > 0 ? (
            <div className="grid gap-4">
              {englishItems.slice(0, 10).map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No popular English articles</p>
          )}
        </div>
      )}
    </div>
  );
}

// components/news/NewsCard.tsx
"use client";
import type { RSSItem } from "../../../utils/fetchNews";
import { relativeTimeJa } from "../../../utils/date";

export default function NewsCard({ item }: { item: RSSItem }) {
  const title =
    // モック用(summary) > RSS用(title) > RSS要約(contentSnippet)
    ("summary" in item ? item.summary : undefined) ||
    ("title" in item ? item.title : undefined) ||
    ("contentSnippet" in item ? item.contentSnippet : "");

  const url = ("link" in item ? (item as any).link : (item as any).sourceUrl) as
    | string
    | undefined;
  const domain = (() => {
    try {
      return url ? new URL(url).hostname.replace(/^www\./, "") : undefined;
    } catch {
      return undefined;
    }
  })();
  const favicon = domain
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`
    : undefined;
  const thumb = (item as any)?.enclosure?.url as string | undefined;
  const timeLabel = relativeTimeJa((item as any).pubDate);
  
  // 詳細な日時表示
  const pubDate = (item as any).pubDate;
  const detailedTime = pubDate ? new Date(pubDate).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }) : '';

  // 記事の新鮮度を判定
  const getFreshnessIndicator = () => {
    if (!pubDate) return null;
    const now = new Date();
    const pubTime = new Date(pubDate);
    const diffHours = (now.getTime() - pubTime.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return <span className="text-red-600 font-bold">🔥 1時間以内</span>;
    if (diffHours < 3) return <span className="text-orange-600 font-bold">⚡ 3時間以内</span>;
    if (diffHours < 6) return <span className="text-yellow-600 font-bold">📰 6時間以内</span>;
    if (diffHours < 12) return <span className="text-blue-600 font-bold">📖 12時間以内</span>;
    return <span className="text-gray-600">📚 12時間以上前</span>;
  };

  const Title = (
    <h2
      className="text-sm font-medium"
      style={{
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical" as any,
        overflow: "hidden",
      }}
      title={title}
    >
      {title}
    </h2>
  );

  const Meta = (
    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
      {domain && (
        <span className="inline-flex items-center gap-1">
          {favicon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={favicon} alt="" width={14} height={14} />
          )}
          <span>{domain}</span>
        </span>
      )}
      {timeLabel && (
        <span className="flex items-center gap-1">
          <span>・{timeLabel}</span>
          <span title={detailedTime} className="text-gray-400">
            ({detailedTime})
          </span>
        </span>
      )}
      {getFreshnessIndicator() && (
        <span className="ml-2">
          {getFreshnessIndicator()}
        </span>
      )}
    </div>
  );

  const CardInner = (
    <div className="flex items-stretch">
      <div className="flex-1 min-w-0 p-3">
        {Meta}
        {Title}
      </div>
      {(thumb || (item as any).enclosure?.url) && (
        <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb || (item as any).enclosure?.url}
            alt=""
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              (e.currentTarget.parentElement as HTMLElement).style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block border rounded-md overflow-hidden hover:shadow-sm transition"
        style={{ minHeight: 0, lineHeight: 1.2 }}
      >
        {CardInner}
      </a>
    );
  }

  return (
    <div className="block border rounded-md overflow-hidden opacity-70" style={{ minHeight: 0, lineHeight: 1.2 }}>
      {CardInner}
    </div>
  );
}

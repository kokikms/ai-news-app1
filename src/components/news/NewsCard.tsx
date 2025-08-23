// components/news/NewsCard.tsx
"use client";
import type { RSSItem } from "../../../utils/fetchNews";
import { getRelativeTimeText } from "../../../utils/date";
import { generateTags, getTagDisplayName, getTagColor } from "../../../utils/tags";
import { generateArticleImage } from "../../../utils/imageGenerator";

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
  const originalThumb = (item as any)?.enclosure?.url as string | undefined;
  
  // 投稿時間を取得
  const pubDate = (item as any).pubDate;
  const relativeTime = getRelativeTimeText(pubDate);
  
  // タグを生成
  const tags = generateTags(title, (item as any).contentSnippet);
  
  // 画像を決定（オリジナル画像がない場合は自動生成）
  const thumb = originalThumb || generateArticleImage(tags, title);

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
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {domain && (
          <span className="inline-flex items-center gap-1">
            {favicon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={favicon} alt="" width={14} height={14} />
            )}
            <span>{domain}</span>
          </span>
        )}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`px-1.5 py-0.5 text-xs rounded ${getTagColor(tag)} opacity-70`}
            >
              {getTagDisplayName(tag).replace(/^[^\s]+\s/, '')}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-500 opacity-70">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );

  const CardInner = (
    <div className="flex items-stretch">
      <div className="flex-1 min-w-0 p-3 flex flex-col">
        <div className="flex-1">
          {Meta}
          {Title}
        </div>
        {relativeTime && (
          <div className="mt-2 text-xs text-gray-400">
            {relativeTime}
          </div>
        )}
      </div>
      <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumb}
          alt=""
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // 画像読み込みエラー時は自動生成画像にフォールバック
            const fallbackImage = generateArticleImage(tags, title);
            if (e.currentTarget.src !== fallbackImage) {
              e.currentTarget.src = fallbackImage;
            } else {
              // フォールバック画像も失敗した場合は非表示
              (e.currentTarget as HTMLImageElement).style.display = "none";
              (e.currentTarget.parentElement as HTMLElement).style.display = "none";
            }
          }}
        />
      </div>
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

// components/news/NewsDetail.tsx
import { getRelativeTimeText } from "../../../utils/date";
import { generateTags, getTagDisplayName, getTagColor } from "../../../utils/tags";

type Article = {
  id: string;
  summary: string;
  pubDate?: string;
  content?: string;
  author?: string;
  category?: string;
  tags?: string[];
  sourceUrl?: string;
};

export default function NewsDetail({ article }: { article: Article }) {
  // タグを生成
  const tags = generateTags(article.summary, article.content);
  const relativeTime = getRelativeTimeText(article.pubDate);

  return (
    <article className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        {article.category && (
          <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full mb-4">
            {article.category}
          </span>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {article.summary}
        </h1>
        <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
          {article.author && <span>著者: {article.author}</span>}
          {relativeTime && <span>{relativeTime}</span>}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-1 text-xs rounded ${getTagColor(tag)} opacity-70`}
              >
                {getTagDisplayName(tag).replace(/^[^\s]+\s/, '')}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose max-w-none">
        {article.content ? (
          <div
            dangerouslySetInnerHTML={{
              __html: article.content.replace(/\n/g, "<br />"),
            }}
          />
        ) : (
          <p>コンテンツがありません</p>
        )}
      </div>

      {article.sourceUrl && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            元の記事を読む →
          </a>
        </div>
      )}
    </article>
  );
}

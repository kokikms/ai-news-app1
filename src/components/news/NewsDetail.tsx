// components/news/NewsDetail.tsx
type Article = {
  id: string;
  summary: string;
  pubDate?: string;
  // 今後拡張：title, body, link など
};

export default function NewsDetail({ article }: { article: Article }) {
  return (
    <div className="space-y-4 p-4 border rounded">
      <div className="text-xs text-gray-500">{article.pubDate}</div>
      <h1 className="text-2xl font-bold">{article.summary}</h1>
      {/* 本文や参考リンクなど追加可 */}
      <p className="mt-4 text-gray-700">
        {/* 仮の本文テキスト */}
        この記事の詳細本文（今はダミーテキスト）をここに表示します。この記事の詳細本文（今はダミーテキスト）をここに表示します。この記事の詳細本文（今はダミーテキスト）をここに表示します。この記事の詳細本文（今はダミーテキスト）をここに表示します。この記事の詳細本文（今はダミーテキスト）をここに表示します。この記事の詳細本文（今はダミーテキスト）をここに表示します。この記事の詳細本文（今はダミーテキスト）をここに表示します。この記事の詳細本文（今はダミーテキスト）をここに表示します。この記事の詳細本文（今はダミーテキスト）をここに表示します。この記事の詳細本文（今はダミーテキスト）をここに表示します。この記事の詳細本文（今はダミーテキスト）をここに表示します。
      </p>
    </div>
  );
}

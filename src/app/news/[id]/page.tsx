// app/news/[id]/page.tsx
import NewsDetail from "../../../components/news/NewsDetail";
import { fetchNews, RSSItem } from "../../../../utils/fetchNews";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const items = await fetchNews("AI活用 エンジニア");
  const item = items.find((it) => it.id === params.id);
  const title =
    (item && ("summary" in item ? (item as any).summary : (item as any).title)) ||
    "記事詳細";
  return { title };
}

type Props = { params: { id: string } };

export default async function NewsDetailPage({ params }: Props) {
  const { id } = params;
  // 一覧と同じキーワードで取得（未指定時の既定）
  const keyword = "AI活用 エンジニア";
  const items: RSSItem[] = await fetchNews(keyword);
  const item = items.find((it) => it.id === id);

  if (!item) return notFound();

  // NewsDetailの期待shapeへアダプト
  const article = {
    id: item.id,
    summary: ("summary" in item ? item.summary : undefined) ||
      ("title" in item ? item.title : undefined) ||
      ("contentSnippet" in item ? item.contentSnippet : ""),
    pubDate: (item as any).pubDate,
    content:
      ("content" in item ? (item as any).content : undefined) ||
      ("contentSnippet" in item ? item.contentSnippet : undefined) ||
      undefined,
    author: (item as any).author,
    category: (item as any).category,
    tags: (item as any).tags,
    sourceUrl: ("link" in item ? (item as any).link : (item as any).sourceUrl),
  } as const;

  return <NewsDetail article={article} />;
}

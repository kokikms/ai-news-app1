// app/news/[id]/page.tsx
import NewsDetail from "@/components/news/NewsDetail";
import newsList from "@/data/mockNews.json";

type Params = { params: Promise<{ id: string }> };

export default async function NewsDetailPage({ params }: Params) {
  const { id } = await params;
  const article = newsList.find((item) => item.id === id);
  if (!article) {
    // NotFound (app/not-found.tsx へ遷移)
    // throw new Error('Not Found') でもOK
    return null;
  }
  return <NewsDetail article={article} />;
}

// app/news/[id]/page.tsx
import NewsDetail from "@/components/news/NewsDetail";
import newsList from "@/data/mockNews.json";

type Params = { params: { id: string } };

export default function NewsDetailPage({ params }: Params) {
  const article = newsList.find((item) => item.id === params.id);
  if (!article) {
    // NotFound (app/not-found.tsx へ遷移)
    // throw new Error('Not Found') でもOK
    return null;
  }
  return <NewsDetail article={article} />;
}

// app/page.tsx
import NewsCard from "@/components/news/NewsCard";
// import { fetchNews } from '@/utils/fetchRSS'

export default function HomePage() {
  // const newsList = await fetchNews()
  // 仮データ読み込み
  const newsList = require("@/data/mockNews.json") as Article[];
  return (
    <div className="space-y-4">
      {newsList.map((item) => (
        <NewsCard key={item.id} article={item} />
      ))}
    </div>
  );
}

type Article = {
  id: string;
  summary: string;
  pubDate?: string;
};

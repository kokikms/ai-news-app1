// app/news/[id]/page.tsx
// 既存の詳細画面は一旦保留。現在はカードから外部記事へ遷移するため未使用。

export async function generateMetadata() {
  return { title: "記事詳細" };
}

export default async function NewsDetailPage() {
  return null;
}

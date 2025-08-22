// utils/fetchNews.ts
import { fetchRSS, RSSItem as RSSLive } from "./fetchRSS";
import { fetchMock, MockItem as RSSMock } from "./fetchMock";

export type RSSItem = RSSLive | RSSMock;

function toTime(item: RSSItem): number {
  const raw = (item as any).pubDate as string | undefined;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export async function fetchNews(
  keyword: string,
  opts?: { sort?: "date" | "relevance" }
): Promise<RSSItem[]> {
  const useMock = process.env.USE_MOCK === "true";
  const items = useMock
    ? await fetchMock(process.env.MOCK_DATA_PATH!)
    : await fetchRSS(keyword);

  // sort指定: relevanceはフィード順を尊重、dateは新しい順に並べ替え
  const sort = opts?.sort ?? "date";
  if (sort === "relevance") return items;
  return [...items].sort((a, b) => toTime(b) - toTime(a));
}

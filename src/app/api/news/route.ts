// app/api/news/route.ts
import { NextResponse } from "next/server";
import { fetchNews } from "../../../../utils/fetchNews";
import { DEFAULT_NEWS_QUERY } from "../../../../utils/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("keyword") || DEFAULT_NEWS_QUERY;
  const strict = searchParams.get("strict") === "true";
  const sort = searchParams.get("sort") === "relevance" ? "relevance" : "date";
  const when = searchParams.get("when"); // 例: 1d,7d,30d
  const excludes = searchParams.getAll("exclude"); // 例: exclude=cloud.google.com

  // キーワード加工
  let keyword = raw.trim();
  if (strict && !/^\s*".+"\s*$/.test(keyword)) {
    keyword = `"${keyword}"`;
  }
  if (when) keyword += ` when:${when}`;
  if (excludes.length > 0) {
    const parts = excludes
      .map((e) => e.trim())
      .filter(Boolean)
      .map((e) => (e.includes(" ") ? `-(${e})` : e))
      .map((e) => (e.includes(".") && !e.includes("site:") ? `-site:${e}` : `-${e}`));
    if (parts.length) keyword += ` ${parts.join(" ")}`;
  }

  try {
    const items = await fetchNews(keyword, { sort });
    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json({ error: "取得失敗" }, { status: 500 });
  }
}

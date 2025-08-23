// app/api/news/route.ts
import { NextResponse } from "next/server";
import { fetchNews } from "../../../../utils/fetchNews";
import { DEFAULT_NEWS_QUERY } from "../../../../utils/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("keyword") || DEFAULT_NEWS_QUERY;
  const strict = searchParams.get("strict") === "true";
  // sort: relevance/date/popularity を許可（デフォルトは新着順）
  const sortParam = searchParams.get("sort");
  const sort: "date" | "relevance" | "popularity" =
    sortParam === "relevance" ? "relevance" : sortParam === "popularity" ? "popularity" : "date";

  // lang: 指定がない場合は未指定のまま（人気タブで混在表示を可能にする）
  const langParam = searchParams.get("lang");
  const lang: "japanese" | "english" | undefined =
    langParam === "japanese" ? "japanese" : langParam === "english" ? "english" : undefined;
  const when = searchParams.get("when"); // 例: 1d,7d,30d
  const excludes = searchParams.getAll("exclude"); // 例: exclude=cloud.google.com
  const variate = (searchParams.get("variate") as any) || "day"; // none|day|hour
  const mix = (searchParams.get("mix") as any) || "balanced"; // balanced|none

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
    const items = await fetchNews(keyword, { sort, variate, mix, lang });
    
    // キャッシュ制御ヘッダーを追加
    const response = NextResponse.json(items);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (e) {
    return NextResponse.json({ error: "取得失敗" }, { status: 500 });
  }
}

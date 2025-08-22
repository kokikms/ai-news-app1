// app/api/news/route.ts
import { NextResponse } from "next/server";
import { fetchNews } from "../../../../utils/fetchNews";
import { DEFAULT_NEWS_QUERY } from "../../../../utils/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || DEFAULT_NEWS_QUERY;
  try {
    const items = await fetchNews(keyword);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "取得失敗" }, { status: 500 });
  }
}

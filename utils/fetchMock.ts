// utils/fetchMock.ts
import fs from "fs/promises";

export type MockItem = {
  id: string;
  summary: string;
  pubDate?: string;
  content?: string;
  author?: string;
  category?: string;
  tags?: string[];
  sourceUrl?: string;
};

function normalizeUrl(url?: string): string | undefined {
  if (!url) return url;
  const trimmed = url.trim();
  // Markdownリンク形式 [text](url) から () 内のURLを抽出
  const m = trimmed.match(/\[[^\]]*\]\((https?:\/\/[^)]+)\)/i);
  if (m && m[1]) return m[1];
  return trimmed;
}

export async function fetchMock(path: string): Promise<MockItem[]> {
  const raw = await fs.readFile(path, "utf-8");
  const data = JSON.parse(raw) as MockItem[];
  // URL正規化（sourceUrl が Markdown形式のケースに対応）
  return data.map((it: any) => {
    if ("sourceUrl" in it) {
      return { ...it, sourceUrl: normalizeUrl(it.sourceUrl) };
    }
    return it;
  });
}

// utils/fetchNews.ts
import { fetchRSS, RSSItem as RSSLive } from "./fetchRSS";
import { fetchMock, MockItem as RSSMock } from "./fetchMock";
import { fetchFeed } from "./fetchFeed";
import { getExtraFeedUrls } from "./feeds";
import { fetchX } from "./fetchX";

export type RSSItem = RSSLive | RSSMock;

function toTime(item: RSSItem): number {
  const raw = (item as any).pubDate as string | undefined;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export async function fetchNews(
  keyword: string,
  opts?: { sort?: "date" | "relevance"; variate?: "none" | "day" | "hour"; mix?: "balanced" | "none" }
): Promise<RSSItem[]> {
  const useMock = process.env.USE_MOCK === "true";
  if (useMock) {
    const items = await fetchMock(process.env.MOCK_DATA_PATH!);
    // モックはそのまま返却
    const sorted = [...items].sort((a, b) => toTime(b) - toTime(a));
    return applyVariation(sorted, opts?.variate ?? "none");
  }

  // Google News（クエリ反映）
  const primary = await fetchRSS(keyword);

  // 追加フィード（クエリ非対応も多いので簡易フィルタを適用）
  const extraUrls = getExtraFeedUrls();
  let extras: RSSLive[] = [];
  if (extraUrls.length > 0) {
    const lists = await Promise.allSettled(extraUrls.map((u) => fetchFeed(u)));
    extras = lists
      .filter((r): r is PromiseFulfilledResult<RSSLive[]> => r.status === "fulfilled")
      .flatMap((r) => r.value);

    // 簡易フィルタ: キーワード（クオートはフレーズ、-は除外）
    const matcher = buildMatcher(keyword);
    extras = extras.filter(matcher);
  }

  // X（オプション、有効なら取り込む）
  let xtweets: RSSLive[] = [];
  if (process.env.ENABLE_X === "true") {
    try {
      xtweets = await fetchX(keyword);
    } catch {
      xtweets = [];
    }
  }

  // マージ＆重複除去（link or titleで簡易判定）
  const map = new Map<string, RSSLive>();
  const put = (it: RSSLive) => {
    const key = (it.link || it.title).toLowerCase();
    if (!map.has(key)) map.set(key, it);
  };
  primary.forEach(put);
  extras.forEach(put);
  xtweets.forEach(put);
  let items: RSSLive[] = Array.from(map.values());

  // sort指定: relevanceはフィード順を尊重、dateは新しい順に並べ替え
  const sort = opts?.sort ?? "date";
  if (sort === "relevance") {
    // オプションでバランスミックス
    if ((opts?.mix ?? "balanced") === "balanced") {
      // Google:追加RSS:X = 2:1:1 の比率でミックス
      items = interleave3(primary, extras, xtweets, 1, 2, 3);
    }
    return applyVariation(items, opts?.variate ?? "day");
  }
  const sorted = [...items].sort((a, b) => toTime(b) - toTime(a));
  return applyVariation(sorted, opts?.variate ?? "day");
}

function buildMatcher(raw: string) {
  const text = (raw || "").trim();
  if (!text) return () => true;
  const phrases = Array.from(text.matchAll(/"([^"]+)"/g)).map((m) => m[1].toLowerCase());
  const unquoted = text.replace(/"([^"]+)"/g, " ").trim();
  const tokens = unquoted.split(/\s+/).filter(Boolean);
  const positives = tokens
    .filter((t) => !t.startsWith("-") && !t.includes(":"))
    .map((t) => t.toLowerCase());
  const negatives = [
    ...tokens.filter((t) => t.startsWith("-")).map((t) => t.slice(1).toLowerCase()),
  ];

  return (it: RSSLive) => {
    const hay = `${it.title || ""} ${it.contentSnippet || ""}`.toLowerCase();
    const phraseOk = phrases.length === 0 || phrases.some((p) => hay.includes(p));
    const positiveOk = positives.length === 0 || positives.some((p) => hay.includes(p));
    const negativeHit = negatives.some((n) => hay.includes(n));
    return phraseOk && positiveOk && !negativeHit;
  };
}

function interleave<A>(a: A[], b: A[], ra = 2, rb = 1): A[] {
  const out: A[] = [];
  let i = 0,
    j = 0;
  while (i < a.length || j < b.length) {
    for (let k = 0; k < ra && i < a.length; k++) out.push(a[i++]);
    for (let k = 0; k < rb && j < b.length; k++) out.push(b[j++]);
  }
  return out;
}

function interleave3<A>(a: A[], b: A[], c: A[], ra = 2, rb = 1, rc = 1): A[] {
  const out: A[] = [];
  let i = 0,
    j = 0,
    k = 0;
  while (i < a.length || j < b.length || k < c.length) {
    for (let x = 0; x < ra && i < a.length; x++) out.push(a[i++]);
    for (let x = 0; x < rb && j < b.length; x++) out.push(b[j++]);
    for (let x = 0; x < rc && k < c.length; x++) out.push(c[k++]);
  }
  return out;
}

function applyVariation<T>(items: T[], mode: "none" | "day" | "hour"): T[] {
  if (mode === "none") return items;
  const seed = mode === "hour" ? seedFromHour() : seedFromDay();
  return seededShuffle(items, seed, 12);
}

function seedFromDay() {
  const d = new Date();
  const key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
  return djb2(key);
}
function seedFromHour() {
  const d = new Date();
  const key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${d.getUTCHours()}`;
  return djb2(key);
}
function djb2(str: string) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return h >>> 0;
}
function seededShuffle<T>(arr: T[], seed: number, topN = 10): T[] {
  const out = arr.slice();
  const n = Math.min(topN, out.length);
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 1664525 + 1013904223) >>> 0; // LCG
    const j = i + (s % n - i + n) % (n - i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

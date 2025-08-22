// utils/fetchX.ts
// X(Twitter) Recent Search API からツイートを取得してニュース項目に正規化
// 必要環境変数:
// - X_BEARER_TOKEN: X APIのBearerトークン（サーバ側のみで使用）
// - X_RESULT_LIMIT: 取得件数（10-100, 省略時は20）
// - X_ENABLE_MEDIA_ONLY: "true" なら has:media を優先

import { stableId } from "./id";
import type { RSSItem as LiveItem } from "./fetchRSS";

type Tweet = {
  id: string;
  text: string;
  created_at?: string;
  lang?: string;
  author_id?: string;
  attachments?: { media_keys?: string[] };
  entities?: {
    urls?: { expanded_url?: string; display_url?: string }[];
  };
};

type User = { id: string; username: string; name: string };
type Media = { media_key: string; type: string; url?: string; preview_image_url?: string };

export async function fetchX(rawQuery: string): Promise<LiveItem[]> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) return [];

  const base = "https://api.twitter.com/2/tweets/search/recent";
  const langJa = "lang:ja";
  const noRT = "-is:retweet";
  const noReply = "-is:reply";
  const mediaPref = process.env.X_ENABLE_MEDIA_ONLY === "true" ? "has:media" : "(has:links OR has:media)";

  // 入力クエリはそのまま利用（UI側のstrictや除外語込み）
  const query = [rawQuery.trim(), langJa, noRT, noReply, mediaPref].filter(Boolean).join(" ");

  const params = new URLSearchParams({
    query,
    max_results: String(Math.min(100, Math.max(10, Number(process.env.X_RESULT_LIMIT) || 20))),
    "tweet.fields": "created_at,lang,entities",
    expansions: "author_id,attachments.media_keys",
    "user.fields": "username,name",
    "media.fields": "url,preview_image_url",
  });

  const res = await fetch(`${base}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    // Next.jsのfetchキャッシュは使わない（APIの都合で最新優先）
    cache: "no-store",
  });

  if (!res.ok) return [];
  const json = (await res.json()) as {
    data?: Tweet[];
    includes?: { users?: User[]; media?: Media[] };
  };

  const users = new Map<string, User>();
  const media = new Map<string, Media>();
  json.includes?.users?.forEach((u) => users.set(u.id, u));
  json.includes?.media?.forEach((m) => media.set(m.media_key, m));

  const items: LiveItem[] = (json.data || []).map((t, i) => {
    const user = t.author_id ? users.get(t.author_id) : undefined;
    const screen = user?.username;
    const link = screen ? `https://x.com/${screen}/status/${t.id}` : `https://x.com/i/web/status/${t.id}`;

    // メディア優先: photo.url > preview_image_url > entities.urls内の画像は無視
    let image: string | undefined;
    const keys = t.attachments?.media_keys || [];
    for (const k of keys) {
      const m = media.get(k);
      if (!m) continue;
      if (m.type === "photo" && m.url) {
        image = m.url;
        break;
      }
      if (!image && m.preview_image_url) image = m.preview_image_url;
    }

    const text = t.text || "";
    const oneline = text.replace(/\s+/g, " ").trim();

    return {
      id: stableId(undefined, link, i),
      title: oneline,
      link,
      pubDate: t.created_at || "",
      contentSnippet: oneline,
      enclosure: image ? { url: image } : undefined,
    };
  });

  return items;
}


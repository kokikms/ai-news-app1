// utils/fetchMock.ts
import fs from "fs/promises";
import type { RSSItem } from "./fetchNews"; // 型のみ参照に変更

export async function fetchMock(path: string): Promise<RSSItem[]> {
  const raw = await fs.readFile(path, "utf-8");
  return JSON.parse(raw);
}

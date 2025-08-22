// utils/id.ts
import crypto from "crypto";

export function hashLink(link: string): string {
  return crypto.createHash("sha1").update(link).digest("hex");
}

export function stableId(guid?: string | null, link?: string | null, idx?: number): string {
  if (guid && String(guid).trim().length > 0) return String(guid);
  if (link && String(link).trim().length > 0) return hashLink(String(link));
  return String(idx ?? "");
}


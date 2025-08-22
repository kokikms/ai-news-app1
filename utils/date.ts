// utils/date.ts
export function relativeTimeJa(isoOrRfc: string | undefined): string | undefined {
  if (!isoOrRfc) return undefined;
  const t = new Date(isoOrRfc).getTime();
  if (Number.isNaN(t)) return undefined;
  const diff = Date.now() - t;
  const sec = Math.max(1, Math.floor(diff / 1000));
  if (sec < 60) return `${sec}秒前`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}時間前`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}日前`;
  const week = Math.floor(day / 7);
  if (week < 5) return `${week}週間前`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month}ヶ月前`;
  const year = Math.floor(day / 365);
  return `${year}年前`;
}


// utils/fetchImage.ts

export async function fetchArticleImage(url: string): Promise<string | undefined> {
  try {
    // サーバーサイドでのみ実行（ブラウザではCORSエラーになるため）
    if (typeof window !== 'undefined') {
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return undefined;
    }

    const html = await response.text();
    
    // Open Graph画像を優先
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogMatch) {
      return ogMatch[1];
    }

    // Twitter Card画像
    const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (twitterMatch) {
      return twitterMatch[1];
    }

    // 最初のimgタグ
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) {
      return imgMatch[1];
    }

    return undefined;
  } catch (error) {
    console.warn(`Failed to fetch image from ${url}:`, error);
    return undefined;
  }
}

// 複数の記事の画像を並行して取得
export async function fetchArticleImages(urls: string[]): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();
  
  // 最大5件まで並行処理（サーバー負荷を考慮）
  const batchSize = 5;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const promises = batch.map(async (url) => {
      const imageUrl = await fetchArticleImage(url);
      if (imageUrl) {
        imageMap.set(url, imageUrl);
      }
    });
    
    await Promise.allSettled(promises);
  }
  
  return imageMap;
}

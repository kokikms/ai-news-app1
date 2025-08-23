// utils/popularity.ts

// 記事の人気度を計算する関数
export function calculatePopularityScore(item: any, windowDays: number = 14): number {
  let score = 0;

  // 1. 時間要素: 「過去2週間」内を優先。直近すぎる記事の過剰優遇は抑制
  const pubDate = new Date(item.pubDate);
  const now = new Date();
  const diffMs = now.getTime() - (isNaN(pubDate.getTime()) ? 0 : pubDate.getTime());
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (!isNaN(diffDays)) {
    if (diffDays <= windowDays) {
      // 0〜windowDays日に対して 25→12 くらいでゆるやかに減衰
      const withinBoost = 25 - Math.min(windowDays, diffDays) * (13 / windowDays);
      score += Math.max(12, Math.round(withinBoost));
    } else {
      // ウィンドウ外は軽い減点（古すぎる記事の上位表示を抑える）
      const overDays = Math.min(90, diffDays - windowDays); // 上限90日分で打ち止め
      score -= Math.round(Math.min(15, overDays * 0.5));
    }
  }

  // 2. 媒体の信頼度・人気度
  const domain = getDomainFromUrl(item.link);
  const domainScore = getDomainPopularityScore(domain);
  score += domainScore;
  
  // 3. タイトルの長さ（適度な長さを好む）
  const titleLength = item.title?.length || 0;
  if (titleLength >= 20 && titleLength <= 80) score += 10;
  else if (titleLength >= 10 && titleLength <= 100) score += 5;
  
  // 4. 内容の充実度
  const contentLength = item.contentSnippet?.length || 0;
  if (contentLength >= 100) score += 15;
  else if (contentLength >= 50) score += 10;
  else if (contentLength >= 20) score += 5;
  
  // 5. キーワードの人気度
  const keywordScore = getKeywordPopularityScore(item.title + ' ' + item.contentSnippet);
  score += keywordScore;
  
  // 6. ランダム要素（多様性を保つ）: 影響を弱める
  const randomFactor = Math.random() * 5;
  score += randomFactor;
  
  return Math.round(score);
}

// URLからドメインを抽出
function getDomainFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, '');
    return domain;
  } catch {
    return '';
  }
}

// ドメインの人気度スコア
function getDomainPopularityScore(domain: string): number {
  const domainScores: Record<string, number> = {
    // 日本の主要メディア
    'itmedia.co.jp': 30,
    'gizmodo.jp': 25,
    'engadget.com': 25,
    'techcrunch.com': 30,
    'cnet.com': 25,
    'zdnet.com': 25,
    'wired.com': 30,
    'arstechnica.com': 25,
    'theverge.com': 30,
    'venturebeat.com': 25,
    'techradar.com': 20,
    'digitaltrends.com': 20,
    'slashgear.com': 15,
    'techspot.com': 20,
    
    // 日本のテックメディア
    'k-tai.watch.impress.co.jp': 20,
    'forest.watch.impress.co.jp': 20,
    'jp.techcrunch.com': 25,
    
    // Google News（中程度）
    'news.google.com': 15,
  };
  
  return domainScores[domain] || 10; // デフォルトスコア
}

// キーワードの人気度スコア
function getKeywordPopularityScore(text: string): number {
  const popularKeywords: Record<string, number> = {
    // AI関連（高人気）
    'ai': 20, '人工知能': 20, 'chatgpt': 25, 'gpt': 20, 'claude': 20, 'copilot': 20,
    '生成ai': 25, '機械学習': 20, 'ディープラーニング': 20, 'llm': 20,
    
    // 最新技術（高人気）
    'iphone': 15, 'android': 15, 'スマートフォン': 15, 'スマホ': 15,
    'apple': 20, 'google': 20, 'microsoft': 20, 'amazon': 20,
    'tesla': 20, 'spacex': 20, 'openai': 25, 'anthropic': 20,
    
    // ゲーム・エンターテイメント（中程度）
    'ゲーム': 10, 'game': 10, 'nintendo': 15, 'sony': 15, 'playstation': 15,
    'xbox': 15, 'steam': 10, 'vr': 15, 'ar': 15, 'メタバース': 15,
    
    // セキュリティ（中程度）
    'セキュリティ': 15, 'security': 15, 'ハッキング': 15, 'hacking': 15,
    '暗号': 10, 'crypto': 10, 'blockchain': 15, 'bitcoin': 15,
    
    // ビジネス（中程度）
    'スタートアップ': 15, 'startup': 15, '投資': 15, 'investment': 15,
    'ipo': 20, '資金調達': 15, 'funding': 15, 'exit': 15,
    
    // クラウド・インフラ（中程度）
    'クラウド': 15, 'cloud': 15, 'aws': 20, 'azure': 20, 'gcp': 20,
    'インフラ': 10, 'infrastructure': 10, 'devops': 15,
  };
  
  const lowerText = text.toLowerCase();
  let score = 0;
  
  Object.entries(popularKeywords).forEach(([keyword, points]) => {
    if (lowerText.includes(keyword.toLowerCase())) {
      score += points;
    }
  });
  
  return score;
}

// 人気記事を抽出する関数
export function getPopularArticles(items: any[], count: number = 10, windowDays: number = 14): any[] {
  const now = new Date();
  const cutoff = now.getTime() - windowDays * 24 * 60 * 60 * 1000;

  // ウィンドウ内・外に分割
  const inWindow = [] as any[];
  const outWindow = [] as any[];

  for (const item of items) {
    const t = new Date(item.pubDate).getTime();
    if (!isNaN(t) && t >= cutoff) inWindow.push(item); else outWindow.push(item);
  }

  // スコアリング（ウィンドウ内優先のスコアリングを利用）
  const scoreIn = inWindow.map(item => ({ ...item, popularityScore: calculatePopularityScore(item, windowDays) }));
  const scoreOut = outWindow.map(item => ({ ...item, popularityScore: calculatePopularityScore(item, windowDays) }));

  // 並べ替え
  const sortedIn = scoreIn.sort((a, b) => b.popularityScore - a.popularityScore);
  const sortedOut = scoreOut.sort((a, b) => b.popularityScore - a.popularityScore);

  const merged = [...sortedIn, ...sortedOut];
  return merged.slice(0, count);
}

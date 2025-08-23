// utils/fetchNews.ts
import { fetchRSS, RSSItem as RSSLive } from "./fetchRSS";
import { fetchMock, MockItem as RSSMock } from "./fetchMock";
import { fetchFeed } from "./fetchFeed";
import { getExtraFeedUrls } from "./feeds";
import { fetchX } from "./fetchX";
import { getPopularArticles } from "./popularity";

export type RSSItem = RSSLive | RSSMock;

function toTime(item: RSSItem): number {
  const raw = (item as any).pubDate as string | undefined;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

// 英語の記事かどうかを判定する関数（現在は使用していません）
function isEnglishArticle(item: RSSLive): boolean {
  const text = `${item.title || ""} ${item.contentSnippet || ""}`;
  // 日本語文字が含まれているかチェック
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
  // 英語の割合が高いかチェック（アルファベットの割合）
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length;
  const englishRatio = totalChars > 0 ? englishChars / totalChars : 0;
  
  // 日本語が含まれていない、かつ英語の割合が70%以上の場合を英語記事と判定
  return !hasJapanese && englishRatio > 0.7;
}

// 記事の関連度を計算する関数
function calculateRelevanceScore(item: RSSLive, keyword: string): number {
  const text = `${item.title || ""} ${item.contentSnippet || ""}`.toLowerCase();
  const keywordLower = keyword.toLowerCase();
  
  let score = 0;
  
  // キーワードの完全一致（高いスコア）
  if (text.includes(keywordLower)) {
    score += 10;
  }
  
  // キーワードの部分一致
  const keywordWords = keywordLower.split(/\s+/).filter(word => word.length > 1);
  keywordWords.forEach(word => {
    if (text.includes(word)) {
      score += 3;
    }
  });
  
  // タイトルでの一致（より重要）
  const title = (item.title || "").toLowerCase();
  keywordWords.forEach(word => {
    if (title.includes(word)) {
      score += 5;
    }
  });
  
  // 記事の新鮮度（新しい記事を少し優先）
  const pubDate = new Date(item.pubDate);
  const now = new Date();
  const diffHours = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60);
  if (diffHours < 24) score += 2;
  if (diffHours < 6) score += 1;
  
  return score;
}

// 記事の重複を判定する関数
function isDuplicateArticle(item1: RSSLive, item2: RSSLive): boolean {
  const title1 = (item1.title || "").toLowerCase().trim();
  const title2 = (item2.title || "").toLowerCase().trim();
  const content1 = (item1.contentSnippet || "").toLowerCase().trim();
  const content2 = (item2.contentSnippet || "").toLowerCase().trim();
  
  // タイトルが完全に一致する場合
  if (title1 === title2) return true;
  
  // タイトルが部分的に一致する場合（長い方の80%以上が一致）
  const longerTitle = title1.length > title2.length ? title1 : title2;
  const shorterTitle = title1.length > title2.length ? title2 : title1;
  
  if (shorterTitle.length > 10 && longerTitle.includes(shorterTitle)) {
    const similarity = shorterTitle.length / longerTitle.length;
    if (similarity > 0.8) return true;
  }
  
  // キーワードの重複度をチェック（タイトル）
  const titleWords1 = title1.split(/\s+/).filter(word => word.length > 2);
  const titleWords2 = title2.split(/\s+/).filter(word => word.length > 2);
  
  if (titleWords1.length > 0 && titleWords2.length > 0) {
    const commonTitleWords = titleWords1.filter(word => titleWords2.includes(word));
    const titleSimilarity = commonTitleWords.length / Math.max(titleWords1.length, titleWords2.length);
    if (titleSimilarity > 0.7) return true;
  }
  
  // 内容の類似性もチェック（より厳密な判定）
  const contentWords1 = content1.split(/\s+/).filter(word => word.length > 2);
  const contentWords2 = content2.split(/\s+/).filter(word => word.length > 2);
  
  if (contentWords1.length > 5 && contentWords2.length > 5) {
    const commonContentWords = contentWords1.filter(word => contentWords2.includes(word));
    const contentSimilarity = commonContentWords.length / Math.max(contentWords1.length, contentWords2.length);
    if (contentSimilarity > 0.6) return true;
  }
  
  // 特定のパターンをチェック（「- サイト名」のような末尾の違いを無視）
  const cleanTitle1 = title1.replace(/\s*-\s*[^-]+$/, '').trim();
  const cleanTitle2 = title2.replace(/\s*-\s*[^-]+$/, '').trim();
  
  if (cleanTitle1 === cleanTitle2 && cleanTitle1.length > 10) return true;
  
  return false;
}

// 重複記事を排除する関数（Google Newsを優先的に排除）
function removeDuplicateArticles(items: RSSLive[]): RSSLive[] {
  const result: RSSLive[] = [];
  const duplicates = new Set<number>();
  
  for (let i = 0; i < items.length; i++) {
    if (duplicates.has(i)) continue;
    
    const currentItem = items[i];
    const isGoogleNews = currentItem.link.includes('news.google.com');
    
    // 他の記事と比較
    for (let j = i + 1; j < items.length; j++) {
      if (duplicates.has(j)) continue;
      
      const compareItem = items[j];
      const isCompareGoogleNews = compareItem.link.includes('news.google.com');
      
      if (isDuplicateArticle(currentItem, compareItem)) {
        // Google Newsの記事を優先的に排除
        if (isGoogleNews && !isCompareGoogleNews) {
          duplicates.add(i);
          break;
        } else if (!isGoogleNews && isCompareGoogleNews) {
          duplicates.add(j);
        } else {
          // 両方ともGoogle Newsまたは両方とも他サイトの場合、後者を排除
          duplicates.add(j);
        }
      }
    }
    
    if (!duplicates.has(i)) {
      result.push(currentItem);
    }
  }
  
  return result;
}

// 記事の内容に基づいてデフォルト画像を選択
function getDefaultImageForArticle(item: RSSLive): string | undefined {
  const text = `${item.title || ""} ${item.contentSnippet || ""}`.toLowerCase();
  
  // AI・機械学習関連
  if (text.includes('ai') || text.includes('人工知能') || text.includes('機械学習') || text.includes('chatgpt') || text.includes('gpt') || text.includes('claude') || text.includes('copilot') || text.includes('llm') || text.includes('deep learning')) { 
    const aiImages = [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1502767089025-6572583495b4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1448932223592-d1fc686e76ea?w=400&h=300&fit=crop',
    ];
    return aiImages[Math.floor(Math.random() * aiImages.length)];
  }
  
  // プログラミング・開発関連
  if (text.includes('プログラミング') || text.includes('開発') || text.includes('コード') || text.includes('software') || text.includes('開発者') || text.includes('エンジニア') || text.includes('engineer') || text.includes('coding') || text.includes('programming') || text.includes('developer')) {
    const devImages = [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101178521-c47d9981ab1d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop',
    ];
    return devImages[Math.floor(Math.random() * devImages.length)];
  }
  
  // モバイル・スマートフォン関連
  if (text.includes('スマートフォン') || text.includes('スマホ') || text.includes('iphone') || text.includes('android') || text.includes('mobile') || text.includes('アプリ') || text.includes('app') || text.includes('スマートフォン') || text.includes('smartphone')) {
    const mobileImages = [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1502767089025-6572583495b4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101178521-c47d9981ab1d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1448932223592-d1fc686e76ea?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop',
    ];
    return mobileImages[Math.floor(Math.random() * mobileImages.length)];
  }
  
  // クラウド・インフラ関連
  if (text.includes('クラウド') || text.includes('cloud') || text.includes('aws') || text.includes('azure') || text.includes('gcp') || text.includes('インフラ') || text.includes('infrastructure') || text.includes('サーバー') || text.includes('server') || text.includes('devops')) {
    const cloudImages = [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=400&h=300&fit=crop',  
      'https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101178521-c47d9981ab1d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101178521-c47d9981ab1d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop',
    ];
    return cloudImages[Math.floor(Math.random() * cloudImages.length)];
  }
  
  // セキュリティ・サイバー関連
  if (text.includes('セキュリティ') || text.includes('security') || text.includes('サイバー') || text.includes('cyber') || text.includes('ハッキング') || text.includes('hacking') || text.includes('暗号') || text.includes('crypto') || text.includes('blockchain') || text.includes('bitcoin')) {
    const securityImages = [
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101178521-c47d9981ab1d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1502767089025-6572583495b4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop',
    ];
    return securityImages[Math.floor(Math.random() * securityImages.length)];
  }
  
  // データ・分析関連
  if (text.includes('データ') || text.includes('data') || text.includes('分析') || text.includes('analytics') || text.includes('ビッグデータ') || text.includes('big data') || text.includes('統計') || text.includes('statistics') || text.includes('machine learning') || text.includes('ml')) {
    const dataImages = [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
    ];
    return dataImages[Math.floor(Math.random() * dataImages.length)];
  }
  
  // ゲーム・エンターテイメント関連
  if (text.includes('ゲーム') || text.includes('game') || text.includes('エンターテイメント') || text.includes('entertainment') || text.includes('vr') || text.includes('ar') || text.includes('メタバース') || text.includes('metaverse') || text.includes('nft')) {
    const gameImages = [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop'
    ];
    return gameImages[Math.floor(Math.random() * gameImages.length)];
  }
  
  // スタートアップ・ベンチャー関連
  if (text.includes('スタートアップ') || text.includes('startup') || text.includes('ベンチャー') || text.includes('venture') || text.includes('投資') || text.includes('investment') || text.includes('資金調達') || text.includes('funding') || text.includes('ipo') || text.includes('exit')) {
    const startupImages = [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
    ];
    return startupImages[Math.floor(Math.random() * startupImages.length)];
  }
  
  // 企業・ビジネス関連
  if (text.includes('企業') || text.includes('ビジネス') || text.includes('business') || text.includes('会社') || text.includes('corporate') || text.includes('経営') || text.includes('management') || text.includes('ceo') || text.includes('cto') || text.includes('cfo')) {
    const businessImages = [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
    ];
    return businessImages[Math.floor(Math.random() * businessImages.length)];
  }
  
  // テクノロジー全般
  if (text.includes('テクノロジー') || text.includes('技術') || text.includes('tech') || text.includes('innovation') || text.includes('革新') || text.includes('未来') || text.includes('future') || text.includes('digital') || text.includes('automation')) {
    const techImages = [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ];
    return techImages[Math.floor(Math.random() * techImages.length)];
  }
  
  // デフォルト画像（多様なバリエーション）
  const defaultImages = [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop'
  ];
  return defaultImages[Math.floor(Math.random() * defaultImages.length)];
}

export async function fetchNews(
  keyword: string,
  opts?: { sort?: "date" | "relevance" | "popularity"; variate?: "none" | "day" | "hour"; mix?: "balanced" | "none"; lang?: "japanese" | "english" }
): Promise<RSSItem[]> {
  const useMock = process.env.USE_MOCK === "true";
  if (useMock) {
    const items = await fetchMock(process.env.MOCK_DATA_PATH!);
    // モックはそのまま返却
    const sorted = [...items].sort((a, b) => toTime(b) - toTime(a));
    return applyVariation(sorted, opts?.variate ?? "none");
  }

  // 複数の時間範囲で検索して多様性を確保
  const timeRanges = ["1h", "6h", "1d", "7d"]; // より短い時間範囲を追加
  const allPrimary: RSSLive[] = [];
  
  for (const timeRange of timeRanges) {
    try {
      const timeKeyword = keyword.includes("when:") ? keyword : `${keyword} when:${timeRange}`;
      const items = await fetchRSS(timeKeyword);
      allPrimary.push(...items);
    } catch (error) {
      console.warn(`Failed to fetch RSS for time range ${timeRange}:`, error);
    }
  }

  // 重複除去（link or titleで簡易判定）
  const primaryMap = new Map<string, RSSLive>();
  allPrimary.forEach(item => {
    const key = (item.link || item.title).toLowerCase();
    if (!primaryMap.has(key)) {
      primaryMap.set(key, item);
    }
  });
  const primary = Array.from(primaryMap.values());

  // 追加フィード（クエリ非対応も多いので簡易フィルタを適用）
  const extraUrls = getExtraFeedUrls();
  let extras: RSSLive[] = [];
  if (extraUrls.length > 0) {
    const lists = await Promise.allSettled(extraUrls.map((u) => fetchFeed(u)));
    extras = lists
      .filter((r): r is PromiseFulfilledResult<RSSLive[]> => r.status === "fulfilled")
      .flatMap((r) => r.value);

    // 追加フィードのフィルタリングを緩和（より多くの記事を表示）
    if (keyword && keyword.trim() !== '') {
      const matcher = buildMatcher(keyword);
      extras = extras.filter(matcher);
    }
    // キーワードが空の場合は全記事を表示
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

  // 言語フィルタリング
  const lang = opts?.lang;
  
  // 言語に基づいてフィルタリング
  const filterByLanguage = (items: RSSLive[]): RSSLive[] => {
    // 言語が指定されていない場合はフィルタリングしない（人気記事タブ用）
    if (!lang) {
      return items;
    }
    
    return items.filter(item => {
      const text = `${item.title || ""} ${item.contentSnippet || ""}`;
      
      if (lang === "japanese") {
        // 日本語記事: 日本語文字が含まれている記事
        return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
      } else {
        // 英語記事: 日本語文字が含まれていない記事
        return !/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
      }
    });
  };

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
  
  // 言語フィルタリングを適用
  items = filterByLanguage(items);
  
  // 重複記事を排除（Google Newsを優先的に排除）
  items = removeDuplicateArticles(items);

  // Google News記事にデフォルト画像を設定
  items = items.map(item => {
    // 画像がない場合のみデフォルト画像を設定
    if (!item.enclosure?.url) {
      const defaultImage = getDefaultImageForArticle(item);
      if (defaultImage) {
        return {
          ...item,
          enclosure: { url: defaultImage }
        };
      }
    }
    return item;
  });

  // 画像がまだない記事にもデフォルト画像を設定
  items = items.map(item => {
    if (!item.enclosure?.url) {
      const defaultImage = getDefaultImageForArticle(item);
      return {
        ...item,
        enclosure: { url: defaultImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop' }
      };
    }
    return item;
  });

  // sort指定: relevanceはフィード順を尊重、dateは新しい順に並べ替え、popularityは人気度順
  const sort = opts?.sort ?? "date";
  if (sort === "relevance") {
    // 関連度スコアでソート
    const scoredItems = items.map(item => ({
      item,
      score: calculateRelevanceScore(item, keyword)
    }));
    
    // スコアの高い順にソート
    const sortedByRelevance = scoredItems
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
    
    // オプションでバランスミックス
    if ((opts?.mix ?? "balanced") === "balanced") {
      // Google:追加RSS:X = 2:1:1 の比率でミックス
      return interleave3(primary, extras, xtweets, 1, 2, 3);
    }
    
    return applyVariation(sortedByRelevance, opts?.variate ?? "day");
  } else if (sort === "popularity") {
    // 人気度順でソート
    const popularItems = getPopularArticles(items, items.length);
    return popularItems;
  }
  
  // 新着順の場合は確実に時間順でソート（バリエーションは適用しない）
  const sorted = [...items].sort((a, b) => toTime(b) - toTime(a));
  return sorted;
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
    
    // 追加フィードの場合はより緩いフィルタリングを適用
    const isExtraFeed = !it.link.includes('news.google.com');
    if (isExtraFeed) {
      // 追加フィードの場合は、キーワードが1つでも含まれていれば表示
      return phraseOk && (positives.length === 0 || positives.some((p) => hay.includes(p))) && !negativeHit;
    }
    
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

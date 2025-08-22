// utils/feeds.ts

export function getExtraFeedUrls(): string[] {
  const raw = process.env.EXTRA_RSS_FEEDS || "";
  const envFeeds = raw
    .split(/[\n,]/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  
  // デフォルトの追加フィード（AI・テックニュース関連）
  const defaultFeeds = [
    // リアルタイム性の高い日本のニュースソース
    "https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml", // ITmedia
    "https://rss.itmedia.co.jp/rss/2.0/itmedia_enterprise.xml", // ITmedia エンタープライズ
    "https://www.gizmodo.jp/index.xml", // Gizmodo Japan
    "https://k-tai.watch.impress.co.jp/rss/index.xml", // ケータイWatch
    "https://forest.watch.impress.co.jp/rss/index.xml", // 窓の杜
    "https://www.gizmodo.jp/index.xml", // Gizmodo Japan
    "https://www.engadget.com/rss.xml", // Engadget
    "https://jp.techcrunch.com/feed/", // TechCrunch Japan
    "https://www.cnet.com/rss/all/", // CNET
    "https://www.zdnet.com/news/rss.xml", // ZDNet
    
    // 海外のリアルタイムニュースソース
    "https://feeds.feedburner.com/TechCrunch", // TechCrunch
    "https://www.wired.com/feed/rss", // Wired
    "https://feeds.arstechnica.com/arstechnica/index", // Ars Technica
    "https://www.theverge.com/rss/index.xml", // The Verge
    "https://feeds.feedburner.com/venturebeat/SZYF", // VentureBeat
    "https://www.zdnet.com/news/rss.xml", // ZDNet
    
    // より頻繁に更新されるソース
    "https://www.techradar.com/rss", // TechRadar
    "https://www.digitaltrends.com/feed/", // Digital Trends
    "https://www.slashgear.com/feed/", // SlashGear
    "https://www.techspot.com/rss.xml", // TechSpot
  ];
  
  return [...envFeeds, ...defaultFeeds];
}


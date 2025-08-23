// utils/tags.ts

// タグの定義
export const TAG_CATEGORIES = {
  AI: ['AI', '人工知能', '機械学習', 'ML', 'ディープラーニング', 'ChatGPT', 'OpenAI', 'Gemini', 'Claude'],
  ENGINEERING: ['エンジニア', 'プログラミング', '開発', 'コード', '技術', 'テック', 'IT', 'ソフトウェア'],
  BUSINESS: ['企業', '導入', '活用', 'ビジネス', '経営', '戦略', 'ROI', '投資'],
  TOOLS: ['ツール', 'サービス', 'プラットフォーム', 'アプリ', 'ソフトウェア'],
  NEWS: ['ニュース', '発表', 'リリース', 'アップデート', '新機能'],
  TUTORIAL: ['チュートリアル', 'ガイド', '使い方', '実装', 'サンプル'],
  RESEARCH: ['研究', '論文', '調査', '分析', 'データ'],
  TRENDS: ['トレンド', '流行', '注目', '話題', '人気']
} as const;

export type TagCategory = keyof typeof TAG_CATEGORIES;

// 記事の内容からタグを自動生成する関数
export function generateTags(title: string, content?: string): TagCategory[] {
  const text = `${title} ${content || ''}`.toLowerCase();
  const tags: TagCategory[] = [];

  // 各カテゴリのキーワードをチェック
  Object.entries(TAG_CATEGORIES).forEach(([category, keywords]) => {
    const hasKeyword = keywords.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
    if (hasKeyword) {
      tags.push(category as TagCategory);
    }
  });

  return tags;
}

// タグの表示名を取得する関数
export function getTagDisplayName(category: TagCategory): string {
  const displayNames: Record<TagCategory, string> = {
    AI: '🤖 AI',
    ENGINEERING: '⚙️ エンジニア',
    BUSINESS: '💼 ビジネス',
    TOOLS: '🛠️ ツール',
    NEWS: '📰 ニュース',
    TUTORIAL: '📚 チュートリアル',
    RESEARCH: '🔬 研究',
    TRENDS: '📈 トレンド'
  };
  return displayNames[category];
}

// タグの色を取得する関数
export function getTagColor(category: TagCategory): string {
  const colors: Record<TagCategory, string> = {
    AI: 'bg-purple-100 text-purple-800',
    ENGINEERING: 'bg-blue-100 text-blue-800',
    BUSINESS: 'bg-green-100 text-green-800',
    TOOLS: 'bg-orange-100 text-orange-800',
    NEWS: 'bg-red-100 text-red-800',
    TUTORIAL: 'bg-yellow-100 text-yellow-800',
    RESEARCH: 'bg-indigo-100 text-indigo-800',
    TRENDS: 'bg-pink-100 text-pink-800'
  };
  return colors[category];
}

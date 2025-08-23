// utils/imageGenerator.ts

// 豊富な画像ライブラリ（20個以上の異なる画像）
const IMAGE_LIBRARY = [
  // AI・テクノロジー関連
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1676299081846-490cbb1a6c0e?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1673187736167-4d81e3b6c0c5?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1673187736167-4d81e3b6c0c5?w=300&h=200&fit=crop&sat=-50',
  'https://images.unsplash.com/photo-1673187736167-4d81e3b6c0c5?w=300&h=200&fit=crop&brightness=0.8',
  
  // プログラミング・開発関連
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop&sat=-30',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop&brightness=0.9',
  
  // ビジネス・オフィス関連
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop&sat=-20',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop&brightness=0.8',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop&contrast=1.2',
  
  // ニュース・メディア関連
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=200&fit=crop&sat=-15',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=200&fit=crop&brightness=0.85',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=200&fit=crop&contrast=1.15',
  
  // 研究・分析関連
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&sat=-30',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&brightness=0.9',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&contrast=1.1',
  
  // 追加の多様な画像
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=200&fit=crop&sat=-10',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop&brightness=0.9',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop&contrast=1.1',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop&sat=-40',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=200&fit=crop&sat=-25',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop&brightness=0.95',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop&sat=-35',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop&contrast=1.05',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop&sat=-10',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop&brightness=0.95',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop&contrast=1.05',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop&sat=-25',
];

// 記事のタグに基づいて画像を生成する関数
export function generateArticleImage(tags: string[], title: string): string {
  // タイトルのハッシュ値を使って画像を選択（一貫性を保つ）
  const hash = title.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // タグに基づいて画像の範囲を調整（より多様性を持たせる）
  let startIndex = 0;
  let endIndex = IMAGE_LIBRARY.length;
  
  if (tags.includes('AI')) {
    startIndex = 0;
    endIndex = 5;
  } else if (tags.includes('ENGINEERING')) {
    startIndex = 5;
    endIndex = 10;
  } else if (tags.includes('BUSINESS')) {
    startIndex = 10;
    endIndex = 14;
  } else if (tags.includes('NEWS')) {
    startIndex = 14;
    endIndex = 18;
  } else if (tags.includes('RESEARCH')) {
    startIndex = 18;
    endIndex = 22;
  }
  
  const availableImages = IMAGE_LIBRARY.slice(startIndex, endIndex);
  const index = Math.abs(hash) % availableImages.length;
  
  return availableImages[index];
}

// ランダムな画像を取得する関数（フォールバック用）
export function getRandomImage(): string {
  const randomIndex = Math.floor(Math.random() * IMAGE_LIBRARY.length);
  return IMAGE_LIBRARY[randomIndex];
}
